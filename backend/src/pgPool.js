const pg = require("pg");
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  password: "gustavo26",
  host: "localhost",
  port: 5432,
  database: "shopnaw-ecommerce",
});

module.exports = pool;
