import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import session from "express-session";
import type { Pool } from "mysql2/promise";
import passport from "passport";
import type { Config } from "./config/cargar";
import { crearEstrategiaSaml } from "./auth/saml";
import type { PerfilSaml } from "./auth/tipos";
import { log } from "./logger";
import { rutasAuth } from "./routes/auth";
import { rutasRespuestas } from "./routes/respuestas";
import { rutasSalud } from "./routes/salud";

export interface DependenciasApp {
  config: Config;
  pool: Pool;
  /** Almacen de sesiones; en produccion es MySQL. Sin el, express-session usa memoria (pruebas). */
  almacenSesiones?: session.Store;
}

export function crearApp({ config, pool, almacenSesiones }: DependenciasApp): Express {
  const app = express();
  if (config.confiarEnProxy) app.set("trust proxy", 1);

  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on("finish", () => {
      const nivel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      log(nivel, `${req.method} ${req.path} ${res.statusCode} ${Date.now() - inicio}ms`);
    });
    next();
  });

  passport.serializeUser<PerfilSaml>((usuario, done) => done(null, usuario));
  passport.deserializeUser<PerfilSaml>((usuario, done) => done(null, usuario));
  const estrategia = crearEstrategiaSaml(config.saml);
  passport.use(estrategia);

  app.use(cors({ origin: config.frontendOrigen, credentials: true }));
  app.use(
    session({
      secret: config.sessionSecret,
      ...(almacenSesiones ? { store: almacenSesiones } : {}),
      saveUninitialized: false,
      resave: false,
      cookie: { httpOnly: true, sameSite: "lax", secure: config.cookieSegura },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(rutasAuth(config, estrategia));
  app.use(rutasSalud(pool));
  app.use(rutasRespuestas(config, pool));

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const mensaje = err instanceof Error ? err.message : String(err);
    log("error", `Error no controlado en ${req.method} ${req.path}: ${mensaje}`, err instanceof Error ? err.stack : undefined);
    if (!res.headersSent) res.status(500).send("Error interno");
  });

  return app;
}
