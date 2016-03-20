import React from 'react'

export class StoreContext extends React.Component {
  static childContextTypes = {
    store: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return { store: this.store }
  }

  constructor(props, context) {
    super(props, context)
    this.store = props.store
  }

  render() {
    const { children } = this.props
    return React.Children.only(children)
  }
}
