exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("saved_files");
  if (!hasTable) {
    await knex.schema.createTable("saved_files", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .string("drive_id", 200)
        .notNullable()
        .references("drive_id")
        .inTable("drive_nodes")
        .onDelete("CASCADE");
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.unique(["user_id", "drive_id"]);
      table.index(["user_id"]);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("saved_files");
};
