const db = require("../config/db");

const TABLE = "semesters";

module.exports = {
  async findByYearId(yearId) {
    return db(TABLE).where({ year_id: yearId }).orderBy("order_index", "asc");
  },

  async findById(id) {
    return db(TABLE).where({ id: id }).first();
  },

  async findByIdWithYear(id) {
    return db(TABLE)
      .join("years", "years.id", "semesters.year_id")
      .select(
        "semesters.id",
        "semesters.label",
        "semesters.order_index",
        "semesters.year_id",
        "years.label as year_label"
      )
      .where("semesters.id", id)
      .first();
  },
};
