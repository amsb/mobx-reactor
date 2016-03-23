import { observable, isObservable } from 'mobx'
import { scheduleAction } from './actions'


export class Store {
  constructor(state={}, middleware=[]) {
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
      Object.keys(prototype.__actions__).forEach((actionType) => {
        let actions = prototype.__actions__[actionType].map(
          ({ methodName, ...other }) => {
            return { func: object[methodName], ...other }
          })
        if(!this.actions.hasOwnProperty(actionType)) {
          this.actions[actionType] = []
        }
        Array.prototype.push.apply(this.actions[actionType], actions)
      })
    }
  }

  addAction(actionType, func, options={}) {
    if(!this.actions.hasOwnProperty(actionType)) {
      this.actions[actionType] = []
    }
    this.actions[actionType].push({ func, displayName: func.name, ...options })
  }

  dispatch = (actionType, options={}) => {
    const delay = options.delay || 0
    return (...payload) => {
      const middleware = this.middleware.map(m => m(actionType, options, payload))
      const errorbacks = middleware.map(m => m.next().value).filter(f => f != null)

      const promises = []
      if(this.actions.hasOwnProperty(actionType)) {
        this.actions[actionType].forEach(({ func, displayName }) => {
          let meta = { name: displayName, func }
          try {
            let actionResult = func(...payload)
            promises.push(
              Promise.resolve(
                actionResult
              ).then(
                (result) => {
                  middleware.reduce((result,m) => m.next({result, ...meta}),
                    {result, meta})
                }
              ).catch(
                (error) => {
                  errorbacks.map(eb => eb({error, ...meta}))
                }
              )
            )
          } catch(error) {
            errorbacks.map(eb => eb({error, ...meta}))
          }
        })
      }
      return Promise.all(promises).then(
        (result) => {
          middleware.map((m) => m.next())
        }
      )
    }
  }
}
