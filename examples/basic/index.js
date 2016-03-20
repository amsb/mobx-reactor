import React from 'react'
import ReactDOM from 'react-dom'

import { observable, computed, map } from 'mobx'
import { Store, loggingMiddleware, StoreContext, Model, action, connect } from 'mobx-reactor'


// Models + Actions

class Todo {
  id = Math.random();
  @observable title;
  @observable isFinished = false;
  constructor(title) {
    this.title = title;
  }
}

class TodoList extends Model {
  @observable todos = map({});

  @computed get unfinishedTodoCount() {
    return this.todos.values().filter(todo => !todo.isFinished).length;
  }

  @action('addTodo')
  addTodo(title) {
    const todo = new Todo(title)
    this.todos.set(todo.id, todo)
  }

  @action('fail')
  fail() {
    throw Error('an error was encountered on purpose!')
  }

  @action('toggleTodo')
  toggleTodo(todoId) {
    const todo = this.todos.get(todoId)
    todo.isFinished = !todo.isFinished
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

const TodoView = ({title,isFinished,onToggle}) => (
  <li>
    <input
      type="checkbox"
      checked={isFinished}
      onClick={onToggle}
    />{title}
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

store.addAction('alert', async function(message) { alert(message) })

window.store = store

// Render

ReactDOM.render((
  <StoreContext store={store}>
    <TodoListViewContainer/>
  </StoreContext>
), document.querySelector("#root"))
