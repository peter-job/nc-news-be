const app = require('express')();
const bodyparser = require('body-parser');
const topicsRouter = require('./routes/topicsRouter');
const { handle400 } = require('./error');

app.use(bodyparser.json());

app.use('/api/topics', topicsRouter);
app.use(handle400);

module.exports = app;
