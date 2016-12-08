'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoreContext = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StoreContext = exports.StoreContext = (_temp = _class = function (_React$Component) {
  _inherits(StoreContext, _React$Component);

  _createClass(StoreContext, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { store: this.store };
    }
  }]);

  function StoreContext(props, context) {
    _classCallCheck(this, StoreContext);

    var _this = _possibleConstructorReturn(this, (StoreContext.__proto__ || Object.getPrototypeOf(StoreContext)).call(this, props, context));

    _this.store = props.store;
    return _this;
  }

  _createClass(StoreContext, [{
    key: 'render',
    value: function render() {
      var children = this.props.children;

      return _react2.default.Children.only(children);
    }
  }]);

  return StoreContext;
}(_react2.default.Component), _class.childContextTypes = {
  store: _react2.default.PropTypes.object.isRequired
}, _temp);