'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var redux = require('redux');
var reactRedux = require('react-redux');
var isNode = _interopDefault(require('detect-node'));
require('regenerator-runtime/runtime');
var thunk = _interopDefault(require('redux-thunk'));
var createSagaMiddleware = _interopDefault(require('redux-saga'));
var App = _interopDefault(require('@ht1131589588/rayslog'));
var invariant = _interopDefault(require('invariant'));
var Immutable = _interopDefault(require('immutable'));
var lodash = require('lodash');

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var config = {
  reducerPrefix: '@@reducer',
  actionPrefix: '@@action',
  publicEffect: '@@public',
  channelEffect: '@@channel'
};

function concatNamespace(namespace) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (name) {
    name = "/".concat(name);
  }

  return "".concat(namespace).concat(name);
}

var utils = {
  publicEffect: function publicEffect(namespace, name) {
    var ret = concatNamespace(namespace, name);
    return "".concat(config.publicEffect, "/").concat(ret);
  },
  channelEffect: function channelEffect(namespace, name) {
    var ret = concatNamespace(namespace, name);
    return "".concat(config.channelEffect, "/").concat(ret);
  },
  reducerPrefix: function reducerPrefix(namespace, name) {
    var ret = concatNamespace(namespace, name);
    return "".concat(config.reducerPrefix, "/").concat(ret);
  }
};

var sagaMiddleware = createSagaMiddleware();
var allSagas = {};
var allReducer = {};
var store = null; // 调用action后返回Promise，方便在接口调用完成后，获取返回值

function actionMiddleware() {
  return function (next) {
    return function (action) {
      if (action[config.actionPrefix]) {
        next(action);
        return new Promise(function (reslove, reject) {
          action.resolveAction = reslove;
          action.rejectAction = reject;
        });
      }

      return next(action);
    };
  };
}

function runSaga(namespace) {
  if (namespace) {
    return sagaMiddleware.run(allSagas[namespace]).done;
  } else {
    var allPromise = [];
    Object.keys(allSagas).forEach(function (sage) {
      allPromise.push(sagaMiddleware.run(allSagas[sage]).done);
    });
    return allPromise;
  }
}

function initStore() {
  var initialStore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var enhanceMiddleware = [];

  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable no-undef */
    if (typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function') {
      enhanceMiddleware.push(__REDUX_DEVTOOLS_EXTENSION__());
    }
  }

  var middleware = redux.compose.apply(void 0, [redux.applyMiddleware(sagaMiddleware, thunk, actionMiddleware)].concat(enhanceMiddleware));
  var reducers = redux.combineReducers(_objectSpread2({}, allReducer));
  store = redux.createStore(reducers, initialStore, middleware);
  store.runSaga = runSaga;
  return store;
}
function injectSaga(namespace, sage) {
  allSagas[namespace] = sage;
}
function injectReducer(namespace, reducer) {
  allReducer[namespace] = reducer;

  if (store) {
    store.replaceReducer(redux.combineReducers(_objectSpread2({}, allReducer)));
  }
}
function getStore() {
  return store;
}

function createActions(model) {
  var publicActions = createPublicActions(model);
  var channelActions = createChannelActions(model);
  return {
    publicActions: publicActions,
    channelActions: channelActions
  };
}

