import React from 'react'
import { autorun } from 'mobx'
import { serialize } from './serialize'

export function connect(storeMap) {
  return function connector(Component) {

    class Connect extends React.Component {
      static contextTypes = {
        store: React.PropTypes.object.isRequired
      };

      constructor(props, context) {
        super(props, context)
        this.state = {}
        this.stateKeys = []
        this.actions = {}
        for(let key in storeMap) {
          const value = storeMap[key](this.context.store)
          if(typeof value === 'function') {
            this.actions[key] = value
          } else {
            this.stateKeys.push(key)
            this.state[key] = value
          }
        }
      }

      componentWillMount() {
        this.disposer = autorun(() => {
          const nextState = {}
          this.stateKeys.forEach((key) => {
            const mapValue = storeMap[key]
            if (typeof mapValue === 'function') {
              const value = mapValue(this.context.store)
              nextState[key] = value
            }
          })
          this.setState(nextState)
        })
      }

      componentWillUnmount() {
        this.disposer()
      }

      render() {
        return React.createElement(Component, {
          ...this.state,
          ...this.actions
        })
      }
    }

    return Connect
  }
}
