import mysql, { type Pool } from "mysql2/promise";
import type { Config } from "./config/cargar";
import { codigoDe, log } from "./logger";

export function crearPool(db: Config["db"]): Pool {
  return mysql.createPool({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
  });
}

export async function esperarBD(pool: Pool, intentos = 30, esperaMs = 2000): Promise<void> {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      log("warn", `MySQL no responde (intento ${i}/${intentos}): ${codigoDe(err)}`);
      await new Promise((resolver) => setTimeout(resolver, esperaMs));
    }
  }
  throw new Error("No se pudo conectar a MySQL");
}
