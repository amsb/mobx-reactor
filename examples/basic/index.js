import React from 'react'
import ReactDOM from 'react-dom'
import { v4 as uuid } from 'uuid'

import { observable, computed, map } from 'mobx'
import { Store, logger, StoreContext, Substore, action, connect, serialize } from 'mobx-reactor'

// Model
class Todo {
  id = uuid()
  @observable title
  @observable isFinished = false
  @observable tags = []
  @computed get displayTags() { return this.tags.join() }
  constructor(title, tags=[]) {
    this.title = title
    this.tags.push(...tags)
  }
}

// Sub-store + Actions

class TodoList extends Substore {
  @observable todos = map()

  @computed get unfinishedTodoCount() {
    return this.todos.values().filter(todo => !todo.isFinished).length
  }

  @action('addTodo')
  addTodo(title, tags=[]) {
    const todo = new Todo(title, tags)
    this.todos.set(todo.id, todo)
  }

  @action('exampleError')
  exampleError() {
    throw Error('an example error!')
  }

  @action('toggleTodo')
  toggleTodo(todoId) {
    const todo = this.todos.get(todoId)
    if(todo) {
      todo.isFinished = !todo.isFinished
    }
  }

  @action('updateTodo')
  updateTodo(todoId, updates={}) {
    const todo = this.todos.get(todoId)
    if(todo) {
      Object.entries(updates).forEach(([key,value]) => {
        todo[key] = value
      })
    }
  }
}


// Pure Components

class TodoListView extends React.Component {
  handleSubmit = (event) => {
    event.preventDefault()
    this.props.addTodo(this.refs.newTodoTitle.value)
    this.refs.newTodoTitle.value = ''
  }
  render() {
    return (
      <div>
        <ul>
          {this.props.todos.values().map(todo =>
            <TodoView
              key={todo.id}
              title={todo.title}
              isFinished={todo.isFinished}
              displayTags={todo.displayTags}
              onToggle={() => this.props.toggleTodo(todo.id)}
            />
          )}
        </ul>
        Tasks left: {this.props.unfinishedTodoCount}
        <form onSubmit={this.handleSubmit}>
          <label><input ref="newTodoTitle" placeholder="Add todo..." /> <button type="submit">Add</button></label>
        </form>
      </div>
    )
  }
}

const TodoView = ({title,isFinished,displayTags,onToggle}) => (
  <li>
    <input
      type="checkbox"
      checked={isFinished}
      onClick={onToggle}
    />{title} ({displayTags})
  </li>
)


// Connected Components

const TodoListViewContainer = connect(
  {
    todos: store => store.state.todoList.todos,
    unfinishedTodoCount: store => store.state.todoList.unfinishedTodoCount,
    toggleTodo: store => store.dispatch('toggleTodo'),
    addTodo: store => store.dispatch('addTodo')
  }
)(TodoListView)


// Store

const store = new Store(
  {
    todoList: new TodoList(),
  },
  [
    logger()
  ]
)

// Sample Data and Interactions

store.dispatch('addTodo')('Buy milk', ['grocery'])
store.dispatch('addTodo')('Buy tofu', ['grocery'])
store.dispatch('addTodo')('Sell phone', ['mall'])

setTimeout(() => { console.log('dispatch to add a todo'); store.dispatch('addTodo')('Get a  dog', ['CT']) }, 1000)
setTimeout(() => { console.log('directly change a title'); store.state.todoList.todos.values()[0].title = 'Buy WHOLE milk' }, 3000)
setTimeout(() => { console.log('directly mark one as finished'); store.state.todoList.todos.values()[1].isFinished = true }, 5000)
setTimeout(() => { console.log('directly add a tag'); store.state.todoList.todos.values()[2].tags.push('NEWTAG') }, 7000)
setTimeout(() => { console.log('dispatch add a todo'); store.dispatch('addTodo')('Buy dog food', ['petco']) }, 9000)
setTimeout(() => { console.log('dispatch change title'); store.dispatch('updateTodo')(store.state.todoList.todos.keys()[3], { title: 'Get a VISZLA!' }) }, 11000)

setTimeout(() => { console.log('dispatch change title'); store.dispatch('exampleError')() }, 500)

//window.store = store

// Render

ReactDOM.render((
  <StoreContext store={store}>
    <TodoListViewContainer/>
  </StoreContext>
), document.querySelector("#root"))
