const db = require("../config/db");

const TABLE = "units";

module.exports = {
  async findBySubjectId(subjectId) {
    return db(TABLE)
      .where("subject_id", subjectId)
      .orderBy("order_index", "asc")
      .orderBy("name", "asc");
  },

  // Returns the nested unit tree (subfolders preserved) for a subject.
  // Each node carries its direct note_count and a recursive total_count.
  async findTreeBySubjectId(subjectId) {
    const rows = await db(TABLE)
      .leftJoin("notes", function () {
        this.on("notes.unit_id", "=", "units.id").andOn(
          db.raw("notes.status = 'published'")
        );
      })
      .select(
        "units.id",
        "units.name",
        "units.order_index",
        "units.drive_folder_id",
        "units.parent_unit_id",
        "units.subject_id",
        "units.created_at",
        "units.updated_at"
      )
      .count("notes.id as note_count")
      .where("units.subject_id", subjectId)
      .groupBy("units.id")
      .orderBy("units.order_index", "asc")
      .orderBy("units.name", "asc");

    const byId = {};
    const roots = [];

    rows.forEach(function (row) {
      row.note_count = Number(row.note_count) || 0;
      row.total_count = row.note_count;
      row.children = [];
      byId[row.id] = row;
    });

    rows.forEach(function (row) {
      const parent = row.parent_unit_id ? byId[row.parent_unit_id] : null;
      if (parent) {
        parent.children.push(row);
      } else {
        roots.push(row);
      }
    });

    // Recursively roll child counts up so a folder shows the size of its
    // whole subtree.
    function rollup(node) {
      node.children.forEach(function (child) {
        node.total_count += rollup(child);
      });
      return node.total_count;
    }
    roots.forEach(rollup);

    return roots;
  },

  async findById(id) {
    return db(TABLE).where({ id: id }).first();
  },

  async create(data) {
    const rows = await db(TABLE)
      .insert({
        subject_id: data.subjectId,
        name: data.name,
        order_index: data.orderIndex || 0,
        drive_folder_id: data.driveFolderId || null,
      })
      .returning("*");
    return rows[0];
  },

  async update(id, data) {
    const rows = await db(TABLE)
      .where({ id: id })
      .update({
        name: data.name,
        order_index: data.orderIndex,
        drive_folder_id: data.driveFolderId,
        updated_at: db.fn.now(),
      })
      .returning("*");
    return rows[0];
  },

  async remove(id) {
    return db(TABLE).where({ id: id }).del();
  },

  async findBySubjectAndName(subjectId, name) {
    return db(TABLE)
      .where({
        subject_id: subjectId,
        name: name,
      })
      .first();
  },

  async findBySubjectIdWithNoteCount(subjectId) {
    return db(TABLE)
      .leftJoin("notes", function () {
        this.on("notes.unit_id", "=", "units.id").andOn(
          db.raw("notes.status = 'published'")
        );
      })
      .select(
        "units.id",
        "units.name",
        "units.order_index",
        "units.drive_folder_id",
        "units.subject_id",
        "units.created_at",
        "units.updated_at"
      )
      .count("notes.id as note_count")
      .where("units.subject_id", subjectId)
      .groupBy("units.id")
      .orderBy("units.order_index", "asc")
      .orderBy("units.name", "asc");
  },
};
