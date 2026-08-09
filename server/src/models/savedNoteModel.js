const db = require("../config/db");

const TABLE = "saved_notes";

async function findByUser(userId) {
  return db(TABLE)
    .join("notes", "saved_notes.note_id", "notes.id")
    .join("subjects", "subjects.id", "notes.subject_id")
    .select(
      "notes.id",
      "notes.title",
      "notes.description",
      "notes.size_bytes",
      "notes.created_at",
      "subjects.name as subject_name"
    )
    .where("saved_notes.user_id", userId)
    .orderBy("saved_notes.created_at", "desc");
}

async function exists(userId, noteId) {
  const row = await db(TABLE)
    .where({
      user_id: userId,
      note_id: noteId,
    })
    .first();

  return !!row;
}

async function create(userId, noteId) {
  const rows = await db(TABLE)
    .insert({
      user_id: userId,
      note_id: noteId,
    })
    .onConflict(["user_id", "note_id"])
    .ignore()
    .returning("*");

  return rows[0];
}

async function remove(userId, noteId) {
  return db(TABLE)
    .where({
      user_id: userId,
      note_id: noteId,
    })
    .del();
}

async function countByUser(userId) {
  const result = await db(TABLE)
    .where({
      user_id: userId,
    })
    .count("id as count")
    .first();

  return Number(result.count);
}

async function findAll(limit = 100) {
  return db(TABLE)
    .join("users", "users.id", "saved_notes.user_id")
    .join("notes", "notes.id", "saved_notes.note_id")
    .join("subjects", "subjects.id", "notes.subject_id")
    .select(
      "saved_notes.id",
      "saved_notes.created_at",
      "users.name as user_name",
      "users.email",
      "notes.title",
      "subjects.name as subject_name"
    )
    .orderBy("saved_notes.created_at", "desc")
    .limit(limit);
}

module.exports = {
  findByUser,
  findAll,
  exists,
  create,
  remove,
  countByUser,
};
