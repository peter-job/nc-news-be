const router = require('express').Router();
const { getArticles, getArticleById, patchArticleById } = require('../controllers/articles');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getArticles)
  .all(handle405);

router
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById);
module.exports = router;
