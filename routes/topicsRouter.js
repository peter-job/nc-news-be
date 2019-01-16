const router = require('express').Router();
const { getAllTopics, postTopic, getTopicArticles } = require('../controllers/topics');

router.get('/', getAllTopics);
router.post('/', postTopic);
router.get('/:topic/articles', getTopicArticles);

module.exports = router;
