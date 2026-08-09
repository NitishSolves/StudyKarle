exports.up = async function (knex) {
  // 1. Ensure unit_id column exists (idempotent)
  const hasColumn = await knex.schema.hasColumn("notes", "unit_id");
  if (!hasColumn) {
    await knex.schema.alterTable("notes", function (table) {
      table.integer("unit_id").unsigned().nullable();
    });
  }

  // 2. Enforce notes.unit_id -> units.id with RESTRICT on delete.
  // An earlier migration may already have added this FK (with SET NULL), so
  // drop any existing constraint with the same name first to stay idempotent
  // on fresh databases.
  await knex.raw('ALTER TABLE "notes" DROP CONSTRAINT IF EXISTS "notes_unit_id_foreign"');
  await knex.schema.alterTable("notes", function (table) {
    table
      .foreign("unit_id")
      .references("id")
      .inTable("units")
      .onDelete("RESTRICT");
  });

  // 3. Add performance indexes (only if they don't already exist)
  const idxUnit = await knex.raw(
    "SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_unit_id' LIMIT 1"
  );
  if (idxUnit.rows.length === 0) {
    await knex.schema.alterTable("notes", function (table) {
      table.index("unit_id", "idx_notes_unit_id");
    });
  }

  const idxSubjUnit = await knex.raw(
    "SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_subject_unit' LIMIT 1"
  );
  if (idxSubjUnit.rows.length === 0) {
    await knex.schema.alterTable("notes", function (table) {
      table.index(["subject_id", "unit_id"], "idx_notes_subject_unit");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable("notes", function (table) {
    table.dropForeign("unit_id");
    table.dropIndex("unit_id", "idx_notes_unit_id");
    table.dropIndex(["subject_id", "unit_id"], "idx_notes_subject_unit");
  });
};
