const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users')
    .select('*')
    .then(users => res.status(200).send({ users }))
    .catch(next);
};

exports.getUserById = (req, res, next) => {
  connection('users')
    .select('*')
    .where(req.params)
    .then(([user]) => res.status(200).send({ user }))
    .catch(next);
};
