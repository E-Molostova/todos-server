import express from 'express';
import { BadRequest, Conflict, Unauthorized } from 'http-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
require('dotenv').config();

import { collections } from '../../service/database';
import { joiRegisterSchema, joiLoginSchema } from '../../model/user';

export const authRouter = express.Router();

const { SECRET_KEY, SECRET_KEY2 } = process.env;

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
    const { _id, name } = user;
    const payload = {
      id: _id,
    };

    const access_token = jwt.sign(payload, SECRET_KEY, { expiresIn: '30 min' });
    const refresh_token = jwt.sign(payload, SECRET_KEY2);
    await collections.users.findOneAndUpdate(
      { _id },
      { $set: { access_token, refresh_token } },
    );
    res.status(201).json({
      access_token,
      refresh_token,
      user: {
        email,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
});

