import { Router } from "express";
import type { Config } from "../config/cargar";
import { especificacion } from "../openapi/especificacion";

export function rutasDocs(config: Config): Router {
  const router = Router();

  // La especificacion no contiene secretos; en produccion solo se alcanza si el proxy enruta esta ruta.
  router.get("/openapi.json", (_req, res) => {
    res.json(especificacion);
  });

  // Interfaz Swagger: solo fuera de produccion. swagger-ui-express es una dependencia de desarrollo,
  // asi que en la imagen de produccion ni se instala ni se carga.
  if (config.entorno !== "production") {
    const swaggerUi = require("swagger-ui-express") as typeof import("swagger-ui-express");
    router.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(especificacion as unknown as Record<string, unknown>, { customSiteTitle: "EcoCampus API" })
    );
  }

  return router;
}
