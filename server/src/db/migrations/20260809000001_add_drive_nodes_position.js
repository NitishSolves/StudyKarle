/**
 * Extend the canonical Drive mirror with ordering and the root folder name.
 *
 * `drive_nodes.position` records the order each node was returned by Google
 * Drive among its siblings (Drive lists children sorted by name), so the
 * StudyKarle UI can reproduce the exact Drive ordering.
 *
 * `drive_sync_state.root_name` stores the display name of the linked root
 * folder (fetched from Drive during each sync) so the root listing can render
 * a breadcrumb / heading without an extra API call.
 *
 * NOTE: the legacy `units_subject_id_name_key` constraint is intentionally
 * left untouched. The sync no longer writes Drive folders into the `units`
 * table, so the constraint no longer blocks synchronization.
 */
exports.up = async function (knex) {
  const hasPosition = await knex.schema.hasColumn("drive_nodes", "position");
  if (!hasPosition) {
    await knex.schema.alterTable("drive_nodes", function (table) {
      table.integer("position").notNullable().defaultTo(0);
    });
  }
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS "drive_nodes_parent_kind_position" ON "drive_nodes" ("parent_drive_id", "kind", "position")'
  );

  const hasRootName = await knex.schema.hasColumn(
    "drive_sync_state",
    "root_name"
  );
  if (!hasRootName) {
    await knex.schema.alterTable("drive_sync_state", function (table) {
      table.string("root_name", 255).nullable();
    });
  }
};

exports.down = async function (knex) {
  await knex.raw('DROP INDEX IF EXISTS "drive_nodes_parent_kind_position"');

  const hasPosition = await knex.schema.hasColumn("drive_nodes", "position");
  if (hasPosition) {
    await knex.schema.alterTable("drive_nodes", function (table) {
      table.dropColumn("position");
    });
  }

  const hasRootName = await knex.schema.hasColumn(
    "drive_sync_state",
    "root_name"
  );
  if (hasRootName) {
    await knex.schema.alterTable("drive_sync_state", function (table) {
      table.dropColumn("root_name");
    });
  }
};
