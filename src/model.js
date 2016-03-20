import React from 'react'
import { observable, computed, autorun } from 'mobx'
import { autobind } from 'core-decorators'

export class Model {
  constructor() {
  }
}

export function action(actionType, options={}) {
  return function decorator(target, name, descriptor) {
    action = { methodName:name, ...options }
    if(!target.hasOwnProperty('__actions__')) {
      target.__actions__ = {[actionType]: [action]}
    } else if(!target.__actions__.hasOwnProperty(actionType)) {
      target.__actions__[actionType] = [action]
    } else {
      target.__actions__[actionType].push(action)
    }
    descriptor = autobind(target, name, descriptor)
    return descriptor
  }
}

export function dispatch(actionType, options={}) {
  return (...payload) => {
    return {
      actionType,
      options,
      payload
    }
  }
}
