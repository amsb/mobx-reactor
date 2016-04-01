import { diff } from 'deep-diff'
import { serialize } from '../serialize'

const timer = ((typeof performance !== `undefined`
  && typeof performance.now === `function`)
  ? performance : Date)


export const logger = options => store => action => {
  const dispatchTime = new Date()

  console.group('%c%s%c dispatched @ %s',
    'color:green;',
    action.type,
    'color:black;',
    dispatchTime.toLocaleTimeString()
  )

  console.log('%cpayload', 'font-weight:bold;', action.payload)

  if (action.funcs.length == 0) {
    console.warn('%c NO ASSOCIATED ACTION HANDLERS', 'font-weight:bold;')
  } else {
    console.log('%chandlers', 'font-weight:bold;',
      action.funcs.map(f => f.displayName))
  }

  console.groupEnd()

  return function* (func) {
    let effect, done
    let result, error
    let count = 1
    let resultTime
    let timerStart = timer.now()
    do {
      try {
        let prevState = serialize(store.state)

        { ({ effect, done } = yield) }

        console.group('%c%s%c (%c%s%c)%s%s ran in %sms',
          'color:blue;',
          func.displayName,
          'color:black;',
          'color:green;',
          action.type,
          'color:black;',
          (count > 1 || !done) ? ` step ${count}` : '',
          (count > 1 && done) ? ' (last)' : '',
          (timer.now() - timerStart).toFixed(2)
        )

        if (result !== undefined) {
          console.group('effect result in %sms',
            resultTime.toFixed(2))
          console.log(result)
          console.groupEnd()
        }

        if (error) {
          console.group('effect result in %sms',
            resultTime.toFixed(2))
          console.error(error)
          console.groupEnd()
        }

        let nextState = serialize(store.state)
        let diffs = diff(prevState, nextState)
        if (diffs) {
          console.group('state changes')
          diffs.forEach(r => {
            console.log('%s', formatDiff(r))
          })
          console.groupEnd()
        }

        if (effect) {
          switch (effect.type) {
            case 'dispatch':
              console.log('%cdispatch%c(%c%s%c)%o',
                'font-weight:bold;',
                'font-weight:normal;',
                'font-weight:bold; color:green;',
                effect.payload.type,
                'font-weight:normal; color:black;',
                effect.payload.payload)
              break
            case 'call':
              console.log('%ccall%c(%c%s%c)%o',
                'font-weight:bold;',
                'font-weight:normal;',
                'font-style:italic;',
                (effect.payload.func.displayName || effect.payload.func.name),
                'font-style:normal;',
                effect.payload.args)
              break
            default:
              console.groupCollapsed('%s', effect.type)
              console.log(effect.payload)
              console.groupEnd()
              break
          }
        }

        console.groupEnd()

        if (effect) {
          const resultTimerStart = timer.now()
          try {
            result = yield
          } catch (e) {
            error = e
          }
          resultTime = timer.now() - resultTimerStart
        }

      } catch (e) {
        done = true
        console.group('%c%s%c (%c%s%c)%s%s ran in %sms -- ERROR',
          'color:red;',
          func.displayName,
          'color:red;',
          'color:red;',
          action.type,
          'color:red;',
          (count > 1 || !done) ? ` step ${count}` : '',
          (count > 1 && done) ? ' (last)' : '',
          (timer.now() - timerStart).toFixed(2)
        )
        console.error(e)
        console.groupEnd()
      }

      count += 1
      timerStart = timer.now()
    } while(!done)

    let elpasedTime = (timer.now() - timerStart)/1000
    if (elpasedTime > 1) {
      console.log('%c%s%c (%c%s%c) last effect completed %ss later',
        'font-weight:bold; color:blue;',
        func.displayName,
        'font-weight:bold; color:black;',
        'font-weight:bold; color:green;',
        action.type,
        'font-weight:bold; color:black;',
        elpasedTime.toFixed(2)
      )
    }

  }
}

function formatDiff({ kind, path, lhs, rhs, index, item }) {
  switch (kind) {
    case 'E':
      return `${path.join('.')}: ${lhs} → ${rhs}`
    case 'N':
      return `${path.join('.')}: → ${rhs}`
    case 'D':
      return `${path.join('.')}: ${lhs} →`
    case 'A':
      return [`${path.join('.')}[${index}]`, item]
    default:
      return null
  }
}
