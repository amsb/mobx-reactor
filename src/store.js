import { observable, isObservable } from 'mobx'
import { scheduleAction } from './actions'


export class Store {
  constructor(state={}, middleware=[], options={}) {
    this.state = {}
    this.actions = {}
    this.addAction('scheduleAction', scheduleAction)
    Object.keys(state).forEach((key) => { this.addState(key, state[key]) })
    this.middleware = middleware.map(m => m(this))
  }

  addState(key, object) {
    if (this.state.hasOwnProperty(key)) {
      throw Error("An object already exsits for key " + key)
    }
    this.state[key] = object
    const prototype = Object.getPrototypeOf(object)
    if(prototype.hasOwnProperty('__actions__')) {
      Object.keys(prototype.__actions__).forEach(type => {
        let actions = prototype.__actions__[type].map(
          ({ methodName, ...other }) => {
            const func = object[methodName]
            func.displayName = other.displayName
            return { func , ...other }
          })
        if(!this.actions.hasOwnProperty(type)) {
          this.actions[type] = []
        }
        Array.prototype.push.apply(this.actions[type], actions)
      })
    }
  }

  addAction(type, func, options={}) {
    if(!this.actions.hasOwnProperty(type)) {
      this.actions[type] = []
    }
    this.actions[type].push({ func, displayName: func.name, ...options })
  }

  dispatch = (type, options={}) => {
    return (...payload) => {
      const action = { type, options, payload }

      // INITIALIZE middleware
      const middleware = this.middleware.map(m => m(action))
      middleware.map(m => m.next()) // step to first yield

      // execute action responders
      const promises = []
      if(this.actions.hasOwnProperty(type)) {
        this.actions[type].forEach(({ func }) => {

          try {
            // CALL action responder inside middleware
            // through cascading function calls like this:
            // m[0].next(p => m[1].next(p => m[2].next(func).value).value).value
            const result = middleware.reduceRight((f,m) => {
                const nextFunc = p => m.next(f).value
                nextFunc.displayName = func.displayName
                return nextFunc
            }, func)(...action.payload)
            promises.push(result)
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.error(error)
            }
          }
        })
      }

      // tell middleware all action responders have STARTED
      middleware.map(m => m.next())

      // return promise for all action responders
      return Promise.all(promises).then(
        (result) => {
          // tell middleware all action responders have COMPLETED
          middleware.map((m) => m.next())
        }
      )
    }
  }
}
