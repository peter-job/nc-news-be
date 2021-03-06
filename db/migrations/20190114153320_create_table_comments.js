exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('comment_id').primary();
    table.string('username').notNullable();
    table.integer('article_id').notNullable();
    table.integer('votes').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now(6));
    table.text('body').notNullable();
    table.foreign('username').references('users.username');
    table.foreign('article_id').references('articles.article_id');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments');
};
