const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const shortid = require('shortid');
const url = require('url');
const querystring = require('querystring');
const todosPath = path.resolve('./db/todos.json');
const todos = require(todosPath);

const host = 'localhost';
const port = 8000;

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Request-Method': '*',
    'Access-Control-Allow-Methods': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': '*',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (['GET', 'POST', 'DELETE', 'PUT'].indexOf(req.method) > -1) {
    res.writeHead(200, headers);
    if (req.url === '/todos' && req.method === 'GET') {
      res.writeHead(200, headers);
      res.end(JSON.stringify(todos));
    } else if (req.url === '/todos' && req.method === 'POST') {
      let body = '';
      req.on('data', function (data) {
        body += data;
      });
      req.on('end', function () {
        let text = JSON.parse(body);
        fs.readFile(todosPath)
          .then(data => {
            const todos = JSON.parse(data);
            JSON.stringify(
              todos.push({
                id: shortid(),
                description: text,
                completed: false,
              }),
            );
            fs.writeFile(todosPath, JSON.stringify(todos, null, 2));
            res.writeHead(200, headers);
            res.end(JSON.stringify(todos));
          })
          .catch(err => console.log(err.message));
      });
    } else if (req.method === 'DELETE') {
      const parsed = url.parse(req.url);
      const query = querystring.parse(parsed.query);
      fs.readFile(todosPath, 'utf-8')
        .then(data => {
          const todos = JSON.parse(data);
          const newTodos = todos.filter(item => item.id !== query.id);
          fs.writeFile(todosPath, JSON.stringify(newTodos, null, 2));

          res.writeHead(200, headers);
          res.end(JSON.stringify(newTodos));
        })
        .catch(err => console.log(err.message));
    } else if (req.url === '/todos/clear-completed') {
      fs.readFile(todosPath, 'utf-8')
        .then(data => {
          const todos = JSON.parse(data);
          const newTodos = todos.filter(item => item.completed === false);
          fs.writeFile(todosPath, JSON.stringify(newTodos, null, 2));
          res.end(JSON.stringify(newTodos));
        })
        .catch(err => console.log(err.message));
    } else if (req.method === 'PUT') {
      let body = '';
      req.on('data', function (data) {
        body = data;
      });
      req.on('end', function () {
        let parsedBody = JSON.parse(body);
        fs.readFile(todosPath, 'utf-8')
          .then(data => {
            if (parsedBody !== undefined) {
              const todos = JSON.parse(data);
              const todoToUpdate = todos.find(
                todo => todo.id === parsedBody.id,
              );
              const newTodo = {
                ...todoToUpdate,
                ...parsedBody,
              };
              const newTodos = todos.map(todo => {
                if (todo.id === todoToUpdate.id) {
                  todo = newTodo;
                }
                return todo;
              });
              fs.writeFile(todosPath, JSON.stringify(newTodos, null, 2));
              res.writeHead(200, headers);
              res.end(JSON.stringify(newTodos));
            }
          })
          .catch(err => console.log(err.message));
      });
    } else if (req.url === '/todos/toggle-completed') {
      fs.readFile(todosPath, 'utf-8')
        .then(data => {
          const todos = JSON.parse(data);
          const isAnyActive = todos.some(todo => todo.completed === false);
          let newTodos;
          if (isAnyActive) {
            newTodos = todos.map(todo => {
              todo.completed = true;
              return todo;
            });
          } else {
            newTodos = todos.map(todo => {
              todo.completed = false;
              return todo;
            });
          }
          fs.writeFile(todosPath, JSON.stringify(newTodos, null, 2));
          res.end(JSON.stringify(newTodos));
        })
        .catch(err => console.log(err.message));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Not found' }));
    }
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

// const express = require("express");
// const cors = require("cors");
// const app = express();

// const todosRouter=require("./")

// app.use(cors());
// app.use(express.json());

// app.use("/api/todos", todosRouter);

// var staticPath = path.join(__dirname, '/');
// app.use(express.static(staticPath));
// const PORT = process.env.PORT || 8000;

// app.listen(PORT, () => {
//   console.log(`Server running. Use our API on port: ${PORT}`)
// })
