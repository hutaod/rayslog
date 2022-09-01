import { take, fork, call, all, put, takeEvery } from 'redux-saga/effects'
import isNode from 'detect-node'
import eventBus from './EventBus'
import utils from './utils'

export default function createSagas(model, sagaEffects) {
  const sagas = []
  let { public: publicEffects } = model.effects
  delete publicEffects.resetStore
  delete publicEffects.setStore
  Object.keys(publicEffects).forEach(effectKey => {
    const actionName = utils.publicEffect(model.namespace, effectKey)
    const effect = publicEffects[effectKey]
    sagas.push(getEffect(effect, effectKey, actionName))
  })

  let { channel: channelEffects } = model.effects
  Object.keys(channelEffects).forEach(effectKey => {
    const actionName = utils.channelEffect(model.namespace, effectKey)
    const effect = channelEffects[effectKey]
    sagas.push(getEffect(effect, effectKey, actionName))
  })

  // setStore方法同步更新state
  sagas.push(
    fork(function*() {
      const namespace = utils.publicEffect(model.namespace, 'setStore')
      const action = yield take(namespace)
      yield put({
        type: utils.reducerPrefix(namespace),
        data: action.data
      })
      setTimeout(() => {
        action.resolveAction()
      }, 0)
    })
  )

  function getEffect(effect, effectKey, actionName) {
    if (effect.constructor.name === 'Function') {
      return fork(function*() {
        yield takeEvery(actionName, function*(action) {
          yield runEffect(effect(), action, effectKey)
        })
      })
    } else {
      return fork(function*() {
        while (true) {
          const action = yield take(actionName)
          yield runEffect(effect, action, effectKey)
        }
      })
    }
  }

  function* runEffect(effect, action, effectName) {
    const { payload, resolveAction, rejectAction } = action
    let setLoading
    let deleteLoading
    if (!isNode) {
      setLoading = {
        type: utils.reducerPrefix(model.namespace, '@@setLoading'),
        effectName
      }
      deleteLoading = {
        type: utils.reducerPrefix(model.namespace, '@@deleteLoading'),
        effectName
      }
    }

    try {
      if (!isNode) {
        yield put(setLoading)
      }
      const ret = yield call(effect, payload, sagaEffects)
      if (!isNode) {
        yield put(deleteLoading)
      }
      resolveAction(ret)
    } catch (error) {
      if (isNode) {
        // 服务端渲染错误页面
        throw error || new Error('Unknow Error.')
      } else {
        yield put(deleteLoading)
        eventBus.emit('effectError', error)
        rejectAction(error)
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('error: ', error)
      }
    }
  }

  const rootSaga = function*() {
    yield all(sagas)
  }

  try {
    // 报错有更友好提示
    // redux-saga error: uncaught at ${namespace}Saga
    Object.defineProperty(rootSaga, 'name', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: `${model.namespace}Saga`
    })
  } catch (error) {}
  return rootSaga
}
