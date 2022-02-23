import express from 'express';
require('dotenv').config();
import { collections } from '../../service/database';

export const usersRouter = express.Router();

usersRouter.get('/logout', async (req: any, res) => {
  const { _id } = req.user;
  await collections.users.findOneAndUpdate({ _id }, { $set: { token: null } });
  res.status(204).send();
});

usersRouter.get('/current', async (req: any, res, next) => {
  const { name, email } = req.user;
  res.json({
    user: {
      name,
      email,
    },
  });
});
