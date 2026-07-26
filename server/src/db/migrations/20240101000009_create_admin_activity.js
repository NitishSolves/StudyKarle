exports.up = function (knex) {
  return knex.schema.createTable('admin_activity', function (table) {
    table.increments('id').primary();
    table
      .integer('admin_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('entity_type', 50).notNullable();
    table.integer('entity_id').nullable();
    table.jsonb('meta').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['created_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('admin_activity');
};