function createChannelActions(model) {
  var actions = {};
  Object.keys(model.effects.channel).forEach(function (effectKey) {
    var actionType = utils.channelEffect(model.namespace, effectKey);

    actions[effectKey] = function () {
      for (var _len = arguments.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      return getStore().dispatch(_defineProperty({
        type: actionType,
        payload: [].concat(rest)
      }, config.actionPrefix, true));
    };
  });
  return actions;
}

function createPublicActions(model) {
  // 给每一个model添加重置store的方法
  var actionCreators = {
    resetStore: function resetStore() {
      return {
        type: utils.reducerPrefix(model.namespace, 'resetStore')
      };
    },
    setStore: function setStore(data) {
      var _ref;

      return _ref = {
        type: utils.reducerPrefix(model.namespace, 'setStore')
      }, _defineProperty(_ref, config.actionPrefix, true), _defineProperty(_ref, "data", data), _ref;
    }
  };
  Object.keys(model.effects["public"]).forEach(function (effectKey) {
    var actionType = utils.publicEffect(model.namespace, effectKey);

    actionCreators[effectKey] = function () {
      for (var _len2 = arguments.length, rest = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        rest[_key2] = arguments[_key2];
      }

      return function (dispatch, getState) {
        if (process.env.REACT_APP_MODE === 'WEBAPP_SSR' && !isNode) {
          // 数据已经从Node服务器获取，客户端不再获取（仅第一次）
          if (getState()[model.namespace].get('__LOADED__')) {
            return dispatch(actionCreators.setStore({
              __LOADED__: null
            }));
          }
        }

        return dispatch(_defineProperty({
          type: actionType,
          payload: rest
        }, config.actionPrefix, true));
      };
    };
  });
  return function (dispatch) {
    return redux.bindActionCreators(actionCreators, dispatch);
  };
}

var createSymbol = function createSymbol(name) {
  return "@@redux-saga/" + name;
};

var CANCEL =
/*#__PURE__*/
createSymbol('CANCEL_PROMISE');
var IO =
/*#__PURE__*/
createSymbol('IO');
var MULTICAST =
/*#__PURE__*/
createSymbol('MULTICAST');
var SELF_CANCELLATION =
/*#__PURE__*/
createSymbol('SELF_CANCELLATION');
var TASK =
/*#__PURE__*/
createSymbol('TASK');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var undef = function undef(v) {
  return v === null || v === undefined;
};

var notUndef = function notUndef(v) {
  return v !== null && v !== undefined;
};

var func = function func(f) {
  return typeof f === 'function';
};

var string = function string(s) {
  return typeof s === 'string';
};

var array = Array.isArray;

var object = function object(obj) {
  return obj && !array(obj) && _typeof(obj) === 'object';
};

var task = function task(t) {
  return t && t[TASK];
};

var buffer = function buffer(buf) {
  return buf && func(buf.isEmpty) && func(buf.take) && func(buf.put);
};

var pattern = function pattern(pat) {
  return pat && (string(pat) || symbol(pat) || func(pat) || array(pat) && pat.every(pattern));
};

var channel = function channel(ch) {
  return ch && func(ch.take) && func(ch.close);
};

var stringableFunc = function stringableFunc(f) {
  return func(f) && f.hasOwnProperty('toString');
};

var symbol = function symbol(sym) {
  return Boolean(sym) && typeof Symbol === 'function' && sym.constructor === Symbol && sym !== Symbol.prototype;
};

var multicast = function multicast(ch) {
  return channel(ch) && ch[MULTICAST];
};

function delayP(ms, val) {
  if (val === void 0) {
    val = true;
  }

  var timeoutId;
  var promise = new Promise(function (resolve) {
    timeoutId = setTimeout(resolve, ms, val);
  });

  promise[CANCEL] = function () {
    clearTimeout(timeoutId);
  };

  return promise;
}

var identity = function identity(v) {
  return v;
};

function check(value, predicate, error) {
  if (!predicate(value)) {
    throw new Error(error);
  }
}

var kThrow = function kThrow(err) {
  throw err;
};

var kReturn = function kReturn(value) {
  return {
    value: value,
    done: true
  };
};

function makeIterator(next, thro, name) {
  if (thro === void 0) {
    thro = kThrow;
  }

  if (name === void 0) {
    name = 'iterator';
  }

  var iterator = {
    meta: {
      name: name
    },
    next: next,
    "throw": thro,
    "return": kReturn,
    isSagaIterator: true
  };

  if (typeof Symbol !== 'undefined') {
    iterator[Symbol.iterator] = function () {
      return iterator;
    };
  }

  return iterator;
}

var createSetContextWarning = function createSetContextWarning(ctx, props) {
  return (ctx ? ctx + '.' : '') + "setContext(props): argument " + props + " is not a plain object";
};

var BUFFER_OVERFLOW = "Channel's Buffer overflow!";
var ON_OVERFLOW_THROW = 1;
var ON_OVERFLOW_SLIDE = 3;
var ON_OVERFLOW_EXPAND = 4;

function ringBuffer(limit, overflowAction) {
  if (limit === void 0) {
    limit = 10;
  }

  var arr = new Array(limit);
  var length = 0;
  var pushIndex = 0;
  var popIndex = 0;

  var push = function push(it) {
    arr[pushIndex] = it;
    pushIndex = (pushIndex + 1) % limit;
    length++;
  };

  var take = function take() {
    if (length != 0) {
      var it = arr[popIndex];
      arr[popIndex] = null;
      length--;
      popIndex = (popIndex + 1) % limit;
      return it;
    }
  };

  var flush = function flush() {
    var items = [];

    while (length) {
      items.push(take());
    }

    return items;
  };

  return {
    isEmpty: function isEmpty() {
      return length == 0;
    },
    put: function put(it) {
      if (length < limit) {
        push(it);
      } else {
        var doubledLimit;

        switch (overflowAction) {
          case ON_OVERFLOW_THROW:
            throw new Error(BUFFER_OVERFLOW);

          case ON_OVERFLOW_SLIDE:
            arr[pushIndex] = it;
            pushIndex = (pushIndex + 1) % limit;
            popIndex = pushIndex;
            break;

          case ON_OVERFLOW_EXPAND:
            doubledLimit = 2 * limit;
            arr = flush();
            length = arr.length;
            pushIndex = arr.length;
            popIndex = 0;
            arr.length = doubledLimit;
            limit = doubledLimit;
            push(it);
            break;

          default: // DROP

        }
      }
    },
    take: take,
    flush: flush
  };
}

var sliding = function sliding(limit) {
  return ringBuffer(limit, ON_OVERFLOW_SLIDE);
};
var TAKE = 'TAKE';
var PUT = 'PUT';
var ALL = 'ALL';
var RACE = 'RACE';
var CALL = 'CALL';
var CPS = 'CPS';
var FORK = 'FORK';
var JOIN = 'JOIN';
var CANCEL$1 = 'CANCEL';
var SELECT = 'SELECT';
var ACTION_CHANNEL = 'ACTION_CHANNEL';
var CANCELLED = 'CANCELLED';
var FLUSH = 'FLUSH';
var GET_CONTEXT = 'GET_CONTEXT';
var SET_CONTEXT = 'SET_CONTEXT';
var effectTypes =
/*#__PURE__*/
Object.freeze({
  TAKE: TAKE,
  PUT: PUT,
  ALL: ALL,
  RACE: RACE,
  CALL: CALL,
  CPS: CPS,
  FORK: FORK,
  JOIN: JOIN,
  CANCEL: CANCEL$1,
  SELECT: SELECT,
  ACTION_CHANNEL: ACTION_CHANNEL,
  CANCELLED: CANCELLED,
  FLUSH: FLUSH,
  GET_CONTEXT: GET_CONTEXT,
  SET_CONTEXT: SET_CONTEXT
});
var TEST_HINT = '\n(HINT: if you are getting this errors in tests, consider using createMockTask from @redux-saga/testing-utils)';

var makeEffect = function makeEffect(type, payload) {
  var _ref;

  return _ref = {}, _ref[IO] = true, _ref.combinator = false, _ref.type = type, _ref.payload = payload, _ref;
};

var isForkEffect = function isForkEffect(eff) {
  return eff && eff[IO] && eff.type === FORK;
};

var detach = function detach(eff) {
  if (process.env.NODE_ENV !== 'production') {
    check(eff, isForkEffect, 'detach(eff): argument must be a fork effect');
  }

  return makeEffect(FORK, _extends({}, eff.payload, {
    detached: true
  }));
};

function take(patternOrChannel, multicastPattern) {
  if (patternOrChannel === void 0) {
    patternOrChannel = '*';
  }

  if (process.env.NODE_ENV !== 'production' && arguments.length) {
    check(arguments[0], notUndef, 'take(patternOrChannel): patternOrChannel is undefined');
  }

  if (pattern(patternOrChannel)) {
    return makeEffect(TAKE, {
      pattern: patternOrChannel
    });
  }

  if (multicast(patternOrChannel) && notUndef(multicastPattern) && pattern(multicastPattern)) {
    return makeEffect(TAKE, {
      channel: patternOrChannel,
      pattern: multicastPattern
    });
  }

  if (channel(patternOrChannel)) {
    return makeEffect(TAKE, {
      channel: patternOrChannel
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error("take(patternOrChannel): argument " + patternOrChannel + " is not valid channel or a valid pattern");
  }
}

var takeMaybe = function takeMaybe() {
  var eff = take.apply(void 0, arguments);
  eff.payload.maybe = true;
  return eff;
};

function put(channel$1, action) {
  if (process.env.NODE_ENV !== 'production') {
    if (arguments.length > 1) {
      check(channel$1, notUndef, 'put(channel, action): argument channel is undefined');
      check(channel$1, channel, "put(channel, action): argument " + channel$1 + " is not a valid channel");
      check(action, notUndef, 'put(channel, action): argument action is undefined');
    } else {
      check(channel$1, notUndef, 'put(action): argument action is undefined');
    }
  }

  if (undef(action)) {
    action = channel$1; // `undefined` instead of `null` to make default parameter work

    channel$1 = undefined;
  }

  return makeEffect(PUT, {
    channel: channel$1,
    action: action
  });
}

var putResolve = function putResolve() {
  var eff = put.apply(void 0, arguments);
  eff.payload.resolve = true;
  return eff;
};

function all(effects) {
  var eff = makeEffect(ALL, effects);
  eff.combinator = true;
  return eff;
}

function race(effects) {
  var eff = makeEffect(RACE, effects);
  eff.combinator = true;
  return eff;
} // this match getFnCallDescriptor logic


var validateFnDescriptor = function validateFnDescriptor(effectName, fnDescriptor) {
  check(fnDescriptor, notUndef, effectName + ": argument fn is undefined or null");

  if (func(fnDescriptor)) {
    return;
  }

  var context = null;
  var fn;

  if (array(fnDescriptor)) {
    context = fnDescriptor[0];
    fn = fnDescriptor[1];
    check(fn, notUndef, effectName + ": argument of type [context, fn] has undefined or null `fn`");
  } else if (object(fnDescriptor)) {
    context = fnDescriptor.context;
    fn = fnDescriptor.fn;
    check(fn, notUndef, effectName + ": argument of type {context, fn} has undefined or null `fn`");
  } else {
    check(fnDescriptor, func, effectName + ": argument fn is not function");
    return;
  }

  if (context && string(fn)) {
    check(context[fn], func, effectName + ": context arguments has no such method - \"" + fn + "\"");
    return;
  }

  check(fn, func, effectName + ": unpacked fn argument (from [context, fn] or {context, fn}) is not a function");
};

function getFnCallDescriptor(fnDescriptor, args) {
  var context = null;
  var fn;

  if (func(fnDescriptor)) {
    fn = fnDescriptor;
  } else {
    if (array(fnDescriptor)) {
      context = fnDescriptor[0];
      fn = fnDescriptor[1];
    } else {
      context = fnDescriptor.context;
      fn = fnDescriptor.fn;
    }

    if (context && string(fn) && func(context[fn])) {
      fn = context[fn];
    }
  }

  return {
    context: context,
    fn: fn,
    args: args
  };
}

var isNotDelayEffect = function isNotDelayEffect(fn) {
  return fn !== delay;
};

function call(fnDescriptor) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (process.env.NODE_ENV !== 'production') {
    var arg0 = typeof args[0] === 'number' ? args[0] : 'ms';
    check(fnDescriptor, isNotDelayEffect, "instead of writing `yield call(delay, " + arg0 + ")` where delay is an effect from `redux-saga/effects` you should write `yield delay(" + arg0 + ")`");
    validateFnDescriptor('call', fnDescriptor);
  }

  return makeEffect(CALL, getFnCallDescriptor(fnDescriptor, args));
}

function apply(context, fn, args) {
  if (args === void 0) {
    args = [];
  }

  var fnDescriptor = [context, fn];

  if (process.env.NODE_ENV !== 'production') {
    validateFnDescriptor('apply', fnDescriptor);
  }

  return makeEffect(CALL, getFnCallDescriptor([context, fn], args));
}

function cps(fnDescriptor) {
  if (process.env.NODE_ENV !== 'production') {
    validateFnDescriptor('cps', fnDescriptor);
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return makeEffect(CPS, getFnCallDescriptor(fnDescriptor, args));
}

function fork(fnDescriptor) {
  if (process.env.NODE_ENV !== 'production') {
    validateFnDescriptor('fork', fnDescriptor);
  }

  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }

  return makeEffect(FORK, getFnCallDescriptor(fnDescriptor, args));
}

function spawn(fnDescriptor) {
  if (process.env.NODE_ENV !== 'production') {
    validateFnDescriptor('spawn', fnDescriptor);
  }

  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  return detach(fork.apply(void 0, [fnDescriptor].concat(args)));
}

function join(taskOrTasks) {
  if (process.env.NODE_ENV !== 'production') {
    if (arguments.length > 1) {
      throw new Error('join(...tasks) is not supported any more. Please use join([...tasks]) to join multiple tasks.');
    }

    if (array(taskOrTasks)) {
      taskOrTasks.forEach(function (t) {
        check(t, task, "join([...tasks]): argument " + t + " is not a valid Task object " + TEST_HINT);
      });
    } else {
      check(taskOrTasks, task, "join(task): argument " + taskOrTasks + " is not a valid Task object " + TEST_HINT);
    }
  }

  return makeEffect(JOIN, taskOrTasks);
}

function cancel(taskOrTasks) {
  if (taskOrTasks === void 0) {
    taskOrTasks = SELF_CANCELLATION;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (arguments.length > 1) {
      throw new Error('cancel(...tasks) is not supported any more. Please use cancel([...tasks]) to cancel multiple tasks.');
    }

    if (array(taskOrTasks)) {
      taskOrTasks.forEach(function (t) {
        check(t, task, "cancel([...tasks]): argument " + t + " is not a valid Task object " + TEST_HINT);
      });
    } else if (taskOrTasks !== SELF_CANCELLATION && notUndef(taskOrTasks)) {
      check(taskOrTasks, task, "cancel(task): argument " + taskOrTasks + " is not a valid Task object " + TEST_HINT);
    }
  }

  return makeEffect(CANCEL$1, taskOrTasks);
}

function select(selector) {
  if (selector === void 0) {
    selector = identity;
  }

  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  if (process.env.NODE_ENV !== 'production' && arguments.length) {
    check(arguments[0], notUndef, 'select(selector, [...]): argument selector is undefined');
    check(selector, func, "select(selector, [...]): argument " + selector + " is not a function");
  }

  return makeEffect(SELECT, {
    selector: selector,
    args: args
  });
}
/**
  channel(pattern, [buffer])    => creates a proxy channel for store actions
**/


function actionChannel(pattern$1, buffer$1) {
  if (process.env.NODE_ENV !== 'production') {
    check(pattern$1, pattern, 'actionChannel(pattern,...): argument pattern is not valid');

    if (arguments.length > 1) {
      check(buffer$1, notUndef, 'actionChannel(pattern, buffer): argument buffer is undefined');
      check(buffer$1, buffer, "actionChannel(pattern, buffer): argument " + buffer$1 + " is not a valid buffer");
    }
  }

  return makeEffect(ACTION_CHANNEL, {
    pattern: pattern$1,
    buffer: buffer$1
  });
}

function cancelled() {
  return makeEffect(CANCELLED, {});
}

function flush(channel$1) {
  if (process.env.NODE_ENV !== 'production') {
    check(channel$1, channel, "flush(channel): argument " + channel$1 + " is not valid channel");
  }

  return makeEffect(FLUSH, channel$1);
}

function getContext(prop) {
  if (process.env.NODE_ENV !== 'production') {
    check(prop, string, "getContext(prop): argument " + prop + " is not a string");
  }

  return makeEffect(GET_CONTEXT, prop);
}

function setContext(props) {
  if (process.env.NODE_ENV !== 'production') {
    check(props, object, createSetContextWarning(null, props));
  }

  return makeEffect(SET_CONTEXT, props);
}

var delay =
/*#__PURE__*/
call.bind(null, delayP);

var done = function done(value) {
  return {
    done: true,
    value: value
  };
};

var qEnd = {};

function safeName(patternOrChannel) {
  if (channel(patternOrChannel)) {
    return 'channel';
  }

  if (stringableFunc(patternOrChannel)) {
    return String(patternOrChannel);
  }

  if (func(patternOrChannel)) {
    return patternOrChannel.name;
  }

  return String(patternOrChannel);
}

function fsmIterator(fsm, startState, name) {
  var stateUpdater,
      errorState,
      effect,
      nextState = startState;

  function next(arg, error) {
    if (nextState === qEnd) {
      return done(arg);
    }

    if (error && !errorState) {
      nextState = qEnd;
      throw error;
    } else {
      stateUpdater && stateUpdater(arg);
      var currentState = error ? fsm[errorState](error) : fsm[nextState]();
      nextState = currentState.nextState;
      effect = currentState.effect;
      stateUpdater = currentState.stateUpdater;
      errorState = currentState.errorState;
      return nextState === qEnd ? done(arg) : effect;
    }
  }

  return makeIterator(next, function (error) {
    return next(null, error);
  }, name);
}

function takeEvery(patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var action,
      setAction = function setAction(ac) {
    return action = ac;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return {
        nextState: 'q1',
        effect: yFork(action)
      };
    }
  }, 'q1', "takeEvery(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

function takeLatest(patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var yCancel = function yCancel(task) {
    return {
      done: false,
      value: cancel(task)
    };
  };

  var task, action;

  var setTask = function setTask(t) {
    return task = t;
  };

  var setAction = function setAction(ac) {
    return action = ac;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return task ? {
        nextState: 'q3',
        effect: yCancel(task)
      } : {
        nextState: 'q1',
        effect: yFork(action),
        stateUpdater: setTask
      };
    },
    q3: function q3() {
      return {
        nextState: 'q1',
        effect: yFork(action),
        stateUpdater: setTask
      };
    }
  }, 'q1', "takeLatest(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

function takeLeading(patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };

  var yCall = function yCall(ac) {
    return {
      done: false,
      value: call.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var action;

  var setAction = function setAction(ac) {
    return action = ac;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return {
        nextState: 'q1',
        effect: yCall(action)
      };
    }
  }, 'q1', "takeLeading(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

function throttle(delayLength, pattern, worker) {
  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var action, channel;
  var yActionChannel = {
    done: false,
    value: actionChannel(pattern, sliding(1))
  };

  var yTake = function yTake() {
    return {
      done: false,
      value: take(channel)
    };
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var yDelay = {
    done: false,
    value: delay(delayLength)
  };

  var setAction = function setAction(ac) {
    return action = ac;
  };

  var setChannel = function setChannel(ch) {
    return channel = ch;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yActionChannel,
        stateUpdater: setChannel
      };
    },
    q2: function q2() {
      return {
        nextState: 'q3',
        effect: yTake(),
        stateUpdater: setAction
      };
    },
    q3: function q3() {
      return {
        nextState: 'q4',
        effect: yFork(action)
      };
    },
    q4: function q4() {
      return {
        nextState: 'q2',
        effect: yDelay
      };
    }
  }, 'q1', "throttle(" + safeName(pattern) + ", " + worker.name + ")");
}

function retry(maxTries, delayLength, fn) {
  var counter = maxTries;

  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var yCall = {
    done: false,
    value: call.apply(void 0, [fn].concat(args))
  };
  var yDelay = {
    done: false,
    value: delay(delayLength)
  };
  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yCall,
        errorState: 'q10'
      };
    },
    q2: function q2() {
      return {
        nextState: qEnd
      };
    },
    q10: function q10(error) {
      counter -= 1;

      if (counter <= 0) {
        throw error;
      }

      return {
        nextState: 'q1',
        effect: yDelay
      };
    }
  }, 'q1', "retry(" + fn.name + ")");
}

