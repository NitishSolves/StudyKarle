const db = require("../config/db");

const TABLE = "view_history";

module.exports = {
  async record(userId, noteId) {
    return db(TABLE).insert({
      user_id: userId,
      note_id: noteId,
    });
  },

  async findByUser(userId, limit) {
    return db(TABLE)
      .join("notes", "notes.id", "view_history.note_id")
      .join("subjects", "subjects.id", "notes.subject_id")
      .select(
        "view_history.viewed_at",
        "notes.id",
        "notes.title",
        "subjects.name as subject_name"
      )
      .where("view_history.user_id", userId)
      .orderBy("view_history.viewed_at", "desc")
      .limit(limit || 10);
  },

  async findAll(limit) {
    return db(TABLE)
      .join("users", "users.id", "view_history.user_id")
      .join("notes", "notes.id", "view_history.note_id")
      .join("subjects", "subjects.id", "notes.subject_id")
      .join("semesters", "semesters.id", "subjects.semester_id")
      .join("years", "years.id", "semesters.year_id")
      .select(
        "view_history.id",
        "view_history.viewed_at",

        "users.name as user_name",
        "users.email",

        "notes.id as note_id",
        "notes.title as note_title",

        "subjects.name as subject_name",

        "semesters.label as semester_label",
        "years.label as year_label"
      )
      .orderBy("view_history.viewed_at", "desc")
      .limit(limit || 100);
  },

  async countDistinctViewers(noteId) {
    const result = await db(TABLE)
      .where({ note_id: noteId })
      .countDistinct("user_id as count")
      .first();

    return Number(result.count);
  },

  async totalViews() {
    const result = await db(TABLE).count("id as count").first();

    return Number(result.count);
  },
};
