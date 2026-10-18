import { Router } from "express";
import type { Config } from "../config/cargar";
import { aPublico, participanteDeSesion, puedeParticipar } from "../auth/participante";
import { log } from "../logger";

export function rutasSesion(config: Config): Router {
  const router = Router();

  // modoAcceso le dice al frontend que pantalla de entrada mostrar (login federado o correo) sin recompilarlo.
  router.get("/api/me", (req, res) => {
    const participante = participanteDeSesion(req, config);
    const permitido = participante !== null && puedeParticipar(participante, config);
    if (participante && !permitido) log("warn", `Acceso denegado participante=${participante.id} tipo=${participante.tipo}`);
    res.json({
      authenticated: participante !== null,
      permitido,
      modoAcceso: config.modoAcceso,
      participante: participante && permitido ? aPublico(participante) : null,
    });
  });

  return router;
}
