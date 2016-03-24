export function chainer(options={}) {
  return store => function* (action) {
    let result
    let func = yield
    while (func) {
      result = func(...action.payload)
      func = yield Promise.resolve(
        result
      ).then(result => {
        if(result) {
          store.dispatch(result.type, result.options)(
            ...(result.payload || [])
          )
        }
      })
    }
  }
}


export function logger(options={}) {
  const timer = ((typeof performance !== `undefined`
    && typeof performance.now === `function`)
    ? performance : Date)

  let showDiff = (options && options.showDiff) || false

  if (showDiff) {
    try {
      var differ = require('deep-diff')
      var serialize = require('./serialize').serialize
      console.warn('The logger showDiff option %cDOES NOT CAPTURE ASYNC%c changes so it has limited usefulness.',
        'font-weight: bold; color: red;', 'font-weight: normal; color: black;')
    } catch (error) {
      console.error('The logger showDiff option requires you to install the "deep-diff" package.')
      differ = null
      serialize = null
      showDiff = false
    }
  }

  return store => function* (action) {
    const startTime = new Date()
    let hasError = false
    const history = []

    let result
    let func = yield
    while(func) {
      let timerStart = timer.now()
      try {

        let prevState
        if (showDiff) {
          prevState = serialize(store.state)
        }

        result = func(...action.payload)

        let diff
        if (showDiff) {
          const nextState = serialize(store.state)
          diff = differ(prevState, nextState)
          prevState = nextState
        }

        history.push({ name: func.displayName, elapsedTime: (timer.now() - timerStart), diff: diff })
      } catch (error) {
        hasError = true
        history.push({ name: func.displayName, elapsedTime: (timer.now() - timerStart), error: error })
        //throw error
      }
      func = yield result
    }

    console.group('%c%s @ %s in %sms' + (hasError ? ' ERROR' : ''),
      (hasError ? 'color: red;' : 'color: black;'),
      action.type,
      startTime.toLocaleTimeString(),
      (new Date() - startTime)
    )
    console.log('%cpayload', 'font-weight: bold; color: #03A9F4;', action.payload)
    history.forEach(h => {
      if (h.error) {
        console.groupCollapsed('%cfunction%c %s %cin %sms %cERROR',
          'font-weight: bold; color: red;',
          'font-weight: bold; color: red;',
          h.name,
          'font-weight: normal; color: red;',
          h.elapsedTime.toFixed(2),
          'font-weight: bold; color: red;')
        console.error(h.error)
        console.groupEnd()
      } else if(h.diff){
        console.group('%cfunction%c %s %cin %sms',
          'font-weight: bold; color: green',
          'font-weight: bold; color: black;',
          h.name,
          'font-weight: normal; color: black;',
          h.elapsedTime.toFixed(2))
          h.diff.forEach((elem) => {
            console.log('%s', formatDiff(elem))
          })
          console.groupEnd()
      } else {
        console.log('%cfunction%c %s %cin %sms',
          'font-weight: bold; color: green',
          'font-weight: bold; color: black;',
          h.name,
          'font-weight: normal; color: black;',
          h.elapsedTime.toFixed(2))
      }
    })
    console.groupEnd()

    yield

    if (((new Date()) - startTime) > 500) {
      console.log('%c%s @ %s ASYNC COMPLETED in %sms',
        'font-weight: bold; color: #888888;',
        action.type,
        startTime.toLocaleTimeString(),
        (new Date() - startTime)
      )
    }

  }
}

function formatDiff({ kind, path, lhs, rhs, index, item }) {
  switch (kind) {
    case 'E':
      return `CHANGED ${path.join('.')} ${lhs} → ${rhs}`
    case 'N':
      return `ADDED ${path.join('.')} ${rhs}`
    case 'D':
      return `DELETED ${path.join('.')}`
    case 'A':
      return [`ARRAY ${path.join('.')}[${index}]`, item]
    default:
      return null
  }
}
