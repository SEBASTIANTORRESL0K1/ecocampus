const mysql = require("mysql2/promise");

function crearPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "ecocampus",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecocampus",
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
  });
}

async function esperarBD(pool, log, intentos = 30, esperaMs = 2000) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      log("warn", `MySQL no responde (intento ${i}/${intentos}): ${err.code || err.message}`);
      await new Promise((r) => setTimeout(r, esperaMs));
    }
  }
  throw new Error("No se pudo conectar a MySQL");
}

module.exports = { crearPool, esperarBD };
