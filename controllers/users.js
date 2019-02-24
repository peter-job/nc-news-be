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
    .then(([user]) => {
      if (!user) next({ status: 404 });
      else res.status(200).send({ user });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  const { body } = req;
  connection('users')
    .insert(body)
    .returning('*')
    .then(([user]) => {
      res.status(201).send({ user });
    })
    .catch(next);
};
