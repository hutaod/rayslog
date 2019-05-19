'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var App =
/*#__PURE__*/
function () {
  function App() {
    _classCallCheck(this, App);

    _defineProperty(this, "handles", {
      effectError: []
    });
  }

  _createClass(App, [{
    key: "on",
    value: function on(type, callback) {
      if (!this.handles[type]) {
        this.handles[type] = [];
      }

      this.handles[type].push(callback);
    }
  }, {
    key: "off",
    value: function off(type, callback) {
      if (this.handles[type]) {
        this.handles = this.handles[type].filters(function (item) {
          return item !== callback;
        });
      }
    }
  }, {
    key: "emit",
    value: function emit(type) {
      for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
      }

      if (this.handles[type]) {
        this.handles[type].forEach(function (cb) {
          return cb.apply(void 0, rest);
        });
      }
    }
  }]);

  return App;
}();

var index = new App();

module.exports = index;
//# sourceMappingURL=index.js.map
