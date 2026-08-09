exports.up = async function (knex) {
  // 1. drive_nodes — authoritative mirror of the linked Google Drive folder
  // tree. Drive ids are unique, which prevents duplicate imports.
  const hasDriveNodes = await knex.schema.hasTable("drive_nodes");
  if (!hasDriveNodes) {
    await knex.schema.createTable("drive_nodes", function (table) {
      table.increments("id").primary();
      table.string("drive_id", 200).notNullable().unique();
      table.string("parent_drive_id", 200).nullable().index();
      table.string("name", 255).notNullable();
      table.string("mime_type", 200).notNullable();
      table
        .enum("kind", ["folder", "file"], {
          useNative: true,
          enumName: "drive_node_kind",
        })
        .notNullable()
        .index();
      table.integer("depth").notNullable().defaultTo(0);
      table.text("path").notNullable().defaultTo("");
      table.bigInteger("size_bytes").nullable();
      table.timestamp("created_time").nullable();
      table.timestamp("modified_time").nullable();
      table.timestamp("last_synced_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.index(["parent_drive_id", "kind"]);
    });
  }

  // 2. Track the Drive folder id on the existing hierarchy tables so the sync
  // can reconcile (and detect rename/move/delete) using stable Drive ids.
  await addNullableDriveColumn(knex, "years");
  await addNullableDriveColumn(knex, "semesters");
  await addNullableDriveColumn(knex, "subjects");

  // 3. units — support nested subfolders (a subfolder becomes a child unit)
  // and enforce uniqueness by Drive id instead of (subject_id, name).
  const hasParentUnit = await knex.schema.hasColumn("units", "parent_unit_id");
  if (!hasParentUnit) {
    await knex.schema.alterTable("units", function (table) {
      table
        .integer("parent_unit_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("units")
        .onDelete("CASCADE");
    });
  }

  await knex.raw(
    'ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_subject_id_name_unique"'
  );
  const hasUnitDriveIdx = await knex.schema.hasColumn("units", "drive_folder_id");
  if (hasUnitDriveIdx) {
    await knex.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS "units_drive_folder_id_unique" ON "units" ("drive_folder_id") WHERE "drive_folder_id" IS NOT NULL'
    );
  }

  // 4. notes — store the Drive modified time so previews can serve fresh
  // content after a file is updated in Drive, and index the Drive file id.
  const hasModified = await knex.schema.hasColumn("notes", "drive_modified_time");
  if (!hasModified) {
    await knex.schema.alterTable("notes", function (table) {
      table.timestamp("drive_modified_time").nullable();
    });
  }
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS "idx_notes_drive_file_id" ON "notes" ("drive_file_id")'
  );

  // 5. drive_sync_state — single-row bookkeeping for sync runs.
  const hasSyncState = await knex.schema.hasTable("drive_sync_state");
  if (!hasSyncState) {
    await knex.schema.createTable("drive_sync_state", function (table) {
      table.increments("id").primary();
      table.string("status", 20).notNullable().defaultTo("idle");
      table.timestamp("last_synced_at").nullable();
      table.timestamp("last_attempt_at").nullable();
      table.text("last_error").nullable();
      table.integer("folders_count").nullable();
      table.integer("files_count").nullable();
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
    await knex("drive_sync_state").insert({ id: 1, status: "idle" });
  }
};

async function addNullableDriveColumn(knex, tableName) {
  const hasColumn = await knex.schema.hasColumn(tableName, "drive_folder_id");
  if (!hasColumn) {
    await knex.schema.alterTable(tableName, function (table) {
      table.string("drive_folder_id", 255).nullable();
    });
  }
  await knex.raw(
    'CREATE UNIQUE INDEX IF NOT EXISTS "' +
      tableName +
      '_drive_folder_id_unique" ON "' +
      tableName +
      '" ("drive_folder_id") WHERE "drive_folder_id" IS NOT NULL'
  );
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("drive_nodes");
  await knex.schema.dropTableIfExists("drive_sync_state");

  await knex.schema.alterTable("units", function (table) {
    table.dropColumn("parent_unit_id");
  });
  await knex.raw('DROP INDEX IF EXISTS "units_drive_folder_id_unique"');
  await knex.schema.alterTable("units", function (table) {
    table.unique(["subject_id", "name"]);
  });

  await knex.schema.alterTable("notes", function (table) {
    table.dropColumn("drive_modified_time");
  });
  await knex.raw('DROP INDEX IF EXISTS "idx_notes_drive_file_id"');

  const tables = ["years", "semesters", "subjects"];
  for (const t of tables) {
    await knex.raw('DROP INDEX IF EXISTS "' + t + '_drive_folder_id_unique"');
    const has = await knex.schema.hasColumn(t, "drive_folder_id");
    if (has) {
      await knex.schema.alterTable(t, function (table) {
        table.dropColumn("drive_folder_id");
      });
    }
  }
};
