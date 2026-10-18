import { Router } from "express";
import type { Pool } from "mysql2/promise";
import { codigoDe, log } from "../logger";

export function rutasSalud(pool: Pool): Router {
  const router = Router();

  router.get("/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (err) {
      log("error", `Health check: MySQL no responde (${codigoDe(err)})`);
      res.status(503).json({ status: "db-down" });
    }
  });

  return router;
}