function debounceHelper(delayLength, patternOrChannel, worker) {
  for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  var action, raceOutput;
  var yTake = {
    done: false,
    value: take(patternOrChannel)
  };
  var yRace = {
    done: false,
    value: race({
      action: take(patternOrChannel),
      debounce: delay(delayLength)
    })
  };

  var yFork = function yFork(ac) {
    return {
      done: false,
      value: fork.apply(void 0, [worker].concat(args, [ac]))
    };
  };

  var yNoop = function yNoop(value) {
    return {
      done: false,
      value: value
    };
  };

  var setAction = function setAction(ac) {
    return action = ac;
  };

  var setRaceOutput = function setRaceOutput(ro) {
    return raceOutput = ro;
  };

  return fsmIterator({
    q1: function q1() {
      return {
        nextState: 'q2',
        effect: yTake,
        stateUpdater: setAction
      };
    },
    q2: function q2() {
      return {
        nextState: 'q3',
        effect: yRace,
        stateUpdater: setRaceOutput
      };
    },
    q3: function q3() {
      return raceOutput.debounce ? {
        nextState: 'q1',
        effect: yFork(action)
      } : {
        nextState: 'q2',
        effect: yNoop(raceOutput.action),
        stateUpdater: setAction
      };
    }
  }, 'q1', "debounce(" + safeName(patternOrChannel) + ", " + worker.name + ")");
}

