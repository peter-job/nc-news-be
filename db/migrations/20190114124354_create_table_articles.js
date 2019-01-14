exports.up = function (knex, Promise) {
  return knex.schema.createTable('articles', (table) => {
    table.increments('article_id').primary();
    table.string('title');
    table.text('body');
    table.integer('votes').defaultTo(0);
    table.string('topic');
    table.string('username');
    table.timestamp('created_at').defaultTo(knex.fn.now(6));
    table.foreign('topic').references('topics.slug');
    table.foreign('username').references('users.username');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('articles');
};
