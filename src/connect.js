import React from 'react'
import { autorun } from 'mobx'


export function connect(storeMap) {
  return function connector(Component) {

    class Connect extends React.Component {
      static contextTypes = {
        store: React.PropTypes.object.isRequired
      };

      constructor(props, context) {
        super(props, context)
        this.state = {}
        this.actions = {}
        for(let key in storeMap) {
          let value = storeMap[key](this.context.store)
          if(typeof(value) === 'function') {
            this.actions[key] = value
          } else {
            this.state[key] = value
          }
        }
      }

      componentWillMount() {
        this.autorunDisposer = autorun(() => {
          const nextState = {}
          Object.keys(this.state).forEach((key) => {
            nextState[key] = storeMap[key](this.context.store)
          })
          this.setState(nextState)
        })
      }

      componentWillUnount() {
        this.autorunDisposer()
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
