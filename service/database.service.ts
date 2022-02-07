// const mongoDB = require('mongodb');
// require('dotenv').config();

// // export const collections: { todos?: mongoDB.Collection } = {};

// async function connectToDatabase() {
//   const client = new mongoDB.MongoClient(process.env.DB_HOST);

//   await client.connect();

//   const db = client.db(process.env.DB_NAME);
//   await db.command({
//     collMod: process.env.GAMES_COLLECTION_NAME,
//     validator: {
//       $jsonSchema: {
//         bsonType: 'object',
//         required: ['description', 'completed'],
//         additionalProperties: false,
//         properties: {
//           _id: {},
//           description: {
//             bsonType: 'string',
//             description: "'description' is required and is a string",
//           },
//           completed: {
//             bsonType: 'boolean',
//             description: "'completed' is required and is a boolean",
//             default: false,
//           },
//         },
//       },
//     },
//   });

//   const todosCollection = db.collection(process.env.TODOS_COLLECTION_NAME);

//   collections.todos = todosCollection;

//   console.log(
//     `Successfully connected to database: ${db.databaseName} and collection: ${todosCollection.collectionName}`,
//   );
// }

// module.exports = connectToDatabase;
