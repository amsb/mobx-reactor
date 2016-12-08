'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = undefined;

var _deepDiff = require('deep-diff');

var _serialize = require('../serialize');

var timer = typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance : Date;

var logger = exports.logger = function logger(options) {
  return function (store) {
    return function (action) {
      var dispatchTime = new Date();

      console.group('%c%s%c dispatched @ %s', 'color:green;', action.type, 'color:black;', dispatchTime.toLocaleTimeString());

      console.log('%cpayload', 'font-weight:bold;', action.payload);

      if (action.funcs.length == 0) {
        console.warn('%c NO ASSOCIATED ACTION HANDLERS', 'font-weight:bold;');
      } else {
        console.log('%chandlers', 'font-weight:bold;', action.funcs.map(function (f) {
          return f.displayName;
        }));
      }

      console.groupEnd();

      return regeneratorRuntime.mark(function _callee(func) {
        var effect, done, result, error, count, resultTime, timerStart, prevState, _ref, nextState, diffs, resultTimerStart, elpasedTime;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                effect = void 0, done = void 0;
                result = void 0, error = void 0;
                count = 1;
                resultTime = void 0;
                timerStart = timer.now();

              case 5:
                _context.prev = 5;
                prevState = (0, _serialize.serialize)(store.state);
                _context.next = 9;
                return;

              case 9:
                _ref = _context.sent;
                effect = _ref.effect;
                done = _ref.done;


                console.group('%c%s%c (%c%s%c)%s%s ran in %sms', 'color:blue;', func.displayName, 'color:black;', 'color:green;', action.type, 'color:black;', count > 1 || !done ? ' step ' + count : '', count > 1 && done ? ' (last)' : '', (timer.now() - timerStart).toFixed(2));

                if (result !== undefined) {
                  console.group('effect result in %sms', resultTime.toFixed(2));
                  console.log(result);
                  console.groupEnd();
                }

                if (error) {
                  console.group('effect result in %sms', resultTime.toFixed(2));
                  console.error(error);
                  console.groupEnd();
                }

                nextState = (0, _serialize.serialize)(store.state);
                diffs = (0, _deepDiff.diff)(prevState, nextState);

                if (diffs) {
                  console.group('state changes');
                  diffs.forEach(function (r) {
                    console.log('%s', formatDiff(r));
                  });
                  console.groupEnd();
                }

                if (!effect) {
                  _context.next = 30;
                  break;
                }

                _context.t0 = effect.type;
                _context.next = _context.t0 === 'dispatch' ? 22 : _context.t0 === 'call' ? 24 : 26;
                break;

              case 22:
                console.log('%cdispatch%c(%c%s%c)%o', 'font-weight:bold;', 'font-weight:normal;', 'font-weight:bold; color:green;', effect.payload.type, 'font-weight:normal; color:black;', effect.payload.payload);
                return _context.abrupt('break', 30);

              case 24:
                console.log('%ccall%c(%c%s%c)%o', 'font-weight:bold;', 'font-weight:normal;', 'font-style:italic;', effect.payload.func.displayName || effect.payload.func.name, 'font-style:normal;', effect.payload.args);
                return _context.abrupt('break', 30);

              case 26:
                console.groupCollapsed('%s', effect.type);
                console.log(effect.payload);
                console.groupEnd();
                return _context.abrupt('break', 30);

              case 30:

                console.groupEnd();

                if (!effect) {
                  _context.next = 43;
                  break;
                }

                resultTimerStart = timer.now();
                _context.prev = 33;
                _context.next = 36;
                return;

              case 36:
                result = _context.sent;
                _context.next = 42;
                break;

              case 39:
                _context.prev = 39;
                _context.t1 = _context['catch'](33);

                error = _context.t1;

              case 42:
                resultTime = timer.now() - resultTimerStart;

              case 43:
                _context.next = 51;
                break;

              case 45:
                _context.prev = 45;
                _context.t2 = _context['catch'](5);

                done = true;
                console.group('%c%s%c (%c%s%c)%s%s ran in %sms -- ERROR', 'color:red;', func.displayName, 'color:red;', 'color:red;', action.type, 'color:red;', count > 1 || !done ? ' step ' + count : '', count > 1 && done ? ' (last)' : '', (timer.now() - timerStart).toFixed(2));
                console.error(_context.t2);
                console.groupEnd();

              case 51:

                count += 1;
                timerStart = timer.now();

              case 53:
                if (!done) {
                  _context.next = 5;
                  break;
                }

              case 54:
                elpasedTime = (timer.now() - timerStart) / 1000;

                if (elpasedTime > 1) {
                  console.log('%c%s%c (%c%s%c) last effect completed %ss later', 'font-weight:bold; color:blue;', func.displayName, 'font-weight:bold; color:black;', 'font-weight:bold; color:green;', action.type, 'font-weight:bold; color:black;', elpasedTime.toFixed(2));
                }

              case 56:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 45], [33, 39]]);
      });
    };
  };
};

function formatDiff(_ref2) {
  var kind = _ref2.kind,
      path = _ref2.path,
      lhs = _ref2.lhs,
      rhs = _ref2.rhs,
      index = _ref2.index,
      item = _ref2.item;

  switch (kind) {
    case 'E':
      return path.join('.') + ': ' + lhs + ' \u2192 ' + rhs;
    case 'N':
      return path.join('.') + ': \u2192 ' + rhs;
    case 'D':
      return path.join('.') + ': ' + lhs + ' \u2192';
    case 'A':
      return [path.join('.') + '[' + index + ']', item];
    default:
      return null;
  }
}