import { compose } from 'redux'
import { connect } from 'react-redux'
import isNode from 'detect-node'
import 'regenerator-runtime/runtime'
import createActions from './createActions'
import { injectSaga, injectReducer } from './store'
import createSagas from './createSagas'
import createSagaEffects from './createSagaEffects'
import createReducers from './createReducers'
import checkModel from './utils/checkModel'
import enhanceModel from './utils/enhanceModel'

function setPlanObject(obj, name) {
  obj[name] = obj[name] ? obj[name] : {}
}

const registeredModal = {}

export default function rayslog(model) {
  if(!isNode) {
    checkModel(model, registeredModal)
  }
  setPlanObject(model, 'effects')
  setPlanObject(model.effects, 'private')
  setPlanObject(model.effects, 'public')
  setPlanObject(model.effects, 'channel')

  const { publicActions, channelActions } = createActions(model)
  const sagaEffects = createSagaEffects(model)
  const sagas = createSagas(model,sagaEffects)
  injectSaga(model.namespace, sagas)

  let selectors = null
  if(model.reducers) {
    enhanceModel(model)
    const reducers = createReducers(model)
    injectReducer(model.namespace, reducers)
    selectors = state => model.selectors(state)
  }

  function Wrap(Comp) {
    return compose(
      connect(
        selectors,
        publicActions
      )
    )(Comp)
  }

  Object.keys(model.effects.channel).forEach(key => {
    model.effects.channel[key] = {
      fn: model.effects.channel[key],
      sagaEffects
    }
  });

  Wrap.effects = model.effects.channel
  Wrap.actions = channelActions

  return Wrap
}