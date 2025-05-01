const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",           // or your PG user
    password: "Spring@2025",  // the one from pgAdmin
    database: "shopping_db"
  }
});

module.exports = db;
