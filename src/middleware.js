export const chainingMiddleware = options => store => {
  return function* (actionType, options, payload) {
    let value
    while (value = yield value) {
      if (value.result) {
        store.dispatch(value.result.actionType, value.result.options)(
          ...(value.result.payload || []))
      }
    }
  }
}


export const loggingMiddleware = options => store => {
  return function* (actionType, options, payload) {
    const startTime = new Date()
    console.log("%cDISPATCHED %s(%s) at %s", 'font-weight:bold;',
      actionType, JSON.stringify(payload), startTime.toLocaleTimeString())
    const onError = ({error, meta}) => {
      console.group('%cERROR: ' + actionType, 'color:red;')
      console.log('actionType: ' + actionType)
      console.log('payload: ' + JSON.stringify(payload))
      console.log(value.error)
      console.groupCollapsed('func')
      console.log(value.func)
      console.groupEnd()
      console.groupEnd()
    }
    let value = yield onError
    while (value) {
      console.log("%cCOMPLETED %s %s(%s) at %s in %d ms", 'font-weight:bold;',
        actionType, value.name, JSON.stringify(payload),
        startTime.toLocaleTimeString(), (new Date() - startTime))
      value = yield value
    }
    console.log("%cFINAL %s(%s)) at %s in %d ms", 'font-weight:bold;',
      actionType, JSON.stringify(payload), startTime.toLocaleTimeString(),
      (new Date() - startTime))
  }
}
