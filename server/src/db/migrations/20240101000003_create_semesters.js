exports.up = function (knex) {
  return knex.schema.createTable('semesters', function (table) {
    table.increments('id').primary();
    table
      .integer('year_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('years')
      .onDelete('CASCADE');
    table.string('label', 50).notNullable();
    table.integer('order_index').notNullable();
    table.index(['year_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('semesters');
};
