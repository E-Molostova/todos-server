import express from 'express';
import { BadRequest, Conflict, Unauthorized } from 'http-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
require('dotenv').config();
const { SECRET_KEY, SECRET_KEY2 } = process.env;

import { collections } from '../../service/database';
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

authRouter.post('/refreshtoken', async (req: any, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new Unauthorized('You are not authorized');
    }
    const [bearer, refreshToken] = authorization.split(' ');
    if (bearer !== 'Bearer') {
      throw new Unauthorized('You are not authorized');
    }

    jwt.verify(refreshToken, SECRET_KEY2);
    const user = await collections.users.findOne({
      refresh_token: refreshToken,
    });

    if (!user) {
      throw new Unauthorized('You are not authorized');
    }
    const payload = { id: user._id };
    const newAccessToken = jwt.sign(payload, SECRET_KEY);
    const newRefreshToken = jwt.sign(payload, SECRET_KEY2);
    collections.users.findOneAndUpdate(
      { refresh_token: refreshToken },
      {
        $set: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      },
    );
    res.status(201).json({
      refreshToken: newRefreshToken,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = 'Not authorized';
    }
  }
});
