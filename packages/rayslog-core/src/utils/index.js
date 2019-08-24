import config from '../config'

function concatNamespace(namespace, name = '') {
  if(name) {
    name = `/${name}`
  }
  return `${namespace}${name}`
}

export default {
  publicEffect(namespace, name) {
    const ret = concatNamespace(namespace, name)
    return `${config.publicEffect}/${ret}`
  },
  channelEffect(namespace, name) {
    const ret = concatNamespace(namespace, name)
    return `${config.channelEffect}/${ret}`
  },
  reducerPrefix(namespace, name) {
    const ret = concatNamespace(namespace, name)
    return `${config.reducerPrefix}/${ret}`
  }
}