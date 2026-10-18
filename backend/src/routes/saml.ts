import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import passport from "passport";
import type { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import type { Config } from "../config/cargar";
import { participanteDe } from "../auth/participante";
import { metadatosSp } from "../auth/saml";
import { log } from "../logger";

/** Rutas del login federado (solo se montan con REQUIERE_LOGIN=true). */
export function rutasSaml(config: Config, estrategia: SamlStrategy): Router {
  const router = Router();
  const volverAlFrontend: RequestHandler = (_req, res) => res.redirect(config.frontendUrl);

  router.get("/", (_req, res) => res.redirect("/login"));

  router.get("/login", passport.authenticate("saml", { failureRedirect: "/login/fail" }), volverAlFrontend);

  // El IdP de la UCOL hace POST a /api/auth/login/callback; /login/callback es el callbackUrl de la demo original.
  const autenticarCallback: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("saml", (err: unknown, usuario?: Express.User | false, info?: unknown) => {
      if (err) {
        log("error", `Login SAML fallo: ${err instanceof Error ? err.message : String(err)}`, err instanceof Error ? err.stack : undefined);
        return res.redirect("/login/fail");
      }
      if (!usuario) {
        log("warn", "Login SAML sin usuario", info);
        return res.redirect("/login/fail");
      }
      req.logIn(usuario, (errSesion) => {
        if (errSesion) {
          log("error", `No se pudo crear la sesion: ${errSesion instanceof Error ? errSesion.message : String(errSesion)}`);
          return res.redirect("/login/fail");
        }
        const participante = participanteDe(usuario, config.idSalt);
        log("info", `Login OK participante=${participante?.id} tipo=${participante?.tipo}`);
        if (!participante) log("warn", "El perfil SAML no trae uCuenta, uCorreo ni nameID");
        res.redirect(config.frontendUrl);
      });
    })(req, res, next);
  };
  router.post("/login/callback", autenticarCallback);
  router.post("/api/auth/login/callback", autenticarCallback);

  router.get("/logout", (req, res) => {
    if (!req.user) return res.redirect(config.frontendUrl);
    // passport-saml lee req.user (nameID y sessionIndex del perfil SAML) para armar la solicitud de cierre
    estrategia.logout(req as unknown as Parameters<SamlStrategy["logout"]>[0], (err, url) => {
      if (err || !url) {
        log("error", `Logout SAML fallo: ${err ? err.message : "el IdP no devolvio URL"}`, err?.stack);
        return res.redirect(config.frontendUrl);
      }
      res.redirect(url);
    });
  });

  const alTerminarLogout: RequestHandler = (req, res) =>
    req.logout(() => {
      log("info", "Logout completado");
      res.redirect(config.frontendUrl);
    });
  router.post("/logout/callback", alTerminarLogout);
  router.post("/api/auth/logout/callback", alTerminarLogout);

  router.get("/login/fail", (_req, res) => res.status(401).send("Login failed"));

  router.get("/Metadata", (_req, res) => {
    res.type("application/xml");
    res.send(metadatosSp(estrategia, config.saml));
  });

  return router;
}
