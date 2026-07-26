exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 180).notNullable().unique();
    table.string('password_hash', 200).notNullable();
    table.enu('role', ['student', 'admin']).notNullable().defaultTo('student');
    table.string('avatar_url', 500).nullable();
    table.string('course', 150).nullable();
    table.string('current_year', 50).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
