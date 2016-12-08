'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.serialize = serialize;

var _mobx = require('mobx');

function serialize(obj) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var withComputed = options.withComputed || false;
  var keepMap = options.keepMap || false;

  var _serialize = (0, _mobx.createTransformer)(function (obj) {
    if ((0, _mobx.isObservableMap)(obj)) {
      if (keepMap) {
        var _ret = function () {
          var serializedObj = new Map();
          obj.entries().forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                k = _ref2[0],
                v = _ref2[1];

            serializedObj.set(k, isObject(v) ? _serialize(v) : v);
          });
          return {
            v: serializedObj
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else {
        var _ret2 = function () {
          var serializedObj = {};
          obj.entries().forEach(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                k = _ref4[0],
                v = _ref4[1];

            serializedObj[k] = isObject(v) ? _serialize(v) : v;
          });
          return {
            v: serializedObj
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }
    } else if ((0, _mobx.isObservableArray)(obj)) {
      return obj.map(function (v) {
        return isObject(v) ? _serialize(v) : v;
      });
    } else if ((0, _mobx.isObservable)(obj)) {
      var _ret3 = function () {
        var serializedObj = {};
        Object.keys(obj).forEach(function (k) {
          var v = obj[k];
          serializedObj[k] = isObject(v) ? _serialize(v) : v;
        });
        if (withComputed) {
          Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach(function (k) {
            if (!obj.hasOwnProperty(k) && !(k in serializedObj)) {
              var v = obj[k];
              if (typeof v !== 'function') {
                serializedObj[k] = isObject(v) ? _serialize(v) : v;
              }
            }
          });
        }
        return {
          v: serializedObj
        };
      }();

      if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
    } else if (isPlainObject(obj)) {
      var _ret4 = function () {
        var serializedObj = {};
        Object.keys(obj).forEach(function (k) {
          var v = obj[k];
          serializedObj[k] = isObject(v) ? _serialize(v) : v;
        });
        return {
          v: serializedObj
        };
      }();

      if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
    } else {
      return obj;
    }
  });
  if (isObject(obj)) {
    return _serialize(obj);
  } else {
    return obj;
  }
}

function isObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object";
}

function isPlainObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object" && Object.getPrototypeOf(value) === Object.prototype;
}