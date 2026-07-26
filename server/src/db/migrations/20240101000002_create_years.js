exports.up = function (knex) {
  return knex.schema.createTable('years', function (table) {
    table.increments('id').primary();
    table.string('label', 50).notNullable();
    table.integer('order_index').notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('years');
};
