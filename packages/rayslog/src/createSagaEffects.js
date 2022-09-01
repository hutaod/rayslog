import * as effects from 'redux-saga/effects'
import utils from './utils'

export default function createSagaEffects(model) {
  const sagaEffects = {
    ...effects,
    *put(action) {
      action.type = utils.reducerPrefix(model.namespace, action.type)
      yield effects.put(action)
    },
    *call(...rest) {
      if(typeof rest[0] === 'string') {
        // ?
        return yield effects.call(
          model.effects.private[rest[0]],
          [...rest.splice(1)],
          sagaEffects
        )
      } else {
        const { fn, sagaEffects } = rest[0]
        return yield effects.call(fn, [...rest.slice(1)], sagaEffects)
      }
    }
  }

  return sagaEffects
}