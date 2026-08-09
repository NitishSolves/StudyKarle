const db = require("../config/db");

const TABLE = "saved_files";

async function findByUser(userId) {
  return db(TABLE)
    .join("drive_nodes", "saved_files.drive_id", "drive_nodes.drive_id")
    .select(
      "drive_nodes.drive_id as driveId",
      "drive_nodes.name as name",
      "drive_nodes.size_bytes as size_bytes",
      "drive_nodes.modified_time as modified_time",
      "saved_files.created_at as saved_at"
    )
    .where("saved_files.user_id", userId)
    .orderBy("saved_files.created_at", "desc");
}

async function exists(userId, driveId) {
  const row = await db(TABLE)
    .where({ user_id: userId, drive_id: driveId })
    .first();
  return !!row;
}

async function create(userId, driveId) {
  const rows = await db(TABLE)
    .insert({ user_id: userId, drive_id: driveId })
    .onConflict(["user_id", "drive_id"])
    .ignore()
    .returning("*");
  return rows[0];
}

async function remove(userId, driveId) {
  return db(TABLE).where({ user_id: userId, drive_id: driveId }).del();
}

async function countByUser(userId) {
  const result = await db(TABLE)
    .where({ user_id: userId })
    .count("id as count")
    .first();
  return Number(result.count);
}

module.exports = {
  findByUser,
  exists,
  create,
  remove,
  countByUser,
};
