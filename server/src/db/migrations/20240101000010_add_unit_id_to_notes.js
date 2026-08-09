exports.up = function (knex) {
  return knex.schema.table("notes", function (table) {
    table
      .integer("unit_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("units")
      .onDelete("SET NULL");
    table.index("unit_id");
  });
};

exports.down = function (knex) {
  return knex.schema.table("notes", function (table) {
    table.dropIndex("unit_id");
    table.dropColumn("unit_id");
  });
};
