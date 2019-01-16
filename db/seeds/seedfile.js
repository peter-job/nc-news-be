const {
  articleData, commentData, userData, topicData,
} = require('../data');
const { createRef, formateDate } = require('../utils');

exports.seed = function (knex, Promise) {
  return knex('topics')
    .insert(topicData)
    .returning('*')
    .then(() => knex('users')
      .insert(userData)
      .returning('*'))
    .then(() => {
      const formattedArticles = articleData.map(({ created_by, created_at, ...restOfArticle }) => ({
        created_at: formateDate(created_at),
        username: created_by,
        ...restOfArticle,
      }));
      return knex('articles')
        .insert(formattedArticles)
        .returning('*');
    })
    .then((articlesTable) => {
      const articlesRef = createRef(articlesTable, 'title', 'article_id');
      const formattedComments = commentData.map(
        ({
          created_by, belongs_to, created_at, ...restOfArticle
        }) => ({
          created_at: formateDate(created_at),
          username: created_by,
          article_id: articlesRef[belongs_to],
          ...restOfArticle,
        }),
      );
      return knex('comments')
        .insert(formattedComments)
        .returning('*');
    });
};
