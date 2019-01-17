const app = require('express')();
const bodyparser = require('body-parser');
const articlesRouter = require('./routes/articlesRouter');
const topicsRouter = require('./routes/topicsRouter');
const { handle400, handle404, handle500 } = require('./error');

app.use(bodyparser.json());
app.use('/api/articles', articlesRouter);
app.use('/api/topics', topicsRouter);
app.use('/*', (req, res, next) => next({ status: 404, message: 'No endpoint found' }));
app.use(handle400);
app.use(handle404);
app.use(handle500);

module.exports = app;
