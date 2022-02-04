const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

const todosRouter = require('./routes/api/todos.ts');

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(bodyParser.json({ type: 'application/*+json' }));
// app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
// app.use(bodyParser.text({ type: 'text/html' }));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use('/todos', todosRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err });
});

module.exports = app;
