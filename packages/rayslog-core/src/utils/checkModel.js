import invariant from 'invariant'
import Immutable from 'immutable'
import { isFunction } from 'lodash'

export default function checkModel(model, registeredModel) {
  invariant(model.namespace, 'model.namespace: should be string')
  invariant(
    registeredModel[model.namespace] === undefined,
    `model.namespace: ${model.namespace} has been registered `
  );
  registeredModel[model.namespace] = model.namespace;
  
  if(model.reducers || model.states) {
    invariant(
      Immutable.Map.isMap(model.states),
      'model.states: should be Immutable.Map'
    );
    invariant(
      isFunction(model.selectors),
      'model.selectors: should be function'
    );
    if (model.states.get('loading')) {
      invariant(
        Immutable.List.isList(model.states.get('loading')),
        'model.states.loading: should be Immutable.List'
      );
    }
  }
}