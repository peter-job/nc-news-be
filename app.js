const app = require('express')();
const bodyparser = require('body-parser');
const usersRouter = require('./routes/usersRouter');
const articlesRouter = require('./routes/articlesRouter');
const topicsRouter = require('./routes/topicsRouter');
const { sendEndpoints } = require('./controllers/api.js');
const {
  handle400, handle404, handle500, handle405,
} = require('./error');

app.use(bodyparser.json());

app
  .route('/api')
  .get(sendEndpoints)
  .all(handle405);

app.use('/api/articles', articlesRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/users', usersRouter);
app.use('/*', (req, res, next) => next({ status: 404, message: 'No endpoint found' }));
app.use(handle400);
app.use(handle404);
app.use(handle500);

module.exports = app;
