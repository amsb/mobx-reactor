'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
var exemplar = exports.exemplar = function exemplar(options) {
  return function (store) {
    return function (action) {
      console.log('%s middleware: dispatched, but action handlers have not yet been run.', action.type);
      return regeneratorRuntime.mark(function _callee(func) {
        var effect, done, _ref, result;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                effect = void 0, done = void 0;

              case 1:
                _context.prev = 1;

                console.log('%s %s middleware: will iterate/run action handler', action.type, func.displayName);
                _context.next = 5;
                return;

              case 5:
                _ref = _context.sent;
                effect = _ref.effect;
                done = _ref.done;

                console.log('%s %s middleware: iterated/ran action which requests effect', action.type, func.displayName, effect);

                if (!effect) {
                  _context.next = 21;
                  break;
                }

                _context.prev = 10;

                console.log('%s %s middleware: will run and wait for effect', action.type, func.displayName, effect);
                _context.next = 14;
                return;

              case 14:
                result = _context.sent;

                console.log('%s %s middleware: got result from effect', action.type, func.displayName, result);
                _context.next = 21;
                break;

              case 18:
                _context.prev = 18;
                _context.t0 = _context['catch'](10);

                console.log('%s %s middleware: got ERROR from effect', action.type, func.displayName, _context.t0);

              case 21:
                _context.next = 26;
                break;

              case 23:
                _context.prev = 23;
                _context.t1 = _context['catch'](1);

                console.log('%s %s middleware: got ERROR from action handler', action.type, func.displayName, _context.t1);

              case 26:
                if (!done) {
                  _context.next = 1;
                  break;
                }

              case 27:
                console.log('%s %s middleware: handler and any final effect has completed', action.type, func.displayName);

              case 28:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 23], [10, 18]]);
      });
    };
  };
};