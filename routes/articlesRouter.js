const router = require('express').Router();
const {
  getArticles,
  getArticleById,
  patchArticleVotes,
  deleteArticleById,
} = require('../controllers/articles');
const {
  getCommentsForArticle,
  postCommentForArticle,
  patchCommentVotes,
  deleteComment,
} = require('../controllers/comments');
const { handle405 } = require('../error');

router
  .route('/')
  .get(getArticles)
  .all(handle405);

router
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleVotes)
  .delete(deleteArticleById)
  .all(handle405);

router
  .route('/:article_id/comments')
  .get(getCommentsForArticle)
  .post(postCommentForArticle);

router
  .route('/:article_id/comments/:comment_id')
  .patch(patchCommentVotes)
  .delete(deleteComment);
module.exports = router;
