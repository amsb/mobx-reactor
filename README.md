# MobX-Reactor

This is an experiment in connecting MobX data stores to functional stateless React components with async actions and unidirectional data flow in a flux-like architecture. It's heavily inspired by `redux`, `react-redux` and `redux-saga`, but forgoing immutability it uses `mobx` to communicate fine-grained asynchronous updates to pure view components and manage caching of derived data.

**This highly experimental, a work-in-progress, unstable, etc. CAVEAT EMPTOR.**

This experiment embraces several recently and not-quite-yet standardized features of Javascript, including async/await and decorators.

### Store

A single shared `Store` holds application state and provides a method to `dispatch` actions to affect application logic. State and actions for operating on that state are organized into sub-objects. Each sub-object is a `model`. A `Store` can be configured with `middleware` that provides an extension point for action processing. Middleware can be created to perform activities like logging and crash reporting.


```javascript
const store = new Store(
  {
    todoList: new TodoList(),
  },
  [
    loggingMiddleware()
  ]
)
```

### Actions

Actions may be execute immediately or asynchronously. Actions are asynchronous when they return a `Promise` or [declared `async`](https://tc39.github.io/ecmascript-asyncawait/). Middleware can also be created to enhance how actions are processed, allowing for chaining of actions or `redux-saga`-like inversion of control through generator functions. The return value from an action is processed by `middleware`. The `chainingMiddleware`, for example, allows actions to return a description of another action to dispatch.


### Models

Models provide a construct to organize state with methods that operate on that state in response to relevant actions. While all state is defined through models, actions do not have to be associated with models although it is often convenient to do so. All actions are registered with the store and can have multiple responders across different models or unattached to models.

```javascript
class TodoList extends Model {
  @observable todos = map({});

  @computed get unfinishedTodoCount() {
    return this.todos.values().filter(todo => !todo.isFinished).length;
  }

  @action('addTodo')
  addTodo(title) {
    const todo = new Todo(title)
    this.todos.set(todo.id, todo)
    return dispatch('saveTodo')(todo.id)
  }

  @action('saveTodo')
  async saveTodo(title) {
    const todo = this.todos.get(todoId)
    try {
      await server.saveTodo({id: todo.id, title: todo.title})
    } catch (error) {
      return dispatch('saveTodoFailed')(todo.id, error)
    }
  }

  @action('toggleTodo')
  toggleTodo(todoId) {
    const todo = this.todos.get(todoId)
    todo.isFinished = !todo.isFinished
  }
}
```

The `@action(actionType)` decorator declares that the decorated method responds to the named action type. There is no relationship between the method name and the action type.


### Store Context

A `StoreContext` component is created to share the store with child components.

```javascript
<StoreContext store={store}>
  <TodoListViewContainer/>
</StoreContext>
```

### Connections

This experiment has as one of its primary goals to enable writing stateless functional ("pure") React components like this one:

```javascript
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
```

Components written like this can be tested independent of the state management framework and used with other state manage frameworks like Redux.

With `StoreContext` as a parent, child components can be simply and declaratively wrapped with a Connect component that manages the state updates from the Store.

```javascript
const TodoListViewContainer = connect(
  {
    todos: store => store.state.todoList.todos,
    unfinishedTodoCount: store => store.state.todoList.unfinishedTodoCount,
    toggleTodo: store => store.dispatch('toggleTodo'),
    addTodo: store => store.dispatch('addTodo')
  }
)(TodoListView)
```

### Example

```
npm install
cd examples/basic
npm install
npm start
```
