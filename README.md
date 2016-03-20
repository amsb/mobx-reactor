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

With `StoreContext` as a parent, child components can be written as pure ("functional stateless" or "props-only") React components and wrapped with a Connect component that manages the

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
