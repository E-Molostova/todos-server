import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { collections } from '../service/database';

const { TokenExpiredError } = jwt;
const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: 'Unauthorized! Access Token was expired!' });
  }
  return res.sendStatus(401).send({ message: 'Unauthorized!' });
};

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  const [bearer, token] = authorization.split(' ');
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};
