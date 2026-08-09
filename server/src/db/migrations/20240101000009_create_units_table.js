exports.up = function (knex) {
  return knex.schema.createTable("units", function (table) {
    table.increments("id").primary();
    table
      .integer("subject_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("subjects")
      .onDelete("CASCADE");
    table.string("name", 100).notNullable();
    table.integer("order_index").notNullable().defaultTo(0);
    table.string("drive_folder_id", 255).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.unique(["subject_id", "name"]);
    table.index("subject_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("units");
};
