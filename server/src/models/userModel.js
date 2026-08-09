const db = require('../config/db');

const TABLE = 'users';
const PUBLIC_COLUMNS = [
  'id',
  'name',
  'email',
  'role',
  'avatar_url',
  'course',
  'current_year',
  'created_at'
];

module.exports = {
  async create(data) {
    const rows = await db(TABLE)
      .insert({
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: data.passwordHash,
        role: data.role || 'student'
      })
      .returning(PUBLIC_COLUMNS);
    return rows[0];
  },

  async findByEmail(email) {
    return db(TABLE).where({ email: String(email).toLowerCase() }).first();
  },

  async findById(id) {
    return db(TABLE).where({ id: id }).first();
  },

  async findPublicById(id) {
    return db(TABLE).select(PUBLIC_COLUMNS).where({ id: id }).first();
  },

  async updateProfile(id, data) {
    const rows = await db(TABLE)
      .where({ id: id })
      .update({
        name: data.name,
        course: data.course,
        current_year: data.currentYear,
        updated_at: db.fn.now()
      })
      .returning(PUBLIC_COLUMNS);
    return rows[0];
  },

  async updatePassword(id, passwordHash) {
    return db(TABLE).where({ id: id }).update({
      password_hash: passwordHash,
      updated_at: db.fn.now()
    });
  },

  async list(params) {
    const query = db(TABLE).select(PUBLIC_COLUMNS).orderBy('created_at', 'desc');
    if (params && params.search) {
      query.where(function () {
        this.whereILike('name', '%' + params.search + '%').orWhereILike(
          'email',
          '%' + params.search + '%'
        );
      });
    }
    if (params && params.limit) {
      query.limit(params.limit).offset(params.offset || 0);
    }
    return query;
  },

  async count(params) {
    const query = db(TABLE);
    if (params && params.search) {
      query.where(function () {
        this.whereILike('name', '%' + params.search + '%').orWhereILike(
          'email',
          '%' + params.search + '%'
        );
      });
    }
    const result = await query.count('id as count').first();
    return Number(result.count);
  },

  async updateRole(id, role) {
    const rows = await db(TABLE)
      .where({ id: id })
      .update({ role: role, updated_at: db.fn.now() })
      .returning(PUBLIC_COLUMNS);
    return rows[0];
  },

  async remove(id) {
    return db(TABLE).where({ id: id }).del();
  }
};
