import React from 'react'
import ReactDOM from 'react-dom'
import { v4 as uuid } from 'uuid'

import { observable, computed, map } from 'mobx'
import { Store, logger, StoreContext, Model, action, dispatch, call, connect } from 'mobx-reactor'
import { exemplar } from 'mobx-reactor/middleware/exemplar'

// Auth "Lib"

function authorize(username, password) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (Math.random() >= 0.5) {
      resolve({ username: username, userId: 101, token: 'AUTHTOKEN' })
    } else {
      reject(Error('random failure'))
    }
  }, 2000))
}

function sleep(n) {
  return new Promise((resolve, reject) => setTimeout(() => {
    resolve(null)
  }, n))
}

// Models + Actions

class Auth extends Model {
  @observable status = 'UNAUTHORIZED';
  @observable token = '';
  @observable userId = '';
  @observable username = 'anonymous';

  @action('auth.LoginRequested')
  login (username, password) {
    return function* () {
      this.status = 'PENDING'
      this.username = username
      try {
        const authData = yield call(authorize)(username, password)
        this.status = 'AUTHORIZED'
        this.token = authData.token
        this.userId = authData.userId
        this.username = authData.username
        yield dispatch('auth.LoggedIn')()
        return dispatch('auth.RefreshRequested')(5)
      } catch (error) {
        this.status = 'FAILED'
        this.token = ''
        return dispatch('auth.LoginError')()
      }
    }.bind(this)()
  }

  @action('auth.Logout')
  logout () {
    this.status = 'UNAUTHORIZED'
    this.token = ''
  }

  @action('auth.RefreshRequested')
  refresh (waitTime=0) {
    return function* () {
      if (waitTime) {
        yield call(sleep)(waitTime*1000)
      }
      if(this.status === 'AUTHORIZED') {
        console.info('Authorization refeshed!')
        return dispatch('auth.RefreshRequested')(100*waitTime)
      }
    }.bind(this)()
  }

}


// Pure Components

class LoginForm extends React.Component {
  static PropTypes = {
    status: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props)
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.onSubmit(
      this.refs.username.value,
      this.refs.password.value
    )
    this.refs.password.value = ''
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label><input ref="username" placeholder="username" defaultValue={this.props.username} /></label>
        <label><input ref="password" placeholder="password"/></label> (hint: password1)<br />
        <p>{this.props.username}</p>
        <button type="submit">login</button>
        {this.props.status == 'UNAUTHORIZED' && (
          <p>You are not logged in.</p>
        )}
        {this.props.status == 'PENDING' && (
          <p>Logging in {this.props.username}..</p>
        )}
        {this.props.status == 'AUTHORIZED' && (
          <p>Success!</p>
        )}
        {this.props.status == 'FAILED' && (
          <p>Invalid login information</p>
        )}
      </form>
    )
  }
}


// Connected Components

const Login = connect({
  'status': store => store.state.auth.status,
  'username': store => store.state.auth.username,
  'onSubmit': store => store.dispatch('auth.LoginRequested'),
})(LoginForm)

const Logout = connect({
  'onClick': store => store.dispatch('auth.Logout')
})(({onClick}) => (
  <button onClick={() => onClick()}>
    Logout
  </button>
))

// Store

const store = new Store(
  {
    auth: new Auth(),
  },
  [
    logger()
  ]
)

//window.store = store

// Render

ReactDOM.render((
  <StoreContext store={store}>
    <div>
      <Login/>
      <Logout/>
    </div>
  </StoreContext>
), document.querySelector("#root"))
