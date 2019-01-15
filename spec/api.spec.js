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
  });
  describe('/topics', () => {
    it('GET status:200 responds with an array of topics', () => request
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).to.be.an('array');
        expect(body.topics[0]).to.haveOwnProperty('slug');
        expect(body.topics[0]).to.haveOwnProperty('description');
      }));
    it('POST status:201 responds with object from body', () => request
      .post('/api/topics')
      .send({ slug: 'garbage', description: 'all things garbage' })
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).to.be.an('object');
        expect(body.topic).to.haveOwnProperty('slug');
        expect(body.topic).to.haveOwnProperty('description');
      }));
    // <----- describe 400 /api/topics*
    it('POST status:400 responds with error message', () => request
      .post('/api/topics')
      .send({ doesnt: 'made', exist: 'up' })
      .expect(400)
      .then(({ body }) => {
        expect(body).to.haveOwnProperty('message');
      }));
  });
});
