const connection = require('../db/connection');

exports.getArticlesByTopic = (req, res, next) => {
  const {
    limit = 10,
    p = 1,
    sort_by = 'created_at',
    sort_ascending = 'true',
    ...remainingQueries
  } = req.query;

  const validSortCriteria = ['votes', 'created_at', 'topic', 'comment_count', 'username'];
  const sort_by_clean = validSortCriteria.includes(sort_by) ? sort_by : 'created_at';
  const order = sort_ascending === 'false' ? 'desc' : 'asc';

  connection('articles')
    .select(
      'articles.article_id',
      'articles.username as author',
      'title',
      'articles.votes as votes',
      'articles.created_at',
      'articles.topic',
    )
    .where(req.params)
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .count({ comment_count: 'comments.comment_id' })
    .limit(limit)
    .offset((p - 1) * limit)
    .orderBy(sort_by_clean, order)
    .then((articles) => {
      if (articles.length === 0) next({ status: 404 });
      else res.status(200).send({ articles });
    })
    .catch(next);
};

exports.postArticleByTopic = (req, res, next) => {
  const { body } = req;
  body.topic = req.params.topic;
  connection('articles')
    .insert(body)
    .returning('*')
    .then(([article]) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
