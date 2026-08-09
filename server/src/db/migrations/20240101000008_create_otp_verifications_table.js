exports.up = function (knex) {
  return knex.schema.createTable("otp_verifications", function (table) {
    table.increments("id").primary();
    table.string("email", 255).notNullable().index();
    table.string("name", 120).notNullable();
    table.string("password_hash", 255).notNullable();
    table.string("otp", 6).notNullable();
    table.timestamp("expires_at").notNullable();
    table.integer("resend_count").notNullable().defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["email", "otp"]);
    table.index("expires_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("otp_verifications");
};
