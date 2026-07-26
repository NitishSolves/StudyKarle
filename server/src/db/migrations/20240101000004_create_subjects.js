exports.up = function (knex) {
  return knex.schema.createTable('subjects', function (table) {
    table.increments('id').primary();
    table
      .integer('semester_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('semesters')
      .onDelete('CASCADE');
    table.string('name', 150).notNullable();
    table.string('icon', 60).notNullable().defaultTo('menu_book');
    table.string('color', 30).notNullable().defaultTo('primary');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['semester_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('subjects');
};
