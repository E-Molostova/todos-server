import jwt from 'jsonwebtoken';
import { Unauthorized } from 'http-errors';
import { collections } from '../service/database';

require('dotenv').config();
const { SECRET_KEY } = process.env;

export const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new Unauthorized('You are not authorized');
    }
    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer') {
      throw new Unauthorized('You are not authorized');
    }

    jwt.verify(token, SECRET_KEY);
    const user = await collections.users.findOne({ token });
    if (!user) {
      throw new Unauthorized('You are not authorized');
    }
    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = 'Not authorized';
    }
    next(error);
  }
};
