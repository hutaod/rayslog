import { bindActionCreators } from 'redux'
import isNode from 'detect-node'
import utils from './utils'
import config from './config'
import { getStore } from './store'

export default function createActions(model) {
  const publicActions = createPublicActions(model)
  const channelActions = createChannelActions(model)
  return {
    publicActions,
    channelActions
  }
}

function createChannelActions(model) {
  const actions = {}
  Object.keys(model.effects.channel).forEach(effectKey => {
    const actionType = utils.channelEffect(model.namespace, effectKey)
    actions[effectKey] = (...rest) => {
      return getStore().dispatch({
        type: actionType,
        payload: [...rest],
        [config.actionPrefix]: true
      })
    }
  })

  return actions
}

function createPublicActions(model) {
  // 给每一个model添加重置store的方法
  const actionCreators = {
    resetStore: () => ({
      type: utils.reducerPrefix(model.namespace, 'resetStore')
    }),
    setStore: data => ({
      type: utils.reducerPrefix(model.namespace, 'setStore'),
      [config.actionPrefix]: true,
      data
    })
  }

  Object.keys(model.effects.public).forEach(effectKey => {
    const actionType = utils.publicEffect(model.namespace, effectKey)
    actionCreators[effectKey] = (...rest) => (dispatch, getState) => {
      if (process.env.REACT_APP_MODE === 'WEBAPP_SSR' && !isNode) {
        // 数据已经从Node服务器获取，客户端不再获取（仅第一次）
        if (getState()[model.namespace].get('__LOADED__')) {
          return dispatch(
            actionCreators.setStore({
              __LOADED__: null
            })
          );
        }
      }
      return dispatch({
        type: actionType,
        payload: rest,
        [config.actionPrefix]: true
      })
    }
  })
  return dispatch => bindActionCreators(actionCreators, dispatch)
}