var validateTakeEffect = function validateTakeEffect(fn, patternOrChannel, worker) {
  check(patternOrChannel, notUndef, fn.name + " requires a pattern or channel");
  check(worker, notUndef, fn.name + " requires a saga parameter");
};

function takeEvery$1(patternOrChannel, worker) {
  if (process.env.NODE_ENV !== 'production') {
    validateTakeEffect(takeEvery$1, patternOrChannel, worker);
  }

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return fork.apply(void 0, [takeEvery, patternOrChannel, worker].concat(args));
}

function takeLatest$1(patternOrChannel, worker) {
  if (process.env.NODE_ENV !== 'production') {
    validateTakeEffect(takeLatest$1, patternOrChannel, worker);
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  return fork.apply(void 0, [takeLatest, patternOrChannel, worker].concat(args));
}

function takeLeading$1(patternOrChannel, worker) {
  if (process.env.NODE_ENV !== 'production') {
    validateTakeEffect(takeLeading$1, patternOrChannel, worker);
  }

  for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    args[_key3 - 2] = arguments[_key3];
  }

  return fork.apply(void 0, [takeLeading, patternOrChannel, worker].concat(args));
}

function throttle$1(ms, pattern, worker) {
  if (process.env.NODE_ENV !== 'production') {
    check(pattern, notUndef, 'throttle requires a pattern');
    check(worker, notUndef, 'throttle requires a saga parameter');
  }

  for (var _len4 = arguments.length, args = new Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
    args[_key4 - 3] = arguments[_key4];
  }

  return fork.apply(void 0, [throttle, ms, pattern, worker].concat(args));
}

