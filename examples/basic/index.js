import React from 'react'
import ReactDOM from 'react-dom'
import { v4 as uuid } from 'uuid'

import { observable, computed, map, toJSON } from 'mobx'
import { Store, loggingMiddleware, StoreContext, Model, action, connect, serialize } from 'mobx-reactor'

// Models + Actions

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

class TodoList extends Model {
  @observable todos = map()

  @computed get unfinishedTodoCount() {
    return this.todos.values().filter(todo => !todo.isFinished).length
  }

  @action('addTodo')
  addTodo(title, tags=[]) {
    const todo = new Todo(title, tags)
    this.todos.set(todo.id, todo)
  }

  @action('fail')
  fail() {
    throw Error('an error was encountered on purpose!')
  }

  @action('toggleTodo')
  toggleTodo(todoId) {
    const todo = this.todos.get(todoId)
    if(todo) {
      todo.isFinished = !todo.isFinished
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
    loggingMiddleware()
  ]
)

// Sample Data and Interactions

store.dispatch('addTodo')('Buy milk', ['grocery'])
store.dispatch('addTodo')('Buy tofu', ['grocery'])
store.dispatch('addTodo')('Sell phone', ['mall'])

// ISSUE: serialize breaks-down here
console.log(serialize(store.state.todoList.todos))
//console.log(toJSON(store.state.todoList.todos))

// setTimeout(() => { console.log('add a todo'); store.dispatch('addTodo')('Get a  dog', ['CT']) }, 1000)
// setTimeout(() => { console.log('change a title'); store.state.todoList.todos.values()[0].title = 'Buy WHOLE milk' }, 3000)
// setTimeout(() => { console.log('mark one as finished'); store.state.todoList.todos.values()[1].isFinished = true }, 5000)
// setTimeout(() => { console.log('add a tag'); store.state.todoList.todos.values()[2].tags.push('NEWTAG') }, 7000)
// setTimeout(() => { console.log('add a todo'); store.dispatch('addTodo')('Buy dog food', ['petco']) }, 9000)
// //window.store = store

// Render

ReactDOM.render((
  <StoreContext store={store}>
    <TodoListViewContainer/>
  </StoreContext>
), document.querySelector("#root"))
