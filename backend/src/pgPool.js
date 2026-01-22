const pg = require("pg");
const { Pool } = pg;
const isProduction = process.env.NODE_ENV === "production";

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on("error", (err, client) => {
  console.error("Erro inesperado no cliente do pool", err);
  process.exit(-1);
});

module.exports = pool;
