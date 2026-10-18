import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { crearApp } from "./app";
import { config } from "./config";
import { crearPool, esperarBD } from "./db";
import { log } from "./logger";

process.on("unhandledRejection", (motivo) => log("error", "unhandledRejection", motivo));
process.on("uncaughtException", (err) => log("error", "uncaughtException", err.stack ?? err));

const pool = crearPool(config.db);
const MySQLStore = MySQLStoreFactory(session);
// El almacen usa el mismo pool: las sesiones sobreviven a reinicios del backend.
const app = crearApp({ config, pool, almacenSesiones: new MySQLStore({}, pool as never) });

esperarBD(pool)
  .then(() => {
    app.listen(config.puerto, () => {
      log("info", `Backend escuchando en http://localhost:${config.puerto} (MySQL conectado)`);
      log("info", `FRONTEND_URL=${config.frontendUrl} (origen CORS: ${config.frontendOrigen}) acceso=${config.modoAcceso}${config.modoAcceso === "correo" ? ` dominios=${config.correoDominios.join(",")}` : ""}`);
      if (config.entorno === "production" && config.modoAcceso === "saml" && config.saml.issuerEsDeDesarrollo) {
        log("warn", "Produccion con el EntityID de desarrollo: el login solo funciona con callback en localhost:4006");
      }
      if (config.secretosDeDesarrollo) {
        log("warn", "SESSION_SECRET o ID_SALT no definidos: usando valores de desarrollo");
      }
    });
  })
  .catch((err: unknown) => {
    log("error", err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
