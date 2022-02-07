import { ObjectId } from 'mongodb';

interface Todo {
  _id?: ObjectId;
  description: string;
  completed: boolean;
}

export default Todo;
