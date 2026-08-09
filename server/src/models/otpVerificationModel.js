const db = require("../config/db");

const TABLE = "otp_verifications";

module.exports = {
  async create(data) {
    const rows = await db(TABLE)
      .insert({
        email: data.email.toLowerCase(),
        name: data.name,
        password_hash: data.passwordHash,
        otp: data.otp,
        expires_at: data.expiresAt,
        resend_count: data.resendCount || 0,
      })
      .returning("*");
    return rows[0];
  },

  async findByEmail(email) {
    return db(TABLE)
      .where({ email: String(email).toLowerCase() })
      .first();
  },

  async findByEmailAndOtp(email, otp) {
    return db(TABLE)
      .where({
        email: String(email).toLowerCase(),
        otp: String(otp),
      })
      .first();
  },

  async incrementResendCount(email) {
    return db(TABLE)
      .where({ email: String(email).toLowerCase() })
      .increment("resend_count", 1)
      .update({ updated_at: db.fn.now() });
  },

  async removeByEmail(email) {
    return db(TABLE)
      .where({ email: String(email).toLowerCase() })
      .del();
  },

  async removeExpired() {
    return db(TABLE).where("expires_at", "<", db.fn.now()).del();
  },
};
