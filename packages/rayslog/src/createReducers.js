import isNode from 'detect-node'

export default function createReducers(model) {
  const finallyReducer = (
    initialState = model.states, 
    action
  ) => {
    const reducerFn = model.reducers[`${action.type}`]
    if(!reducerFn) {
      return initialState
    }
    // 重置redux
    if(action.type.match('resetStore')) {
      return model.states
    }
    const state = reducerFn(initialState, action)
    if(process.env.REACT_APP_MODE === 'WEBAPP_SSR') {
      if(isNode) {
        return state.set('__LOADED__', true)
      }
    }

    return state
  }

  return finallyReducer
}