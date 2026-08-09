require("dotenv").config();

const fs = require("fs");
const path = require("path");
const knexConfig = require("../knexfile");

// ---------------------------------------------------------------- Safety map
// For each migration file, the concrete DB effects it applies. If those
// effects already exist on the target database, the migration is considered
// already applied (created by an older app version / manual setup) and is
// recorded in the knex migration history instead of being re-run.
//
// Entries are intentionally conservative: every table/column/index listed
// must exist before a migration is baselined. Migrations NOT listed here
// (no-op stubs, seeds, and idempotent migrations) are left for knex to run
// normally because running them is always safe.
const BASELINE_MAP = {
  "20240101000001_create_users.js": {
    tables: ["users"],
  },
  "20240101000002_create_years.js": {
    tables: ["years"],
  },
  "20240101000003_create_semesters.js": {
    tables: ["semesters"],
  },
  "20240101000004_create_subjects.js": {
    tables: ["subjects"],
  },
  "20240101000005_create_notes.js": {
    tables: ["notes"],
  },
  "20240101000006_create_tags.js": {
    tables: ["tags"],
  },
  "20240101000007_create_saved_notes.js": {
    tables: ["saved_notes"],
  },
  "20240101000008_create_otp_verifications_table.js": {
    tables: ["otp_verifications"],
    columns: {
      otp_verifications: [
        "email",
        "name",
        "password_hash",
        "otp",
        "expires_at",
        "resend_count",
      ],
    },
  },
  "20240101000008_create_view_history.js": {
    tables: ["view_history"],
    columns: {
      view_history: ["user_id", "note_id", "viewed_at"],
    },
  },
  "20240101000009_create_admin_activity.js": {
    tables: ["admin_activity"],
  },
  "20240101000009_create_units_table.js": {
    tables: ["units"],
  },
  "20240101000010_add_unit_id_to_notes.js": {
    columns: {
      notes: ["unit_id"],
    },
  },
  "20240802000002_add_status_created_at_index.js": {
    indexes: ["idx_notes_status_created_at"],
  },
};

const MIGRATIONS_DIR = path.join(__dirname, "..", "src", "db", "migrations");

function log(msg) {
  console.log("[baseline] " + msg);
}

async function ensureHistoryTables(db) {
  const hasMigrations = await db.schema.hasTable("knex_migrations");
  if (!hasMigrations) {
    await db.schema.createTable("knex_migrations", function (t) {
      t.increments();
      t.string("name");
      t.integer("batch");
      t.timestamp("migration_time");
    });
    log("created knex_migrations history table");
  }

  const hasLock = await db.schema.hasTable("knex_migrations_lock");
  if (!hasLock) {
    await db.schema.createTable("knex_migrations_lock", function (t) {
      t.increments("index").primary();
      t.integer("is_locked");
    });
    log("created knex_migrations_lock table");
  }

  const lockRows = await db("knex_migrations_lock").select("*");
  if (!lockRows.length) {
    await db("knex_migrations_lock").insert({ is_locked: 0 });
  }
}

async function tableHasColumns(db, table, requiredColumns) {
  const hasTable = await db.schema.hasTable(table);
  if (!hasTable) return false;

  const rows = await db("information_schema.columns")
    .select("column_name")
    .where({ table_name: table, table_schema: "public" });
  const present = new Set(rows.map(function (r) {
    return r.column_name;
  }));
  return requiredColumns.every(function (col) {
    return present.has(col);
  });
}

async function tableHasIndexes(db, indexNames) {
  for (const name of indexNames) {
    const rows = await db("pg_indexes").where({ indexname: name });
    if (!rows.length) return false;
  }
  return true;
}

async function effectsAlreadyPresent(db, spec) {
  for (const table of spec.tables || []) {
    const has = await db.schema.hasTable(table);
    if (!has) return false;
  }

  for (const table of Object.keys(spec.columns || {})) {
    const ok = await tableHasColumns(db, table, spec.columns[table]);
    if (!ok) return false;
  }

  if (spec.indexes) {
    const ok = await tableHasIndexes(db, spec.indexes);
    if (!ok) return false;
  }

  return true;
}

async function main() {
  const env = process.env.NODE_ENV || "development";
  const config = knexConfig[env] || knexConfig.development;
  const db = require("knex")(config);

  try {
    await ensureHistoryTables(db);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(function (f) {
        return f.endsWith(".js");
      })
      .sort();

    const recordedRows = await db("knex_migrations").select("name");
    const recorded = new Set(
      recordedRows.map(function (r) {
        return r.name;
      })
    );

    const toBaseline = [];
    for (const file of files) {
      if (recorded.has(file)) continue;
      const spec = BASELINE_MAP[file];
      if (!spec) continue;

      const alreadyApplied = await effectsAlreadyPresent(db, spec);
      if (alreadyApplied) {
        toBaseline.push(file);
      }
    }

    if (!toBaseline.length) {
      log("migration history is in sync; nothing to baseline");
      return;
    }

    const maxRow = await db("knex_migrations").max("batch as m").first();
    const nextBatch = (maxRow && maxRow.m ? maxRow.m : 0) + 1;

    await db.transaction(async function (trx) {
      for (const name of toBaseline) {
        await trx("knex_migrations").insert({
          name: name,
          batch: nextBatch,
          migration_time: new Date(),
        });
      }
    });

    log(
      "recorded " +
        toBaseline.length +
        " already-applied migration(s) as baselined (batch " +
        nextBatch +
        "): " +
        toBaseline.join(", ")
    );
  } finally {
    await db.destroy();
  }
}

main().catch(function (err) {
  console.error("[baseline] failed: " + err.message);
  process.exit(1);
});
