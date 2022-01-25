function updateTodo(id, description) {
  const id = id.toString();
  fs.readFile(todosPath, 'utf-8')
    .then(data => {
      const todos = JSON.parse(data);
      const todoToUpdate = todos.find(todo => todo.id === id);
      const newTodo = { id, description, completed: todoToUpdate.completed };
      const newTodos = todoArray.map(todo => {
        if (todo.id === id) {
          todo = newTodo;
        }
        return todo;
      });
      fs.writeFile(todosPath, JSON.stringify(newTodos, null, 2));
      console.log(data);
    })
    .catch(err => console.log(err.message));
}
