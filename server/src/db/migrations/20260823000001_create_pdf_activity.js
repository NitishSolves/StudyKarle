// User PDF activity for the admin Recent Activity dashboard.
//
// Unlike `view_history` (note views only, cascades on note delete) and
// `admin_activity` (admin actions only), this table records the three user
// PDF actions StudyKarle surfaces in Admin → Overview → Recent Activity:
//
//   pdf_opened     — a user opened/previewed a PDF
//   pdf_downloaded — a user downloaded a PDF (recorded only after the stream succeeds)
//   pdf_shared     — a user created a share link for a PDF
//
// `pdf_id` is deliberately polymorphic: it holds the stable Google Drive id
// for drive files or the numeric notes.id for legacy uploaded notes. There is
// deliberately NO foreign key on `pdf_id` (it references two different tables)
// and `pdf_name` is stored as a snapshot so historical activity survives file
// deletion without breaking the dashboard. `user_id` uses ON DELETE SET NULL
// so deleting a user keeps their activity visible (with a null name) instead
// of crashing the dashboard.

exports.up = function (knex) {
  return knex.schema.createTable("pdf_activity", function (table) {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.string("activity_type", 30).notNullable();
    table.string("resource_type", 10).notNullable();
    table.string("pdf_id", 200).notNullable();
    table.string("pdf_name", 255).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.index(["created_at"]);
    table.index(["user_id"]);
    table.index(["pdf_id"]);
    // Supports the dedup check for `pdf_opened` (one meaningful open per
    // user/PDF within the dedup window) without scanning the whole table.
    table.index(["user_id", "resource_type", "pdf_id", "activity_type"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("pdf_activity");
};
