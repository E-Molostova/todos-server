import express from 'express';
import { BadRequest, Conflict, Unauthorized } from 'http-errors';
import bcrypt from 'bcryptjs';

import { collections } from '../../service/database';
import { User } from '../../model/user';
import { joiRegisterSchema, joiLoginSchema } from '../../model/user';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { name, email, password } = req.body;
    const user = await collections.users.findOne({ email });
    if (user) {
      throw new Conflict('User is already exist');
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await collections.users.insertOne({
      name,
      email,
      password: hashPassword,
    });
    const result = await collections.users.findOne(newUser.insertedId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await collections.users.findOne({ email });
    if (!user) {
      throw new Unauthorized('Email or password is wrong!');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized('Email or password is wrong!');
    }
  } catch (error) {
    next(error);
  }
});
