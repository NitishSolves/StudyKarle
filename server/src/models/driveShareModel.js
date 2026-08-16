const db = require("../config/db");

const TABLE = "drive_shares";

const PUBLIC_COLUMNS = [
  "id",
  "drive_id",
  "token",
  "permission",
  "expires_at",
  "revoked_at",
  "created_at",
  "updated_at",
];

module.exports = {
  async create(data) {
    const rows = await db(TABLE)
      .insert({
        drive_id: data.driveId,
        token: data.token,
        permission: data.permission,
        created_by: data.createdBy,
        expires_at: data.expiresAt || null,
      })
      .returning("*");
    return rows[0];
  },

  async findByToken(token) {
    return db(TABLE).where({ token: token }).first();
  },

  async findByDriveId(driveId) {
    return db(TABLE).where({ drive_id: driveId }).orderBy("created_at", "desc");
  },

  // A share the requesting user may manage: either the user who created it
  // or (for admins) any share in the library.
  async findManageableByDriveId(driveId, userId, isAdmin) {
    const query = db(TABLE).where({ drive_id: driveId });
    if (!isAdmin) {
      query.andWhere({ created_by: userId });
    }
    return query.orderBy("created_at", "desc");
  },

  async findManageableByDriveIdAndId(driveId, shareId, userId, isAdmin) {
    const query = db(TABLE).where({ id: shareId, drive_id: driveId });
    if (!isAdmin) {
      query.andWhere({ created_by: userId });
    }
    return query.first();
  },

  async update(id, data) {
    const patch = { updated_at: db.fn.now() };
    if (data.permission !== undefined) patch.permission = data.permission;
    if (data.expiresAt !== undefined) patch.expires_at = data.expiresAt;
    if (data.revokedAt !== undefined) patch.revoked_at = data.revokedAt;
    const rows = await db(TABLE).where({ id: id }).update(patch).returning("*");
    return rows[0];
  },

  async remove(id) {
    return db(TABLE).where({ id: id }).del();
  },

  publicColumns() {
    return PUBLIC_COLUMNS.slice();
  },
};
