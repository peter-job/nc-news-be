const app = require('express')();

app.get('/api', (req, res) => res.send('yes?'));

module.exports = app;
