const router = require('express').Router();
const { getAllTopics, postTopic } = require('../controllers/topics');
const { getArticlesByTopic, postArticleByTopic } = require('../controllers/articles');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405);
router
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticleByTopic)
  .all(handle405);

module.exports = router;
