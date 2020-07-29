/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test('#example Test GET /api/books', function (done) {
    chai
      .request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        res.body.forEach((book) => {
          assert.property(
            book,
            'commentcount',
            'Books in array should contain commentcount'
          );
          assert.property(book, 'title', 'Books in array should contain title');
          assert.property(book, '_id', 'Books in array should contain _id');
        });

        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite('Routing tests', function () {
    suite(
      'POST /api/books with title => create book object/expect book object',
      function () {
        test('Test POST /api/books with title', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({ title: 'book title' })
            .end(function (err, res) {
              assert.equal(res.status, 201);
              assert.isDefined(res.body._id);
              assert.equal(res.body.title, 'book title');
              assert.equal(res.body.comments.length, 0);

              done();
            });
        });

        test('Test POST /api/books with no title given', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 400);
              assert.equal(res.body.error, 'missing title');

              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            res.body.forEach((book) => {
              assert.property(
                book,
                'commentcount',
                'Books in array should contain commentcount'
              );
              assert.property(
                book,
                'title',
                'Books in array should contain title'
              );
              assert.property(book, '_id', 'Books in array should contain _id');
            });

            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .get('/api/books/5f20dece8df570006c6739ee')
          .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.body.error, 'book not found');

            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .send({ title: 'valid id' })
          .end(function (err, res) {
            const { _id } = res.body;

            chai
              .request(server)
              .get(`/api/books/${_id}`)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body._id, _id);
                assert.equal(res.body.title, 'valid id');
                assert.property(res.body, 'comments');

                done();
              });
          });
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          //done();
        });
      }
    );

    suite('DELETE /api/books => no content', function () {
      test('Test DELETE /api/book', function (done) {
        chai
          .request(server)
          .delete('/api/books')
          .end(function (err, res) {
            assert.equal(res.status, 204);

            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => no content', function () {
      test('Test DELETE /api/books/[id]', function (done) {
        chai
          .request(server)
          .post('/api/books')
          .send({ title: 'delete book' })
          .end(function (err, res) {
            const { _id } = res.body;

            chai
              .request(server)
              .delete(`/api/books/${_id}`)
              .end(function (err, res) {
                assert.equal(res.status, 204);

                // TODO GET
                done();
              });
          });
      });
    });
  });
});
