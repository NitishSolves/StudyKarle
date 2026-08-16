exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("drive_shares");
  if (hasTable) return;

  await knex.schema.createTable("drive_shares", function (table) {
    table.increments("id").primary();
    // The shared file, keyed by the stable Google Drive id (the same
    // identifier used everywhere else in the drive tree).
    table
      .string("drive_id", 200)
      .notNullable()
      .references("drive_id")
      .inTable("drive_nodes")
      .onDelete("CASCADE");
    // Cryptographically random, unguessable token used in the public share
    // URL. Never derived from database ids, Drive ids, or timestamps.
    table.string("token", 128).notNullable().unique();
    table
      .enum("permission", ["preview", "download"], {
        useNative: true,
        enumName: "drive_share_permission",
      })
      .notNullable()
      .defaultTo("download");
    table
      .integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("expires_at").nullable();
    table.timestamp("revoked_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.index(["drive_id"]);
    table.index(["created_by"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("drive_shares");
};
