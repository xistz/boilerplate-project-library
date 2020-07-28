/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const expect = require('chai').expect;
const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const loadDb = async (connectionString) => {
  try {
    const client = await MongoClient.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return client;
  } catch (error) {
    console.error(error);
  }
};

const client = loadDb(MONGODB_CONNECTION_STRING);

module.exports = function (app) {
  app
    .route('/api/books')
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const db = (await client).db('library');

      const books = await db.collection('books').find({}).toArray();

      res.json(books);
    })

    .post(async (req, res) => {
      const { title } = req.body;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.status(400).json({ error: 'missing title' });
        return;
      }

      const db = (await client).db('library');

      const { insertedId } = await db
        .collection('books')
        .insertOne({ title, comments: [] });

      const book = await db
        .collection('books')
        .findOne({ _id: ObjectId(insertedId) });

      res.status(201).json(book);
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
    });

  app
    .route('/api/books/:id')
    .get(function (req, res) {
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      //json res format same as .get
    })

    .delete(function (req, res) {
      const bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
};
