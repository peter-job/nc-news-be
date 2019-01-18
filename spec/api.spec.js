process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');
const { endpoints } = require('../controllers/api');

const request = supertest(app);

describe('/', () => {
  // hooks
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => {
    connection.destroy();
  });
  // tests
  it('GET status:404 responds with error message', () => request
    .get('/amadeupendpoint')
    .expect(404)
    .then(({ body }) => {
      expect(body).to.haveOwnProperty('message');
    }));

  describe('/api', () => {
    it('GET status 200 responds with json describing all endpoints in api', () => request
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body).to.eql(endpoints);
      }));
    it('POST, PATCH, PUT, DELETE status:405 invalid request', () => {
      const invalidMethods = ['post', 'patch', 'put', 'delete'];
      const url = '/api';
      const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
      return Promise.all(invalidRequests).then((requests) => {
        expect(requests[0].body).to.have.haveOwnProperty('message');
      });
    });

    describe('/topics', () => {
      it('GET status:200 responds with an array of topics', () => request
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics[0]).to.have.keys('slug', 'description');
        }));
      it('POST status:201 responds with posted topic', () => request
        .post('/api/topics')
        .send({ slug: 'garbage', description: 'all things garbage' })
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).to.eql({ slug: 'garbage', description: 'all things garbage' });
        }));
      it('POST status:400 responds with error message', () => request
        .post('/api/topics')
        .send({ doesnt: 'made', exist: 'up' })
        .expect(400)
        .then(({ body }) => {
          expect(body).to.haveOwnProperty('message');
        }));
      it('PATCH, PUT, DELETE status:405 invalid request', () => {
        const invalidMethods = ['patch', 'put', 'delete'];
        const url = '/api/topics';
        const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
        return Promise.all(invalidRequests).then((requests) => {
          expect(requests[0].body).to.have.haveOwnProperty('message');
        });
      });
      describe('/:topic/articles', () => {
        it('GET status:200 responds with array of article objects for topic', () => request
          .get('/api/topics/mitch/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.an('array');
            expect(body.articles).to.have.length(10);
            expect(body.articles[0]).to.have.keys(
              'author',
              'title',
              'article_id',
              'votes',
              'comment_count',
              'created_at',
              'topic',
            );
          }));
        it("GET status:200 accepts queries 'limit', 'p', 'sort_by' and 'order'", () => request
          .get('/api/topics/mitch/articles?sort_by=comment_count&limit=11')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.have.length('11');
            expect(+body.articles[0].comment_count).to.be.greaterThan(
              +body.articles[10].comment_count,
            );
          })
          .then(() => request.get('/api/topics/mitch/articles?&limit=10&p=2').expect(200))
          .then(({ body }) => {
            expect(body.articles).to.have.length('1');
          })
          .then(() => request.get('/api/topics/mitch/articles?&limit=10&p=2').expect(200))
          .then(({ body }) => {
            expect(body.articles).to.have.length('1');
          })
          .then(() => request
            .get('/api/topics/mitch/articles?&sort_by=comment_count&order=asc')
            .expect(200))
          .then(({ body }) => {
            expect(+body.articles[0].comment_count).to.be.at.most(
              +body.articles[9].comment_count,
            );
          }));
        it('GET status:404 responds with error message', () => request
          .get('/api/topics/faketopic/articles')
          .expect(404)
          .then(({ body }) => {
            expect(body).to.haveOwnProperty('message');
          }));
        it('POST status:201 responds posted article', () => request
          .post('/api/topics/mitch/articles')
          .send({
            username: 'butter_bridge',
            title: 'About Mitch.',
            body: 'This is definitely an article about .... Mitch. Now, lets begin',
          })
          .expect(201)
          .then(({ body }) => {
            expect(body.article).to.have.keys(
              'username',
              'title',
              'article_id',
              'created_at',
              'topic',
              'body',
              'votes',
            );
            expect(body.article.username).to.equal('butter_bridge');
            expect(body.article.title).to.equal('About Mitch.');
            expect(body.article.votes).to.equal(0);
            expect(body.article.topic).to.equal('mitch');
            expect(body.article.body).to.equal(
              'This is definitely an article about .... Mitch. Now, lets begin',
            );
          }));
        it('PATCH, PUT, DELETE status:405 invalid request', () => {
          const invalidMethods = ['patch', 'put', 'delete'];
          const url = '/api/topics/faketopic/articles';
          const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
          return Promise.all(invalidRequests).then((requests) => {
            expect(requests[0].body).to.have.haveOwnProperty('message');
          });
        });
      });
    });
    describe('/articles', () => {
      it('GET status:200 responds with an array of articles', () => request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an('array');
          expect(body.articles).to.have.length(10);
          expect(body.articles[0]).to.have.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic',
          );
        }));
      it("GET status:200 accepts queries 'sort_by', 'order', 'limit' and 'p'", () => request
        .get('/api/articles?sort_by=comment_count')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length('10');
          expect(+body.articles[0].comment_count).to.be.greaterThan(
            +body.articles[9].comment_count,
          );
        })
        .then(() => request.get('/api/articles?sort_by=comment_count&order=asc').expect(200))
        .then(({ body }) => {
          expect(body.articles).to.have.length('10');
          expect(+body.articles[0].comment_count).to.be.lessThan(+body.articles[9].comment_count);
        })
        .then(() => request.get('/api/articles?&limit=10&p=2').expect(200))
        .then(({ body }) => {
          expect(body.articles).to.have.length('2');
        }));
      it('PATCH, PUT, DELETE status:405 invalid request', () => {
        const invalidMethods = ['patch', 'put', 'delete'];
        const url = '/api/articles';
        const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
        return Promise.all(invalidRequests).then((requests) => {
          expect(requests[0].body).to.have.haveOwnProperty('message');
        });
      });
      describe('/:article_id', () => {
        it('GET status:200 responds with an article object', () => request
          .get('/api/articles/1')
          .expect(200)
          .then(({ body }) => {
            expect(body.article).to.have.keys(
              'author',
              'title',
              'article_id',
              'votes',
              'body',
              'comment_count',
              'created_at',
              'topic',
            );
            expect(body.article.article_id).to.equal(1);
            expect(body.article.title).to.equal('Living in the shadow of a great man');
            expect(body.article.body).to.equal('I find this existence challenging');
            expect(body.article.votes).to.equal(100);
            expect(body.article.topic).to.equal('mitch');
            expect(body.article.author).to.equal('butter_bridge');
          }));
        it('PATCH status:200 accepts an object with votes and returns the updated article', () => request
          .patch('/api/articles/1')
          .send({ inc_votes: 3 })
          .expect(200)
          .then(({ body }) => {
            expect(body.article.article_id).to.equal(1);
            expect(body.article.title).to.equal('Living in the shadow of a great man');
            expect(body.article.body).to.equal('I find this existence challenging');
            expect(body.article.votes).to.equal(103);
            expect(body.article.topic).to.equal('mitch');
            expect(body.article.author).to.equal('butter_bridge');
          }));
        it('DELETE status:204 accepts an object with votes and returns the updated article', () => request
          .delete('/api/articles/1')
          .expect(204)
          .then(({ body }) => {
            expect(body).to.eql({});
            return connection('articles')
              .where({ article_id: 1 })
              .then(([article]) => expect(article).to.equal(undefined));
          }));
        it('POST, PUT status:405 invalid request', () => {
          const invalidMethods = ['post', 'put'];
          const url = '/api/articles/1';
          const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
          return Promise.all(invalidRequests).then((requests) => {
            expect(requests[0].body).to.have.haveOwnProperty('message');
          });
        });
        describe('/comments', () => {
          it('GET status:200 responds with an array of comments for the given article_id', () => request
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.an('array');
              expect(body.comments[0]).to.have.keys(
                'comment_id',
                'votes',
                'created_at',
                'author',
                'body',
              );
            }));
          it("GET status:200 accepts queries 'sort_by', 'order', 'limit' and 'p'", () => request
            .get('/api/articles/1/comments?sort_by=votes')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.have.length('10');
              expect(body.comments[0].votes).to.be.greaterThan(body.comments[9].votes);
            })
            .then(() => request.get('/api/articles/1/comments?sort_by=votes&order=asc').expect(200))
            .then(({ body }) => {
              expect(body.comments).to.have.length('10');
              expect(body.comments[0].votes).to.be.lessThan(body.comments[9].votes);
            })
            .then(() => request.get('/api/articles/1/comments?&limit=3&p=2').expect(200))
            .then(({ body }) => {
              expect(body.comments).to.have.length('3');
              expect(body.comments[0].body).to.equal('I hate streaming noses');
            }));
          it('POST status:201 accepts an object with a username and body and responds with the posted comment', () => request
            .post('/api/articles/1/comments')
            .send({ username: 'butter_bridge', body: 'fantastic article btw' })
            .expect(201)
            .then(({ body }) => {
              expect(body.comment).to.have.keys(
                'article_id',
                'body',
                'comment_id',
                'created_at',
                'username',
                'votes',
              );
              expect(body.comment.article_id).to.equal(1);
              expect(body.comment.username).to.equal('butter_bridge');
              expect(body.comment.votes).to.equal(0);
            }));
          it('PATCH, PUT, DELETE status:405 invalid request', () => {
            const invalidMethods = ['patch', 'put', 'delete'];
            const url = '/api/articles/1/comments';
            const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
            return Promise.all(invalidRequests).then((requests) => {
              expect(requests[0].body).to.have.haveOwnProperty('message');
            });
          });
          describe('/:comment_id', () => {
            it('DELETE status:204 deletes the comment at given comment_id and and responds with no-content', () => {
              request
                .delete('/api/articles/1/comments/18')
                .expect(204)
                .then(({ body }) => {
                  expect(body).to.eql({});
                  return connection('comments')
                    .select('*')
                    .where({ comment_id: 18 })
                    .then(([article]) => expect(article).to.equal(undefined));
                });
            });
            it('PATCH status:200 accepts an object with votes and returns the updated comment', () => {
              request
                .patch('/api/articles/1/comments/18')
                .send({ inc_votes: 2 })
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment).to.eql({
                    comment_id: 18,
                    author: 'butter_bridge',
                    article_id: 1,
                    votes: 18,
                    created_at: '2000-11-26T12:36:03.389Z',
                    body: 'This morning, I showered for nine minutes.',
                  });
                });
            });
            it('GET, PUT, POST status:405 invalid request', () => {
              const invalidMethods = ['get', 'put', 'post'];
              const url = '/api/articles/1/comments/18';
              const invalidReqs = invalidMethods.map(method => request[method](url).expect(405));
              return Promise.all(invalidReqs).then((requests) => {
                expect(requests[0].body).to.have.haveOwnProperty('message');
              });
            });
          });
        });
      });
    });
    describe('/users', () => {
      it('GET status:200 responds with an array of user objects', () => request
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          expect(body.users).to.be.an('array');
          expect(body.users[0]).to.eql({
            username: 'butter_bridge',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'jonny',
          });
        }));
      it('POST, PATCH, PUT, DELETE status:405 invalid request', () => {
        const invalidMethods = ['post', 'patch', 'put', 'delete'];
        const url = '/api/users';
        const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
        return Promise.all(invalidRequests).then((requests) => {
          expect(requests[0].body).to.have.haveOwnProperty('message');
        });
      });

      describe('/:username', () => {
        it('GET status:200 responds with a user object', () => request
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => expect(body.user).to.eql({
            username: 'butter_bridge',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'jonny',
          })));
        it('POST, PATCH, PUT, DELETE status:405 invalid request', () => {
          const invalidMethods = ['post', 'patch', 'put', 'delete'];
          const url = '/api/users/butter_bridge';
          const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
          return Promise.all(invalidRequests).then((requests) => {
            expect(requests[0].body).to.have.haveOwnProperty('message');
          });
        });
      });
    });
  });
});
