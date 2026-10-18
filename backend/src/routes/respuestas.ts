import { Router } from "express";
import type { Pool, ResultSetHeader } from "mysql2/promise";
import type { Config } from "../config/cargar";
import { esEstudiante, participanteDe } from "../auth/participante";
import type { Participante } from "../auth/tipos";
import { codigoDe, log } from "../logger";
import { COLUMNAS, validarRespuesta } from "../validacion/respuestas";

const SQL_INSERT = `INSERT INTO respuestas (${COLUMNAS.join(", ")}) VALUES (${COLUMNAS.map(() => "?").join(", ")})`;

export function rutasRespuestas(config: Config, pool: Pool): Router {
  const router = Router();

  router.post("/api/respuestas", async (req, res) => {
    let participante: Participante | null = null;
    if (config.requiereLogin) {
      participante = req.isAuthenticated() && req.user ? participanteDe(req.user, config.idSalt) : null;
      if (!participante) return res.status(401).json({ success: false, error: "sin-sesion" });
      if (!esEstudiante(participante)) {
        log("warn", `Envio rechazado participante=${participante.id} tipo=${participante.tipo}`);
        return res.status(403).json({ success: false, error: "no-permitido" });
      }
    }
    const quien = participante?.id ?? "-";

    const validacion = validarRespuesta(req.body, participante);
    if (!validacion.ok) {
      log("warn", `Respuesta invalida participante=${quien}: ${validacion.errores.join("; ")}`);
      return res.status(400).json({ success: false, error: "invalido", detalle: validacion.errores });
    }

    try {
      const [resultado] = await pool.query<ResultSetHeader>(
        SQL_INSERT,
        COLUMNAS.map((columna) => validacion.datos[columna])
      );
      log("info", `Respuesta guardada id=${resultado.insertId} participante=${quien}`);
      return res.status(201).json({ success: true });
    } catch (err) {
      if (codigoDe(err) === "ER_DUP_ENTRY") {
        log("warn", `Participacion duplicada participante=${quien}`);
        return res.status(409).json({ success: false, error: "duplicado" });
      }
      log("error", `No se pudo guardar la respuesta: ${codigoDe(err)}`, err instanceof Error ? err.stack : undefined);
      return res.status(500).json({ success: false, error: "error-interno" });
    }
  });

  return router;
}
