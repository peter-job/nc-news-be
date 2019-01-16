const router = require('express').Router();
const { getAllTopics, postTopic, getTopicArticles } = require('../controllers/topics');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getAllTopics)
  .post(postTopic)
  .all(handle405);
router.get('/:topic/articles', getTopicArticles);

module.exports = router;
