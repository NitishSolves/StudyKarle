exports.up = function (knex) {
  return knex.schema
    .createTable('tags', function (table) {
      table.increments('id').primary();
      table.string('name', 80).notNullable().unique();
    })
    .createTable('note_tags', function (table) {
      table
        .integer('note_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('notes')
        .onDelete('CASCADE');
      table
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE');
      table.primary(['note_id', 'tag_id']);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('note_tags').dropTableIfExists('tags');
};
