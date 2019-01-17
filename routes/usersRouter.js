const router = require('express').Router();
const { getAllUsers, getUserById } = require('../controllers/users');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getAllUsers)
  .all(handle405);
router
  .route('/:username')
  .get(getUserById)
  .all(handle405);

module.exports = router;
