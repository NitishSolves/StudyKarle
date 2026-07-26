exports.up = function (knex) {
  return knex.schema.createTable('view_history', function (table) {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('note_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('notes')
      .onDelete('CASCADE');
    table.timestamp('viewed_at').notNullable().defaultTo(knex.fn.now());
    table.index(['user_id', 'viewed_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('view_history');
};
