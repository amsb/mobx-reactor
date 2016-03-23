import { createTransformer, isObservable, isObservableArray, isObservableMap } from 'mobx'

export function serialize(obj, options={}) {
  const withComputed = options.withComputed || false
  const keepMap = options.keepMap || false

  const _serialize = createTransformer(obj => {
    if (isObservableMap(obj)) {
      if (keepMap) {
        const serializedObj = new Map()
        obj.entries().forEach(([k,v]) => {
          serializedObj.set(k, isObject(v) ? _serialize(v) : v)
        })
        return serializedObj
      } else {
        const serializedObj = {}
        obj.entries().forEach(([k,v]) => {
          serializedObj[k] = isObject(v) ? _serialize(v) : v
        })
        return serializedObj
      }
    } else if (isObservableArray(obj)) {
      return obj.map(v => isObject(v) ? _serialize(v) : v)
    } else if (isObservable(obj)) {
      const serializedObj = {}
      Object.keys(obj).forEach(k => {
        const v = obj[k]
        serializedObj[k] = isObject(v) ? _serialize(v) : v
      })
      if (withComputed) {
        Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach(k => {
          if (!obj.hasOwnProperty(k) && !(k in serializedObj)) {
            const v = obj[k]
            if (typeof v !== 'function') {
              serializedObj[k] = isObject(v) ? _serialize(v) : v
            }
          }
        })
      }
      return serializedObj
    } else if (isPlainObject(obj)) {
      const serializedObj = {}
      Object.keys(obj).forEach(k => {
        const v = obj[k]
        serializedObj[k] = isObject(v) ? _serialize(v) : v
      })
      return serializedObj
    } else {
      return obj
    }
  })
  if (isObject(obj)) {
    return _serialize(obj)
  } else {
    return obj
  }
}

function isObject(value) {
  return (value !== null
    && typeof value === "object"
  )
}

function isPlainObject(value) {
    return (value !== null
    && typeof value === "object"
    && Object.getPrototypeOf(value) === Object.prototype
  )
}
