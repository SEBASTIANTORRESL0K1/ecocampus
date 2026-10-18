import { Router } from "express";
import type { Config } from "../config/cargar";
import { dominioPermitido, normalizarCorreo } from "../auth/correo";
import { participanteDe } from "../auth/participante";
import type { PerfilSaml } from "../auth/tipos";
import { log } from "../logger";

/**
 * Acceso con solo el correo (REQUIERE_LOGIN=false). La identidad NO se verifica: cualquiera puede escribir el correo
 * de otra persona. Se mitiga con la UNIQUE de participante_id y correo y limitando el dominio.
 */
export function rutasAccesoCorreo(config: Config): Router {
  const router = Router();

  router.post("/api/acceso/correo", (req, res) => {
    const correo = normalizarCorreo((req.body as { correo?: unknown } | undefined)?.correo);
    if (!correo) {
      res.status(400).json({ success: false, error: "correo-invalido" });
      return;
    }
    if (!dominioPermitido(correo, config.correoDominios)) {
      log("warn", "Acceso por correo rechazado: dominio no permitido");
      res.status(403).json({ success: false, error: "dominio-no-permitido", dominios: config.correoDominios });
      return;
    }
    const usuario: PerfilSaml = { metodoAcceso: "correo", uCorreo: correo };
    // Nueva sesion al entrar: evita fijacion de sesion y descarta cualquier sesion anterior
    req.session.regenerate((errSesion) => {
      if (errSesion) {
        log("error", `No se pudo regenerar la sesion: ${errSesion instanceof Error ? errSesion.message : String(errSesion)}`);
        res.status(500).json({ success: false, error: "error-interno" });
        return;
      }
      req.logIn(usuario, (errLogin) => {
        if (errLogin) {
          log("error", `No se pudo iniciar la sesion: ${errLogin instanceof Error ? errLogin.message : String(errLogin)}`);
          res.status(500).json({ success: false, error: "error-interno" });
          return;
        }
        log("info", `Acceso por correo OK participante=${participanteDe(usuario, config.idSalt)?.id}`);
        res.json({ success: true });
      });
    });
  });

  router.post("/api/acceso/salir", (req, res) => {
    // Destruir la sesion basta (passport 0.5 no llama al callback de req.logout)
    req.session.destroy(() => res.json({ success: true }));
  });

  return router;
}
