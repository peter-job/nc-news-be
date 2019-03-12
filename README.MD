# NC News API

NC News API is a back-end API built to serve the front-end for the Northcoders News Sprint.

## About the API

The API serves JSON at the following [endpoints](https://be2-nc-news.herokuapp.com/api)

### Prerequisites

To run this project locally, Node.js, npm, PostgreSQL and a terminal are required.

- Download and install [node](https://nodejs.org/) (this installation will include npm)
- Download and install [postgresql](https://www.postgresql.org/)

[Postman](https://www.getpostman.com/) is a useful application for sending HTTP requests and can be used to interact with this API

### Installing

1. Fork this repo
2. Clone your forked repo to your local machine
3. Open your terminal in the project directory and run `npm install` to install the project's dependencies
4. Create a file named 'knexfile.js' in the root directory of the project, which configures knex to access your database. The file should be as follows:

```javascript
const { DB_URL } = process.env;

module.exports = {
  development: {
    client: "pg",
    connection: {
      database: "nc_knews_dev"
      // password: 'your postgres password (linux only)',
      // username: 'your postgres username (linux only)'
    },
    migrations: {
      directory: "./migrations"
    },
    seeds: {
      directory: "./seeds"
    }
  },

  test: {
    client: "pg",
    connection: {
      database: "nc_knews_test"
      // username: 'your postgres username (linux only)',
      // password: 'your postgres password (linux only)'
    },
    migrations: {
      directory: "./migrations"
    },
    seeds: {
      directory: "./seeds"
    }
  },
  production: {
    client: "pg",
    connection: `${DB_URL}?ssl=true`,
    migrations: {
      directory: "./migrations",

      seeds: {
        directory: "./seeds"
      }
    }
  }
};
```

5. Run the terminal command `npm run seed:run` to create an empty database, run migrations files that will create a schema for the database, and seed the database with data from 'db/data/development-data'

6. Run the terminal command `npm run dev` to start the server using Nodemon

7. The server can now be accessed via http requests;
   e.g. open [this link](http://localhost:9090/api/articles) in your web browser to view a list of articles

## Running the tests

To run the tests, run the command `npm test` in your terminal. This will drop any prior test database, create a new one with the latest db schema, and re-seed the test data from 'db/data/test-data' before running tests found in the file 'spec/api.spec.js'.

### A test explained

```javascript
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
```

Each `describe` block represents an endpoint on the api, and each `it` block creates a new valid or invalid http request to that endpoint. The API must responds must match the assertions written in `expect` statements for the particular test to pass.

All endpoints on the API are tested for possible http requests.

## Deployment

This API is hosted on [Heroku](https://be2-nc-news.herokuapp.com/api). To host your own version, follow these steps:

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Run the command `heroku login` in your terminal, which will open a window in your web browser where you can login to your heroku account
3. Now you're logged in, you can run `Heroku create <project name here>` to create a new project
4. Run the command `heroku addons:create heroku-postgresql:hobby-dev` to attach a PostgreSQL database to your project on heroku
5. Test that the database is created by running `heroku config:get: DATABASE_URL`. This should return a long URL beginning with 'postgres://'
6. To deploy to heroku, `git commit` any file changes made. Then run `git push heroku master` to upload your project. Once finished, you can view the project by running `heroku open`
7. To seed your database, run the script `npm run seed:prod` to run migrations and seed with development-data, or you can run `npm run migrate:latest:prod` for an empty database ready for your own data.
8. Your API is ready to go!

## Built With

- [Knex](https://knexjs.org/) - SQL query builder used for database migrations, seeding and querying
- [Supertest](https://github.com/visionmedia/supertest) - Test library used for http assertions
- [Mocha](https://mochajs.org/) - Test framework
- [Postman](https://www.getpostman.com/) - App used to make http requests for testing endpoints

## Authors

- **Peter Job** - [peter-job](https://github.com/peter-job)

## Acknowledgments

- Northcoders
