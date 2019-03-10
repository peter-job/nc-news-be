const connection = require('../db/connection');

exports.getCommentsForArticle = (req, res, next) => {
  const {
    limit = 10, p = 1, sort_by = 'created_at', order = 'desc',
  } = req.query;

  const validSortCriteria = ['votes', 'created_at', 'comments.username'];
  const sort_by_clean = validSortCriteria.includes(sort_by) ? sort_by : 'created_at';
  const order_clean = order === 'asc' ? 'asc' : 'desc';
  connection('comments')
    .select('comment_id', 'votes', 'created_at', 'username as author', 'body')
    .where(req.params)
    .limit(limit)
    .offset((p - 1) * limit)
    .orderBy(sort_by_clean, order_clean)
    .then(comments => res.status(200).send({ comments }))
    .catch(next);
};

exports.postCommentForArticle = (req, res, next) => {
  const comment = req.body;
  comment.article_id = req.params.article_id;
  connection('comments')
    .insert(req.body)
    .returning('*')
    .then(([comment_returned]) => {
      res.status(201).send({ comment: comment_returned });
    })
    .catch(next);
};

exports.patchCommentVotes = (req, res, next) => {
  const { inc_votes = 0 } = req.body;
  const params = { 'comments.comment_id': req.params.comment_id };
  connection('comments')
    .where(params)
    .increment('votes', inc_votes)
    .where(req.params)
    .returning('*')
    .then(([comment]) => {
      if (!comment) return Promise.reject({ status: 404 });
      const { username: author, ...restOfProperties } = comment;
      const formattedComment = { author, ...restOfProperties };
      return res.status(200).send({ comment: formattedComment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  connection('comments')
    .where(req.params)
    .delete()
    .then((deleted) => {
      if (!deleted) {
        next({ status: 404 });
      } else {
        res.status(204).send({});
      }
    })
    .catch(next);
};
