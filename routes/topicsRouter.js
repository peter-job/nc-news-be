const router = require('express').Router();
const { getAllTopics, postTopic, getTopicArticles } = require('../controllers/topics');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405);
router
  .route('/:topic/articles')
  .get(getTopicArticles)
  .all(handle405);

module.exports = router;
