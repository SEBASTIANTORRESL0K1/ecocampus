export type Nivel = "info" | "warn" | "error";

// Logs con hora y nivel. Nunca se registran correos, nombres, cuentas ni respuestas SAML completas.
export function log(nivel: Nivel, mensaje: string, extra?: unknown): void {
  const linea = `${new Date().toISOString()} [${nivel.toUpperCase()}] ${mensaje}`;
  const salida = nivel === "error" ? console.error : nivel === "warn" ? console.warn : console.log;
  if (extra === undefined) salida(linea);
  else salida(linea, extra);
}

/** Codigo de error de MySQL/Node si existe; si no, el mensaje. Para los logs y para decidir respuestas. */
export function codigoDe(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err && typeof err.code === "string") return err.code;
  return err instanceof Error ? err.message : String(err);
}