function retry$1(maxTries, delayLength, worker) {
  for (var _len5 = arguments.length, args = new Array(_len5 > 3 ? _len5 - 3 : 0), _key5 = 3; _key5 < _len5; _key5++) {
    args[_key5 - 3] = arguments[_key5];
  }

  return call.apply(void 0, [retry, maxTries, delayLength, worker].concat(args));
}

function debounce(delayLength, pattern, worker) {
  for (var _len6 = arguments.length, args = new Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) {
    args[_key6 - 3] = arguments[_key6];
  }

  return fork.apply(void 0, [debounceHelper, delayLength, pattern, worker].concat(args));
}



var effects = /*#__PURE__*/Object.freeze({
  debounce: debounce,
  retry: retry$1,
  takeEvery: takeEvery$1,
  takeLatest: takeLatest$1,
  takeLeading: takeLeading$1,
  throttle: throttle$1,
  effectTypes: effectTypes,
  take: take,
  takeMaybe: takeMaybe,
  put: put,
  putResolve: putResolve,
  all: all,
  race: race,
  call: call,
  apply: apply,
  cps: cps,
  fork: fork,
  spawn: spawn,
  join: join,
  cancel: cancel,
  select: select,
  actionChannel: actionChannel,
  cancelled: cancelled,
  flush: flush,
  getContext: getContext,
  setContext: setContext,
  delay: delay
});

