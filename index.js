const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const shortid = require('shortid');
const url = require('url');
const querystring = require('querystring');
const todosPath = path.resolve('./db/todos.json');

const host = 'localhost';
const port = 8000;

const todos = require('./db/todos.json');

const requestListener = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200);
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
          res.writeHead(200);
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
        res.writeHead(200);
        res.end(JSON.stringify(todos));
      })
      .catch(err => console.log(err.message));
  } else if (req.method === 'PUT') {
    const parsed = url.parse(req.url);
    const query = querystring.parse(parsed.query);
    let body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      let text = JSON.parse(body);
      fs.readFile(todosPath, 'utf-8')
        .then(data => {
          const todos = JSON.parse(data);
          console.log('queryid', query.id);
          const todoToUpdate = todos.find(todo => todo.id === query.id);
          const newTodo = {
            id: todoToUpdate.id,
            description: text,
            completed: todoToUpdate.completed,
          };
          const newTodos = todos.map(todo => {
            if (todo.id === query.id) {
              todo = newTodo;
            }
            return todo;
          });
          fs.writeFile(todosPath, JSON.stringify(newTodos, null, 2));
          res.writeHead(200);
          res.end(JSON.stringify(todos));
        })
        .catch(err => console.log(err.message));
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Not found' }));
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

// const PORT = process.env.PORT || 8000;

// app.listen(PORT, () => {
//   console.log(`Server running. Use our API on port: ${PORT}`)
// })
