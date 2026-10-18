import fs from "node:fs";
import path from "node:path";
import { especificacion } from "./especificacion";

// backend/src/openapi -> raiz del repositorio
export const RUTA_SALIDA = path.resolve(__dirname, "..", "..", "..", "docs", "openapi.json");

export const serializar = (): string => JSON.stringify(especificacion, null, 2) + "\n";

// npm run openapi: regenera docs/openapi.json a partir del codigo
if (require.main === module) {
  fs.writeFileSync(RUTA_SALIDA, serializar());
  console.log(`Especificacion escrita en ${path.relative(process.cwd(), RUTA_SALIDA)}`);
}
