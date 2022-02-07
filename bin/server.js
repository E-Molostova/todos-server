const { MongoClient } = require('mongodb');
const app = require('../index.ts');

const PORT = process.env.PORT || 3000;

let dbClient;

const mongoClient = new MongoClient(process.env.DB_HOST);
mongoClient.connect(function (err, client) {
  if (err) return console.log(err);
  dbClient = client;
  app.locals.collection = client.db('todoDB').collection('todos');
  app.listen(PORT, () => {
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
});

process.on('SIGINT', () => {
  dbClient.close();
  process.exit();
});
