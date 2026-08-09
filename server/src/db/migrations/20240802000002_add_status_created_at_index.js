exports.up = async function (knex) {
  // Composite index for the most common read path:
  // WHERE status = 'published' ORDER BY created_at DESC (recent, lists, search).
  await knex.schema.alterTable("notes", function (table) {
    table.index(["status", "created_at"], "idx_notes_status_created_at");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("notes", function (table) {
    table.dropIndex(["status", "created_at"], "idx_notes_status_created_at");
  });
};
