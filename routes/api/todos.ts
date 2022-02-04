const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config;
// HJPM9rG2CVx2NuE
// const { Contact } = require("../../model");  переделать на туду
// const joiSchema = require("../../model")

const { DB_HOST } = process.env;

const mongoClient = new MongoClient(DB_HOST);

router.get('/', async (req, res, next) => {
  try {
    const client = await mongoClient.connect();
    const db = client.db('todoDB');
    const collection = db.collection('todos');
    const results = await collection.find().toArray();
    return res.status(200).json(results);
  } catch (err) {
    next(err);
  } finally {
    await mongoClient.close();
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const client = await mongoClient.connect();
    const db = client.db('todoDB');
    const collection = db.collection('todos');
    const results = await collection.findOne({ _id: ObjectId(req.params.id) });
    return res.status(200).json(results);
  } catch (err) {
    next(err);
  } finally {
    await mongoClient.close();
  }
});

router.post('/', async (req, res, next) => {
  try {
    const client = await mongoClient.connect();
    const db = client.db('todoDB');
    const collection = db.collection('todos');
    const newTodo = { ...req.body, completed: false };
    const results = await collection.insertOne(newTodo);
    // const results = await collection.insertOne(req.body);
    const data = collection.findOne({ _id: results.insertedId });
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  } finally {
    await mongoClient.close();
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await mongoClient.connect();
    const db = client.db('todoDB');
    const collection = db.collection('todos');
    const result = await collection.findOneAndDelete({
      _id: ObjectId(id),
    });
    // if (!result) {
    //   const error = new Error('Not found');
    //   error.status = 404;
    //   throw error;
    // }
    res.json({ message: 'contact deleted' });
  } catch (err) {
    next(err);
  } finally {
    await mongoClient.close();
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const client = await mongoClient.connect();
    const db = client.db('todoDB');
    const collection = db.collection('todos');
    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: { ...req.body } },
    );
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  } finally {
    await mongoClient.close();
  }
});

module.exports = router;
