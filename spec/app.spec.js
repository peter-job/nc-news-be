process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const connection = require('../connection');
const app = require('../app');
const request = require('supertest')(app);

describe('/api', () => {
  // hooks
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => {
    connection.destroy();
  });
  // test
  describe('/parties', () => {
    it('GET status:200 should respond with an array of mp objects', () => request
      .get('api/parties')
      .expect(200)
      .then(({ body }) => {
        expect(body.parties).to.be.an('array');
        expect(body.parties[0]).to.haveOwnProperty('party');
        expect(body.parties[0]).to.haveOwnProperty('something');
      }));
  });
});
