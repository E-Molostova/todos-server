const express = require('express');
// const { Request, Response } = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { collections } = require('../../service/database.service.ts');
// const Todo = require('../../model/todo.ts');

router.get('/', async (req, res, next) => {
  try {
    // const todos = (await collections.todos.find({}).toArray()) as Todo[];
    // res.status(200).send(todos);

    const collection = req.app.locals.collection;
    collection.find().toArray(function (err, todos) {
      if (err) return console.log(err);
      res.status(201).json(todos);
    });
  } catch (err) {
    next(err);
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res, next) => {
  try {
    // const newTodo = req.body as Todo;
    // const result = await collections.todos.insertOne(newTodo);

    // result
    //   ? res
    //       .status(201)
    //       .send(`Successfully created a new todo with id ${result.insertedId}`)
    //   : res.status(500).send('Failed to create a new todo.');

    if (!req.body) return res.sendStatus(400);
    const collection = req.app.locals.collection;
    const newTodo = { ...req.body, completed: false };
    const result = collection.insertOne(newTodo);
    const data = collection.findOne({ _id: result.insertedId });
    res.send(data);
    res.status(201);
    // res.status(201).json(data);
  } catch (err) {
    res.status(400).send(err.message);
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = req?.params?.id;

  try {
    // const query = { _id: ObjectId(id) };
    // const result = await collections.todos.deleteOne(query);

    // if (result && result.deletedCount) {
    //   res.status(202).send(`Successfully removed todo with id ${id}`);
    // } else if (!result) {
    //   res.status(400).send(`Failed to remove todo with id ${id}`);
    // } else if (!result.deletedCount) {
    //   res.status(404).send(`Todo with id ${id} does not exist`);
    // }

    const collection = req.app.locals.collection;
    const result = await collection.findOneAndDelete({
      _id: ObjectId(id),
    });
    if (!result) {
      res.status(404);
    }
    res.json({ message: 'contact deleted' });
  } catch (err) {
    res.status(400).send(err.message);
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = req?.params?.id;
  try {
    // const updatedTodo: Todo = req.body as Todo;
    // const query = { _id: ObjectId(id) };
    // const result = await collections.todos.updateOne(query, {
    //   $set: updatedTodo,
    // });
    // result
    //   ? res.status(200).send(`Successfully updated todo with id ${id}`)
    //   : res.status(304).send(`Todo with id: ${id} not updated`);

    const collection = req.app.locals.collection;
    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { ...req.body } },
      { returnDocument: 'after' },
    );
    const user = result.value;
    res.send(user);
    res.status(201);
  } catch (err) {
    res.status(400).send(err.message);
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = req?.params?.id;

  try {
    // const query = { _id: ObjectId(id) };
    // const todo = (await collections.todos.findOne(query)) as Todo;

    // if (todo) {
    //   res.status(200).send(todo);
    // }

    const collection = req.app.locals.collection;
    collection.findOne({ _id: ObjectId(req.params.id) }, function (err, todo) {
      if (err) return console.log(err);
      res.status(201).json(todo);
    });
  } catch (err) {
    next(err);
    res.status(404).send(`Unable to find matching document with id: ${id}`);
  }
});

module.exports = router;
