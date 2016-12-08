"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var scheduleAction = exports.scheduleAction = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(type, delay, payload) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new Promise(function (resolve) {
              return setTimeout(resolve, Math.round(1000 * delay) // delay given in seconds
              );
            });

          case 2:
            return _context.abrupt("return", { type: type, options: {}, payload: payload });

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function scheduleAction(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }