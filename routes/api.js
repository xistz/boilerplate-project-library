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

const getBookWithComments = async (id) => {
  const db = (await client).db('library');

  return await db
    .collection('books')
    .aggregate([
      { $match: { _id: ObjectId(id) } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'bookId',
          as: 'comments',
        },
      },
      {
        $project: {
          title: 1,
          comments: {
            $map: {
              input: '$comments',
              as: 'comment',
              in: '$$comment.comment',
            },
          },
        },
      },
    ])
    .next();
};

module.exports = function (app) {
  app
    .route('/api/books')
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const db = (await client).db('library');

      const books = await db
        .collection('books')
        .aggregate([
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'bookId',
              as: 'comments',
            },
          },
          {
            $project: {
              commentcount: {
                $size: '$comments',
              },
              title: 1,
            },
          },
        ])
        .toArray();

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

      const { insertedId } = await db.collection('books').insertOne({ title });

      const book = await getBookWithComments(insertedId);

      res.status(201).json(book);
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      const db = (await client).db('library');

      await Promise.all([
        db.collection('books').deleteMany({}),
        db.collection('comments').deleteMany({}),
      ]);

      res.status(204).end();
    });

  app
    .route('/api/books/:id')
    .get(async (req, res) => {
      const { id } = req.params;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const db = (await client).db('library');

      const book = await getBookWithComments(id);

      if (!book) {
        res.status(404).json({ error: 'book not found' });
        return;
      }

      res.json(book);
    })

    .post(async (req, res) => {
      const { id } = req.params;
      const { comment } = req.body;
      //json res format same as .get

      const db = (await client).db('library');

      if (!(await db.collection('books').findOne({ _id: ObjectId(id) }))) {
        res.status(404).json({ error: 'book not found' });
        return;
      }

      if (!comment) {
        res.status(400).json({ error: 'missing comment' });
        return;
      }

      await db
        .collection('comments')
        .insertOne({ comment, bookId: ObjectId(id) });

      const book = await getBookWithComments(id);

      res.status(201).json(book);
    })

    .delete(async (req, res) => {
      const { id } = req.params;
      //if successful response will be 'delete successful'

      const db = (await client).db('library');

      await Promise.all([
        db.collection('books').deleteOne({ _id: ObjectId(id) }),
        db.collection('comments').deleteMany({ bookId: ObjectId(id) }),
      ]);

      res.status(204).end();
    });
};
