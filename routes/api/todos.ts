import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../../service/database';
import Todo from '../../model/todo';

export const todosRouter = express.Router();
todosRouter.use(express.json());

todosRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const todos = (await collections.todos.find({}).toArray()) as Todo[];
    res.status(200).send(todos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

todosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newTodo = { ...req.body, completed: false } as Todo;
    const result = await collections.todos.insertOne(newTodo);
    result
      ? res
          .status(201)
          .send(`Successfully created a new todo with id ${result.insertedId}`)
      : res.status(500).send('Failed to create a new todo.');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

todosRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.todos.deleteOne(query);
    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed todo with id ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove todo with id ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Todo with id ${id} does not exist`);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

todosRouter.put('/:id', async (req, res, next) => {
  const id = req?.params?.id;
  try {
    const updatedTodo: Todo = req.body as Todo;
    const query = { _id: new ObjectId(id) };
    const result = await collections.todos.updateOne(query, {
      $set: updatedTodo,
    });
    result
      ? res.status(200).send(`Successfully updated todo with id ${id}`)
      : res.status(304).send(`Todo with id: ${id} not updated`);
  } catch (err) {
    res.status(400).send(err.message);
    next(err);
  }
});

todosRouter.get('/:id', async (req, res, next) => {
  const id = req?.params?.id;
  try {
    const query = { _id: new ObjectId(id) };
    const todo = (await collections.todos.findOne(query)) as Todo;
    if (todo) {
      res.status(200).send(todo);
    }
  } catch (err) {
    next(err);
    res.status(404).send(`Unable to find matching document with id: ${id}`);
  }
});
