import React from 'react'
import { observable, computed, autorun } from 'mobx'
import { autobind } from 'core-decorators'

export class Model {
  constructor() {
  }
}

export function action(type, options={}) {
  return function decorator(target, name, descriptor) {
    action = {
      methodName: name,
      displayName: target.constructor.name + '.' + name,
      ...options
    }
    if(!target.hasOwnProperty('__actions__')) {
      target.__actions__ = {[type]: [action]}
    } else if(!target.__actions__.hasOwnProperty(type)) {
      target.__actions__[type] = [action]
    } else {
      target.__actions__[type].push(action)
    }
    descriptor = autobind(target, name, descriptor)
    return descriptor
  }
}

export function dispatch(type, options={}) {
  return (...payload) => {
    return {
      type,
      options,
      payload
    }
  }
}
