import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers
} from 'redux'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import config from './config'

const sagaMiddleware = createSagaMiddleware()

const allSagas = {};
const allReducer = {};
let store = null

// 调用action后返回Promise，方便在接口调用完成后，获取返回值
function actionMiddleware() {
  return next => action => {
    if(action[config.actionPrefix]) {
      next(action);
      return new Promise((reslove, reject) => {
        action.resolveAction = reslove;
        action.rejectAction = reject;
      })
    }
    return next(action)
  }
}

function runSaga(namespace) {
  if(namespace) {
    return sagaMiddleware.run(allSagas[namespace]).done
  } else {
    const allPromise = [];
    Object.keys(allSagas).forEach(sage => {
      allPromise.push(sagaMiddleware.run(allSagas[sage]).done)
    })
    return allPromise
  }
}

export function initStore(initialStore = {}) {
  const enhanceMiddleware = []
  if(process.env.NODE_ENV === 'development') {
    /* eslint-disable no-undef */
    if(typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function') {
      enhanceMiddleware.push(__REDUX_DEVTOOLS_EXTENSION__())
    }
  }
  const middleware = compose(
    applyMiddleware(sagaMiddleware, thunk, actionMiddleware),
    ...enhanceMiddleware
  )

  const reducers = combineReducers({
    ...allReducer
  })
  store = createStore(reducers, initialStore, middleware)
  store.runSaga = runSaga
  return store
} 

export function injectSaga(namespace, sage) {
  allSagas[namespace] = sage
}

export function injectReducer(namespace, reducer) {
  allReducer[namespace] = reducer
  if(store) {
    store.replaceReducer(combineReducers({
      ...allReducer
    }))
  }
}

export function getStore() {
  return store
}

