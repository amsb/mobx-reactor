'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mobx = require('mobx');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import { scheduleAction } from './actions'


var Store = exports.Store = function () {
  function Store() {
    var _this = this;

    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var middleware = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Store);

    this.state = {};
    this.actions = {};
    // this.addAction('scheduleAction', scheduleAction)
    Object.keys(state).forEach(function (key) {
      _this.addState(key, state[key]);
    });
    this.middleware = middleware.map(function (m) {
      return m(_this);
    });
  }

  _createClass(Store, [{
    key: 'addState',
    value: function addState(key, object) {
      var _this2 = this;

      if (this.state.hasOwnProperty(key)) {
        throw Error("A state object already exists for key " + key);
      }
      this.state[key] = object;
      var prototype = Object.getPrototypeOf(object);
      if (prototype.hasOwnProperty('__actions__')) {
        Object.keys(prototype.__actions__).forEach(function (type) {
          var actions = prototype.__actions__[type].map(function (_ref) {
            var methodName = _ref.methodName,
                other = _objectWithoutProperties(_ref, ['methodName']);

            var func = object[methodName];
            func.displayName = other.displayName;
            return _extends({ func: func, object: object }, other);
          });
          if (!_this2.actions.hasOwnProperty(type)) {
            _this2.actions[type] = [];
          }
          Array.prototype.push.apply(_this2.actions[type], actions);
        });
      }
    }
  }, {
    key: 'addAction',
    value: function addAction(type, func) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (!this.actions.hasOwnProperty(type)) {
        this.actions[type] = [];
      }
      func.displayName = func.name;
      this.actions[type].push(_extends({ func: func }, options));
    }
  }, {
    key: 'dispatch',
    value: function dispatch(type) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var delay = options.delay || 0;

      return function () {
        for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
          payload[_key] = arguments[_key];
        }

        var handlers = _this3.actions.hasOwnProperty(type) ? _this3.actions[type] : [];

        var action = { type: type, options: options, payload: payload, funcs: handlers.map(function (a) {
            return a.func;
          }) };

        var middlewareFactories = _this3.middleware.map(function (m) {
          return m(action);
        });

        var promises = [];
        handlers.forEach(function (_ref2) {
          var func = _ref2.func;

          var middlewareGenerators = middlewareFactories.map(function (m) {
            return m(func);
          });
          middlewareGenerators.forEach(function (m) {
            return m.next();
          });

          try {
            (function () {
              var stepper = func.apply(undefined, payload); // sync if regular function, async if generator

              if (!isGeneratorIterable(stepper)) {
                (function () {
                  var stepValue = stepper;
                  stepper = { next: function next() {
                      return { value: stepValue, done: true };
                    } };
                })();
              }

              promises.push(new Promise(function (resolve, reject) {
                var processStep = function processStep(_ref3) {
                  var effect = _ref3.value,
                      done = _ref3.done;

                  middlewareGenerators.forEach(function (m) {
                    return m.next({ effect: effect, done: done });
                  });

                  var proccessEffect = function proccessEffect(result) {
                    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'next';

                    middlewareGenerators.forEach(function (m) {
                      return m[method](result);
                    });
                    if (!done) {
                      try {
                        var step = stepper[method](result);
                        processStep(step);
                      } catch (error) {
                        middlewareGenerators.forEach(function (m) {
                          return m.throw(error);
                        });
                        reject(error); // well-behaved action handlers should not throw errors
                      }
                    } else {
                      //middlewareGenerators.forEach(m => m.next())
                      resolve();
                    }
                  };

                  if (effect) {
                    switch (effect.type) {

                      case 'dispatch':
                        var _action = effect.payload;
                        _this3.dispatch(_action.type, _action.options || {}).apply(undefined, _toConsumableArray(_action.payload || []));
                        proccessEffect(null);
                        break;

                      case 'call':
                        var _effect$payload = effect.payload,
                            _func = _effect$payload.func,
                            args = _effect$payload.args;

                        Promise.resolve(_func.apply(undefined, _toConsumableArray(args))).then(function (result) {
                          proccessEffect(result);
                        }, function (error) {
                          proccessEffect(error, 'throw');
                        });
                        break;

                      default:
                        console.error('unknown effect type:', effect);

                    }
                  }
                };

                processStep(stepper.next());
              }));
            })();
          } catch (error) {
            middlewareGenerators.forEach(function (m) {
              return m.throw(error);
            });
            promises.push(Promise.reject(error)); // well-behaved action handlers should not throw errors
          }
        });

        return Promise.all(promises);
      };
    }
  }]);

  return Store;
}();

function isGeneratorIterable(value) {
  return value !== null && value !== undefined && 'next' in value && 'throw' in value;
}