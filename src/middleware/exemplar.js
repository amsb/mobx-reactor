//
// Middleware Template
//
// export const middleware = options => store => action => {
//   return function* (func) {
//     let effect, done
//     do {
//       try {
//         { ({ effect, done } = yield) }
//         if (effect) {
//           try {
//             let result = yield
//           } catch (error) {
//           }
//         }
//       } catch (error) {
//       }
//     } while(!done)
//   }
// }

//
// Annotated Middleware "Example"
//
export const exemplar = options => store => action => {
  console.log('%s middleware: dispatched, but action handlers have not yet been run.', action.type)
  return function* (func) {
    let effect, done
    do {
      try {
        console.log('%s %s middleware: will iterate/run action handler', action.type, func.displayName)
        { ({ effect, done } = yield) }
        console.log('%s %s middleware: iterated/ran action which requests effect', action.type, func.displayName, effect)
        if (effect) {
          try {
            console.log('%s %s middleware: will run and wait for effect', action.type, func.displayName, effect)
            let result = yield
            console.log('%s %s middleware: got result from effect', action.type, func.displayName, result)
          } catch (error) {
            console.log('%s %s middleware: got ERROR from effect', action.type, func.displayName, error)
          }
        }
      } catch (error) {
        console.log('%s %s middleware: got ERROR from action handler', action.type, func.displayName, error)
      }
    } while(!done)
    console.log('%s %s middleware: handler and any final effect has completed', action.type, func.displayName)
  }
}
