'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.connect = connect;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mobx = require('mobx');

var _serialize = require('./serialize');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function connect(storeMap) {
  return function connector(Component) {
    var _class, _temp;

    var Connect = (_temp = _class = function (_React$Component) {
      _inherits(Connect, _React$Component);

      function Connect(props, context) {
        _classCallCheck(this, Connect);

        var _this = _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).call(this, props, context));

        _this.state = {};
        _this.stateKeys = [];
        _this.actions = {};
        for (var key in storeMap) {
          var value = storeMap[key](_this.context.store);
          if (typeof value === 'function') {
            _this.actions[key] = value;
          } else {
            _this.stateKeys.push(key);
            _this.state[key] = value;
          }
        }
        return _this;
      }

      _createClass(Connect, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var _this2 = this;

          this.disposer = (0, _mobx.autorun)(function () {
            var nextState = {};
            _this2.stateKeys.forEach(function (key) {
              var mapValue = storeMap[key];
              if (typeof mapValue === 'function') {
                var value = mapValue(_this2.context.store);
                nextState[key] = value;
              }
            });
            _this2.setState(nextState);
          });
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.disposer();
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Component, _extends({}, this.state, this.actions));
        }
      }]);

      return Connect;
    }(_react2.default.Component), _class.contextTypes = {
      store: _react2.default.PropTypes.object.isRequired
    }, _temp);


    return Connect;
  };
}