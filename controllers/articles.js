const connection = require('../db/connection');

exports.getArticles = (req, res, next) => {
  const {
    limit = 10, p = 1, sort_by = 'created_at', order = 'desc',
  } = req.query;

  const validSortCriteria = ['votes', 'created_at', 'topic', 'title', 'comment_count', 'username'];
  const sort_by_clean = validSortCriteria.includes(sort_by) ? sort_by : 'created_at';
  const order_clean = order === 'asc' ? 'asc' : 'desc';

  connection('articles')
    .select(
      'articles.article_id',
      'articles.username as author',
      'title',
      'articles.votes as votes',
      'articles.created_at',
      'articles.topic',
    )
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .count({ comment_count: 'comments.comment_id' })
    .limit(limit)
    .offset((p - 1) * limit)
    .orderBy(sort_by_clean, order_clean)
    .then((articles) => {
      if (articles.length === 0) next({ status: 404 });
      else res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const {
    limit = 10, p = 1, sort_by = 'created_at', order = 'desc',
  } = req.query;

  const validSortCriteria = ['votes', 'title', 'created_at', 'topic', 'comment_count', 'username'];
  const sort_by_clean = validSortCriteria.includes(sort_by) ? sort_by : 'created_at';
  const order_clean = order === 'asc' ? 'asc' : 'desc';

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
    .orderBy(sort_by_clean, order_clean)
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

exports.getArticleById = (req, res, next) => {
  const params = { 'articles.article_id': req.params.article_id };
  connection('articles')
    .select(
      'articles.article_id',
      'articles.username as author',
      'title',
      'articles.body',
      'articles.votes as votes',
      'articles.created_at',
      'articles.topic',
    )
    .where(params)
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .count({ comment_count: 'comments.comment_id' })
    .then(([article]) => {
      if (!article) next({ status: 404 });
      else res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const params = { 'articles.article_id': req.params.article_id };
  const { inc_votes = 0 } = req.body;
  connection('articles')
    .where(params)
    .increment('votes', inc_votes)
    .returning('*')
    .then(([article]) => {
      if (!article) return Promise.reject({ status: 404 });
      const { username: author, ...restOfProperties } = article;
      const formattedArticle = { author, ...restOfProperties };
      return res.status(200).send({ article: formattedArticle });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  connection('comments')
    .where(req.params)
    .del()
    .then(() => connection('articles')
      .where(req.params)
      .del())
    .then((deleteCount) => {
      if (!deleteCount) return Promise.reject({ status: 404 });
      return res.status(204).send({});
    })
    .catch(next);
};
