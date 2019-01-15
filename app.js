const app = require('express')();
const topicsRouter = require('./routes/topicsRouter');

app.use('/api/topics', topicsRouter);

module.exports = app;