function createSagas(model, sagaEffects) {
  var _marked =
  /*#__PURE__*/
  regeneratorRuntime.mark(runEffect);

  var sagas = [];
  var publicEffects = model.effects["public"];
  delete publicEffects.resetStore;
  delete publicEffects.setStore;
  Object.keys(publicEffects).forEach(function (effectKey) {
    var actionName = utils.publicEffect(model.namespace, effectKey);
    var effect = publicEffects[effectKey];
    sagas.push(getEffect(effect, effectKey, actionName));
  });
  var channelEffects = model.effects.channel;
  Object.keys(channelEffects).forEach(function (effectKey) {
    var actionName = utils.channelEffect(model.namespace, effectKey);
    var effect = channelEffects[effectKey];
    sagas.push(getEffect(effect, effectKey, actionName));
  }); // setStore方法同步更新state

  sagas.push(fork(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var namespace, action;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            namespace = utils.publicEffect(model.namespace, 'setStore');
            _context.next = 3;
            return take(namespace);

          case 3:
            action = _context.sent;
            _context.next = 6;
            return put({
              type: utils.reducerPrefix(namespace),
              data: action.data
            });

          case 6:
            setTimeout(function () {
              action.resolveAction();
            }, 0);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));

  function getEffect(effect, effectKey, actionName) {
    if (effect.constructor.name === 'Function') {
      return fork(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return takeEvery$1(actionName,
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee2(action) {
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return runEffect(effect(), action, effectKey);

                        case 2:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));
    } else {
      return fork(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        var action;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:

                _context4.next = 3;
                return take(actionName);

              case 3:
                action = _context4.sent;
                _context4.next = 6;
                return runEffect(effect, action, effectKey);

              case 6:
                _context4.next = 0;
                break;

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));
    }
  }

  function runEffect(effect, action, effectName) {
    var payload, resolveAction, rejectAction, setLoading, deleteLoading, ret;
    return regeneratorRuntime.wrap(function runEffect$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            payload = action.payload, resolveAction = action.resolveAction, rejectAction = action.rejectAction;

            if (!isNode) {
              setLoading = {
                type: utils.reducerPrefix(model.namespace, '@@setLoading'),
                effectName: effectName
              };
              deleteLoading = {
                type: utils.reducerPrefix(model.namespace, '@@deleteLoading'),
                effectName: effectName
              };
            }

            _context5.prev = 2;

            if (isNode) {
              _context5.next = 6;
              break;
            }

            _context5.next = 6;
            return put(setLoading);

          case 6:
            _context5.next = 8;
            return call(effect, payload, sagaEffects);

          case 8:
            ret = _context5.sent;

            if (isNode) {
              _context5.next = 12;
              break;
            }

            _context5.next = 12;
            return put(deleteLoading);

          case 12:
            resolveAction(ret);
            _context5.next = 26;
            break;

          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5["catch"](2);

            if (!isNode) {
              _context5.next = 21;
              break;
            }

            throw _context5.t0 || new Error('Unknow Error.');

          case 21:
            _context5.next = 23;
            return put(deleteLoading);

          case 23:
            App.emit('effectError', _context5.t0);
            rejectAction(_context5.t0);

          case 25:
            if (process.env.NODE_ENV === 'development') {
              console.error('error: ', _context5.t0);
            }

          case 26:
          case "end":
            return _context5.stop();
        }
      }
    }, _marked, null, [[2, 15]]);
  }

  var rootSaga =
  /*#__PURE__*/
  regeneratorRuntime.mark(function rootSaga() {
    return regeneratorRuntime.wrap(function rootSaga$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return all(sagas);

          case 2:
          case "end":
            return _context6.stop();
        }
      }
    }, rootSaga);
  });

  try {
    // 报错有更友好提示
    // redux-saga error: uncaught at ${namespace}Saga
    Object.defineProperty(rootSaga, 'name', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: "".concat(model.namespace, "Saga")
    });
  } catch (error) {}

  return rootSaga;
}

