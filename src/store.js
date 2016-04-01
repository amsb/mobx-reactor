import { observable, isObservable } from 'mobx'
//import { scheduleAction } from './actions'


export class Store {
  constructor(state={}, middleware=[]) {
    this.state = {}
    this.actions = {}
    // this.addAction('scheduleAction', scheduleAction)
    Object.keys(state).forEach((key) => { this.addState(key, state[key]) })
    this.middleware = middleware.map(m => m(this))
  }

  addState(key, object) {
    if (this.state.hasOwnProperty(key)) {
      throw Error("A state object already exists for key " + key)
    }
    this.state[key] = object
    const prototype = Object.getPrototypeOf(object)
    if(prototype.hasOwnProperty('__actions__')) {
      Object.keys(prototype.__actions__).forEach((type) => {
        let actions = prototype.__actions__[type].map(
          ({ methodName, ...other }) => {
            const func = object[methodName]
            func.displayName = other.displayName
            return { func , object, ...other }
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
    func.displayName = func.name
    this.actions[type].push({ func, ...options })
  }

  dispatch(type, options={}) {
    const delay = options.delay || 0

    return (...payload) => {
      const handlers = (this.actions.hasOwnProperty(type)
        ? this.actions[type]
        : [])

      const action = { type, options, payload, funcs: handlers.map(a => a.func) }

      const middlewareFactories = this.middleware.map(m => m(action))

      const promises = []
      handlers.forEach(({ func }) => {
        const middlewareGenerators = middlewareFactories.map(m => m(func))
        middlewareGenerators.forEach(m => m.next())

        try {
          let stepper = func(...payload) // sync if regular function, async if generator

          if (!isGeneratorIterable(stepper)) {
            const stepValue = stepper
            stepper = { next: function() { return { value: stepValue, done: true } } }
          }

          promises.push(new Promise(
            (resolve, reject) => {
              const processStep = ({ value: effect, done }) => {
                middlewareGenerators.forEach(m => m.next({ effect, done }))

                const proccessEffect = (result, method='next') => {
                  middlewareGenerators.forEach(m => m[method](result))
                  if (!done) {
                    try {
                      let step = stepper[method](result)
                      processStep(step)
                    } catch (error) {
                      middlewareGenerators.forEach(m => m.throw(error))
                      reject(error) // well-behaved action handlers should not throw errors
                    }
                  } else {
                    //middlewareGenerators.forEach(m => m.next())
                    resolve()
                  }
                }

                if (effect) {
                  switch (effect.type) {

                    case 'dispatch':
                      const action = effect.payload
                      this.dispatch(action.type, action.options || {})(
                        ...(action.payload || []))
                        proccessEffect(null)
                      break

                    case 'call':
                      const { func, args } = effect.payload
                      Promise.resolve(
                        func(...args)
                      ).then(
                        result => { proccessEffect(result) },
                        error => { proccessEffect(error, 'throw') }
                      )
                      break

                    default:
                      console.error('unknown effect type:', effect)

                  }
                }
              }

              processStep(stepper.next())
            }
          ))

        } catch (error) {
          middlewareGenerators.forEach(m => m.throw(error))
          promises.push(Promise.reject(error)) // well-behaved action handlers should not throw errors
        }

      })

      return Promise.all(promises)
    }
  }
}

function isGeneratorIterable(value) {
  return (
    value !== null
    && value !== undefined
    && 'next' in value
    && 'throw' in value
  )
}
