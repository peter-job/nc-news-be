const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select('*')
    .then(topics => res.status(200).send({ topics }))
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getTopicArticles = (req, res, next) => {
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
    .then(articles => res.status(200).send({ articles }))
    .catch(next);
};
