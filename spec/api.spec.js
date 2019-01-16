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
      it('POST status:201 responds with object from body', () => request
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
      // <---------- 405 test here
      it('PATCH, PUT, DELETE status:405 invalid request', () => {
        const invalidMethods = ['patch', 'put', 'delete'];
        const url = '/api/topics';
        const invalidRequests = invalidMethods.map(method => request[method](url).expect(405));
        return Promise.all(invalidRequests).then((requests) => {
          expect(requests[0].body).to.have.haveOwnProperty('message');
        });
      });
    });
    describe('/topics/:topic/articles', () => {
      it('GET status:200 responds with array of article objects for a given topic', () => request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an('array');
          expect(body.articles).to.have.length(11);
          expect(body.articles[0]).to.have.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic',
          );
          const [article1] = body.articles.filter(
            article => article.title === 'Living in the shadow of a great man',
          );
          expect(article1.comment_count).to.equal('13');
        }));
      it('GET status:404 responds with error message', () => request
        .get('/api/topics/faketopic/articles')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.haveOwnProperty('message');
        }));
      // <---------- 405 test here
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
