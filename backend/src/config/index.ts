import "dotenv/config";
import { cargarConfig, ErrorConfig, type Config } from "./cargar";

function cargarOSalir(): Config {
  try {
    return cargarConfig();
  } catch (err) {
    console.error(err instanceof ErrorConfig ? err.message : err);
    process.exit(1);
  }
}

export const config: Config = cargarOSalir();
export type { Config } from "./cargar";
