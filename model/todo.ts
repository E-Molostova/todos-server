// const { ObjectId } = require('mongodb');

// class TodoSchema {
//     constructor(
//     public description: string,
//     public completed: boolean,
//     // public id?: ObjectId,
//   ) {}
// }

interface Todo {
  _id?: string;
  description: string;
  completed: boolean;
}

// module.exports = Todo;
