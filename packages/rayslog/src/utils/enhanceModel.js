import utils from './index'

export default function enhanceModel(model) {
  // 没有loading就添加loading
  const loading = model.states.get('loading') || []
  model.states = model.states.merge({
    loading
  })

  const reducerNamespace = utils.reducerPrefix(model.namespace)
  Object.keys(model.reducers).forEach(item => {
    // 支持从saga中put的时候，reducer名称与saga名一样
    model.reducers[`${reducerNamespace}/${item}`] = model.reducers[item]
    delete model.reducers[item]
  })

  // 默认一个名为setStore的reducer
  const customSetStore = model.reducers[`${reducerNamespace}/setStore`]
  model.reducers[`${reducerNamespace}/setStore`] = function setStore(state,
    payload) {
    if(customSetStore) {
      state = customSetStore(state, payload)
    }
    return state.merge(payload.data)
  }

  model.reducers[`${reducerNamespace}/@@setLoading`] = function setLoading(
    state, {
      effectName
    }
  ) {
    return state.merge({
      loading: [...(state.get('loading') || []), effectName]
    })
  }

  model.reducers[`${reducerNamespace}/@@deleteLoading`] = function setLoading(
    state, {
      effectName
    }
  ) {
    return state.update('loading', (loading = []) => {
      const index = loading.findIndex(item => item === effectName)
      if(index > -1) {
        loading = loading.splice(index, 1)
      }
      return loading
    })
  }

  model.reducers[`${reducerNamespace}/resetStore`] = function noop() {};
}