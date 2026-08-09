exports.up = function (knex) {
  return knex.schema.createTable('saved_notes', function (table) {
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
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'note_id']);
    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('saved_notes');
};
