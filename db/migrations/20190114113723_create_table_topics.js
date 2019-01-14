exports.up = function (knex, Promise) {
  return knex.schema.createTable('topics', (table) => {
    table
      .string('slug')
      .primary()
      .unique();
    table.string('description');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('topics');
};
