process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

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
    it('GET status 404 responds with error message', () => request
      .get('/api')
      .expect(404)
      .then(({ body }) => {
        expect(body).to.haveOwnProperty('message');
      }));

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
          })
          .then(() => request.get('/api/topics/mitch/articles?sort_by=comment_count&limit=11').expect(200))
          .then(({ body }) => {
            expect(body.articles).to.have.length('11');
            expect(+body.articles[0].comment_count).to.be.lessThan(
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
            .get('/api/topics/mitch/articles?&sort_by=comment_count&sort_ascending=false')
            .expect(200))
          .then(({ body }) => {
            expect(body.articles[0].comment_count).to.be.moreThan(body.articles[9].comment_count);
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
  });
});