function createSagaEffects(model) {
  var sagaEffects = _objectSpread2({}, effects, {
    put:
    /*#__PURE__*/
    regeneratorRuntime.mark(function put$1(action) {
      return regeneratorRuntime.wrap(function put$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              action.type = utils.reducerPrefix(model.namespace, action.type);
              _context.next = 3;
              return put(action);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, put$1);
    }),
    call:
    /*#__PURE__*/
    regeneratorRuntime.mark(function call$1() {
      var _len,
          rest,
          _key,
          _rest$,
          fn,
          _sagaEffects,
          _args2 = arguments;

      return regeneratorRuntime.wrap(function call$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              for (_len = _args2.length, rest = new Array(_len), _key = 0; _key < _len; _key++) {
                rest[_key] = _args2[_key];
              }

              if (!(typeof rest[0] === 'string')) {
                _context2.next = 7;
                break;
              }

              _context2.next = 4;
              return call(model.effects["private"][rest[0]], _toConsumableArray(rest.splice(1)), sagaEffects);

            case 4:
              return _context2.abrupt("return", _context2.sent);

            case 7:
              _rest$ = rest[0], fn = _rest$.fn, _sagaEffects = _rest$.sagaEffects;
              _context2.next = 10;
              return call(fn, _toConsumableArray(rest.slice(1)), _sagaEffects);

            case 10:
              return _context2.abrupt("return", _context2.sent);

            case 11:
            case "end":
              return _context2.stop();
          }
        }
      }, call$1);
    })
  });

  return sagaEffects;
}

