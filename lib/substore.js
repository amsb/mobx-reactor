'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Substore = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.action = action;
exports.dispatch = dispatch;
exports.call = call;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mobx = require('mobx');

var _coreDecorators = require('core-decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Substore = exports.Substore = function Substore() {
  _classCallCheck(this, Substore);
};

function action(type) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return function decorator(target, name, descriptor) {
    exports.action = action = _extends({
      methodName: name,
      displayName: target.constructor.name + '.' + name
    }, options);
    if (!target.hasOwnProperty('__actions__')) {
      target.__actions__ = _defineProperty({}, type, [action]);
    } else if (!target.__actions__.hasOwnProperty(type)) {
      target.__actions__[type] = [action];
    } else {
      target.__actions__[type].push(action);
    }
    descriptor = (0, _coreDecorators.autobind)(target, name, descriptor);
    return descriptor;
  };
}

function dispatch(type) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return function () {
    for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
      payload[_key] = arguments[_key];
    }

    return {
      type: 'dispatch',
      payload: {
        type: type,
        options: options,
        payload: payload
      }
    };
  };
}

function call(func) {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return {
      type: 'call',
      payload: {
        func: func,
        args: args
      }
    };
  };
}