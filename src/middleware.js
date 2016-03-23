
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
    let lapTime = new Date()
    const history = []

    let hasError = false
    const onError = ({error, ...meta}) => {
      hasError = true
      history.push({ name: meta.name, elapsedTime: (new Date() - lapTime), error: error })
    }

    let value = yield onError
    while (value) {
      history.push({ name: value.name, elapsedTime: (new Date() - lapTime) })
      lapTime = new Date()
      value = yield value
    }
    console.group('%c%s @ %s in %sms' + (hasError ? ' ERROR' : ''),
      (hasError ? 'color: red;' : 'color: black;'),
      actionType,
      startTime.toLocaleTimeString(),
      (new Date() - startTime)
    )
    console.log('%cpayload', 'font-weight: bold; color: #03A9F4;', payload)
    history.forEach(h => {
      if (h.error) {
        console.groupCollapsed('%cfunction%c %s in %sms %cERROR',
          'font-weight: bold; color: red;',
          'font-weight: normal; color: red;',
          h.name, h.elapsedTime,
          'font-weight: bold; color: red;')
        console.error(h.error)
        console.groupEnd()
      } else {
        console.log('%cfunction%c %s in %sms',
          'font-weight: bold; color: green',
          'font-weight: normal; color: black;',
          h.name, h.elapsedTime)
      }
    })
    console.groupEnd()
  }
}
