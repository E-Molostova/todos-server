import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../../service/database';
import Todo from '../../model/todo';

export const todosRouter = express.Router();
todosRouter.use(express.json());

todosRouter.get('/', async (_req: any, res: Response) => {
  try {
    const { _id } = _req.user;
    const todos = (await collections.todos
      .find({ owner: _id })
      .toArray()) as Todo[];
    res.status(200).send(todos);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

todosRouter.post('/', async (req: any, res: Response) => {
  try {
    const { _id } = req.user;

    const newTodo = { ...req.body, completed: false, owner: _id } as Todo;
    const result = await collections.todos.insertOne(newTodo);
    const todos = (await collections.todos
      .find({ owner: _id })
      .toArray()) as Todo[];
    result
      ? res.status(201).send(todos)
      : res.status(500).send('Failed to create a new todo.');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

todosRouter.delete(
  '/clear-completed',

  async (req: any, res: Response) => {
    try {
      const { _id } = req.user;
      await collections.todos.deleteMany({ completed: true });
      const todos = (await collections.todos
        .find({ owner: _id })
        .toArray()) as Todo[];
      res.status(200).send(todos);
    } catch (err) {
      res.status(401).send(err.message);
    }
  },
);

todosRouter.delete('/:id', async (req: any, res: Response) => {
  const id = req?.params?.id;
  try {
    const { _id } = req.user;
    const query = { _id: new ObjectId(id) };
    const result = await collections.todos.deleteOne(query);

    if (result && result.deletedCount) {
      const todos = (await collections.todos
        .find({ owner: _id })
        .toArray()) as Todo[];
      res.status(202).send(todos);
    } else if (!result) {
      res.status(400).send(`Failed to remove todo with id ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Todo with id ${id} does not exist`);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

todosRouter.put(
  '/toggle-completed',

  async (req: any, res: Response) => {
    try {
      const { _id } = req.user;
      const todos = (await collections.todos
        .find({ owner: _id })
        .toArray()) as Todo[];
      const isAnyActive = todos.some(todo => todo.completed === false);
      let newTodos;
      if (isAnyActive) {
        await collections.todos.updateMany(
          { completed: false },
          { $set: { completed: true } },
        );
        newTodos = (await collections.todos
          .find({ owner: _id })
          .toArray()) as Todo[];
      } else {
        await collections.todos.updateMany(
          { completed: true },
          { $set: { completed: false } },
        );
        newTodos = (await collections.todos
          .find({ owner: _id })
          .toArray()) as Todo[];
      }
      res.status(200).send(newTodos);
    } catch (err) {
      res.status(401).send(err.message);
    }
  },
);

todosRouter.put('/:id', async (req: any, res: Response) => {
  const id = req?.params?.id;
  try {
    const { _id } = req.user;
    const updatedTodo: Todo = req.body as Todo;
    const query = { _id: new ObjectId(id) };
    const result = await collections.todos.updateOne(query, {
      $set: updatedTodo,
    });
    const todos = (await collections.todos
      .find({ owner: _id })
      .toArray()) as Todo[];
    result
      ? res.status(200).send(todos)
      : res.status(304).send(`Todo with id: ${id} not updated`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
