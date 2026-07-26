exports.up = function (knex) {
  return knex.schema.createTable('notes', function (table) {
    table.increments('id').primary();
    table
      .integer('subject_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('description').nullable();
    table.string('drive_file_id', 200).notNullable();
    table.string('file_type', 20).notNullable().defaultTo('pdf');
    table.integer('page_count').nullable();
    table.bigInteger('size_bytes').nullable();
    table.enu('status', ['draft', 'published']).notNullable().defaultTo('published');
    table
      .integer('uploaded_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.index(['subject_id']);
    table.index(['status']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notes');
};