function createReducers(model) {
  var finallyReducer = function finallyReducer() {
    var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : model.states;
    var action = arguments.length > 1 ? arguments[1] : undefined;
    var reducerFn = model.reducers["".concat(action.type)];

    if (!reducerFn) {
      return initialState;
    } // 重置redux


    if (action.type.match('resetStore')) {
      return model.states;
    }

    var state = reducerFn(initialState, action);

    if (process.env.REACT_APP_MODE === 'WEBAPP_SSR') {
      if (isNode) {
        return state.set('__LOADED__', true);
      }
    }

    return state;
  };

  return finallyReducer;
}

function checkModel(model, registeredModel) {
  invariant(model.namespace, 'model.namespace: should be string');
  invariant(registeredModel[model.namespace] === undefined, "model.namespace: ".concat(model.namespace, " has been registered "));
  registeredModel[model.namespace] = model.namespace;

  if (model.reducers || model.states) {
    invariant(Immutable.Map.isMap(model.states), 'model.states: should be Immutable.Map');
    invariant(lodash.isFunction(model.selectors), 'model.selectors: should be function');

    if (model.states.get('loading')) {
      invariant(Immutable.List.isList(model.states.get('loading')), 'model.states.loading: should be Immutable.List');
    }
  }
}

function enhanceModel(model) {
  // 没有loading就添加loading
  var loading = model.states.get('loading') || [];
  model.states = model.states.merge({
    loading: loading
  });
  var reducerNamespace = utils.reducerPrefix(model.namespace);
  Object.keys(model.reducers).forEach(function (item) {
    // 支持从saga中put的时候，reducer名称与saga名一样
    model.reducers["".concat(reducerNamespace, "/").concat(item)] = model.reducers[item];
    delete model.reducers[item];
  }); // 默认一个名为setStore的reducer

  var customSetStore = model.reducers["".concat(reducerNamespace, "/setStore")];

  model.reducers["".concat(reducerNamespace, "/setStore")] = function setStore(state, payload) {
    if (customSetStore) {
      state = customSetStore(state, payload);
    }

    return state.merge(payload.data);
  };

  model.reducers["".concat(reducerNamespace, "/@@setLoading")] = function setLoading(state, _ref) {
    var effectName = _ref.effectName;
    return state.merge({
      loading: [].concat(_toConsumableArray(state.get('loading') || []), [effectName])
    });
  };

  model.reducers["".concat(reducerNamespace, "/@@deleteLoading")] = function setLoading(state, _ref2) {
    var effectName = _ref2.effectName;
    return state.update('loading', function () {
      var loading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var index = loading.findIndex(function (item) {
        return item === effectName;
      });

      if (index > -1) {
        loading = loading.splice(index, 1);
      }

      return loading;
    });
  };

  model.reducers["".concat(reducerNamespace, "/resetStore")] = function noop() {};
}

function setPlanObject(obj, name) {
  obj[name] = obj[name] ? obj[name] : {};
}

var registeredModal = {};
function rayslog(model) {
  if (!isNode) {
    checkModel(model, registeredModal);
  }

  setPlanObject(model, 'effects');
  setPlanObject(model.effects, 'private');
  setPlanObject(model.effects, 'public');
  setPlanObject(model.effects, 'channel');

  var _createActions = createActions(model),
      publicActions = _createActions.publicActions,
      channelActions = _createActions.channelActions;

  var sagaEffects = createSagaEffects(model);
  var sagas = createSagas(model, sagaEffects);
  injectSaga(model.namespace, sagas);
  var selectors = null;

  if (model.reducers) {
    enhanceModel(model);
    var reducers = createReducers(model);
    injectReducer(model.namespace, reducers);

    selectors = function selectors(state) {
      return model.selectors(state);
    };
  }

  function Wrap(Comp) {
    return redux.compose(reactRedux.connect(selectors, publicActions))(Comp);
  }

  Object.keys(model.effects.channel).forEach(function (key) {
    model.effects.channel[key] = {
      fn: model.effects.channel[key],
      sagaEffects: sagaEffects
    };
  });
  Wrap.effects = model.effects.channel;
  Wrap.actions = channelActions;
  return Wrap;
}

exports.initStore = initStore;
exports.model = rayslog;
//# sourceMappingURL=index.js.map
