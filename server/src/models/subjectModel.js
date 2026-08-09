const db = require("../config/db");

const TABLE = "subjects";

module.exports = {
  async findBySemesterId(semesterId) {
    return db(TABLE)
      .leftJoin("notes", function () {
        this.on("notes.subject_id", "=", "subjects.id").andOn(
          db.raw("notes.status = 'published'")
        );
      })
      .select(
        "subjects.id",
        "subjects.name",
        "subjects.icon",
        "subjects.color",
        "subjects.semester_id"
      )
      .count("notes.id as note_count")
      .where("subjects.semester_id", semesterId)
      .groupBy("subjects.id")
      .orderBy("subjects.name", "asc");
  },

  async findById(id) {
    return db(TABLE).where({ id: id }).first();
  },

  async findByIdWithContext(id) {
    return db(TABLE)
      .join("semesters", "semesters.id", "subjects.semester_id")
      .join("years", "years.id", "semesters.year_id")
      .select(
        "subjects.id",
        "subjects.name",
        "subjects.icon",
        "subjects.color",
        "subjects.semester_id",
        "semesters.label as semester_label",
        "semesters.year_id",
        "years.label as year_label"
      )
      .where("subjects.id", id)
      .first();
  },

  async findByIdWithUnits(id) {
    const subject = await this.findByIdWithContext(id);
    if (!subject) return null;

    const units = await db("units")
      .where("subject_id", id)
      .orderBy("order_index", "asc")
      .orderBy("name", "asc");

    subject.units = units;
    return subject;
  },

  async create(data) {
    const rows = await db(TABLE)
      .insert({
        semester_id: data.semesterId,
        name: data.name,
        icon: data.icon || "menu_book",
        color: data.color || "primary",
      })
      .returning("*");
    return rows[0];
  },

  async update(id, data) {
    const rows = await db(TABLE)
      .where({ id: id })
      .update({
        name: data.name,
        icon: data.icon,
        color: data.color,
      })
      .returning("*");
    return rows[0];
  },

  async remove(id) {
    return db(TABLE).where({ id: id }).del();
  },

  async listAllForAdmin() {
    return db(TABLE)
      .join("semesters", "semesters.id", "subjects.semester_id")
      .join("years", "years.id", "semesters.year_id")
      .select(
        "subjects.id",
        "subjects.name",
        "subjects.icon",
        "subjects.color",
        "subjects.semester_id",
        "semesters.label as semester_label",
        "years.label as year_label"
      )
      .orderBy("years.order_index", "asc")
      .orderBy("semesters.order_index", "asc")
      .orderBy("subjects.name", "asc");
  },
};
