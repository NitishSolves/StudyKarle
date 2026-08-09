const db = require("../config/db");

const TABLE = "years";

module.exports = {
  async findAll() {
    return db(TABLE).select("*").orderBy("order_index", "asc");
  },

  async findById(id) {
    return db(TABLE)
      .where({ id: parseInt(id, 10) })
      .first();
  },

  async findByLabel(label) {
    return db(TABLE).where({ label: label }).first();
  },
};
