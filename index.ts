import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectToDatabase } from './service/database';
import { todosRouter } from './routes/api/todos';
require('dotenv').config();

const app = express();

const port = process.env.port || 8080;

connectToDatabase()
  .then(() => {
    app.use(cors());
    // app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use('/todos', todosRouter);

    app.use((req, res) => {
      res.status(404).json({ message: 'Not found' });
    });
    app.use((err, req, res, next) => {
      res.status(500).json({ message: err });
    });

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error);
    process.exit();
  });
