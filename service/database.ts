import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';

export const collections: {
  todos?: mongoDB.Collection;
  users?: mongoDB.Collection;
} = {};

export async function connectToDatabase() {
  dotenv.config();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONN_STRING,
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  await db.command({
    collMod: process.env.TODOS_COLLECTION_NAME,
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['description', 'completed', 'owner'],
        additionalProperties: false,
        properties: {
          _id: {},
          description: {
            bsonType: 'string',
            description: "'description' is required and is a string",
          },
          completed: {
            bsonType: 'bool',
            description: "'completed' is required and is a bool",
          },
          owner: {
            bsonType: mongoDB.ObjectId,
            description: "'owner' describes to whom belong todo-item",
          },
        },
      },
    },
  });

  const todosCollection: mongoDB.Collection = db.collection(
    process.env.TODOS_COLLECTION_NAME,
  );
  const usersCollection: mongoDB.Collection = db.collection(
    process.env.USERS_COLLECTION_NAME,
  );

  collections.todos = todosCollection;
  collections.users = usersCollection;

  console.log(`Successfully connected to database: ${db.databaseName}`);
}
