const LOCAL_VALIDO = /^[a-z0-9][a-z0-9._%+-]*$/;
const DOMINIO_VALIDO = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/**
 * Normaliza el correo escrito por el usuario: minusculas, sin espacios y sin el "+alias" de la parte local
 * (alumno+2@ucol.mx es la misma persona que alumno@ucol.mx). Devuelve null si no parece un correo.
 */
export function normalizarCorreo(entrada: unknown): string | null {
  if (typeof entrada !== "string") return null;
  const correo = entrada.trim().toLowerCase();
  if (correo.length === 0 || correo.length > 254) return null;
  const partes = correo.split("@");
  if (partes.length !== 2) return null;
  const [local = "", dominio = ""] = partes;
  const base = local.split("+")[0] ?? "";
  if (base.length === 0 || base.length > 64 || !LOCAL_VALIDO.test(base) || !DOMINIO_VALIDO.test(dominio)) return null;
  return `${base}@${dominio}`;
}

/** El dominio del correo es uno de los permitidos o un subdominio suyo (alumnos.ucol.mx para ucol.mx). */
export function dominioPermitido(correo: string, dominios: readonly string[]): boolean {
  const dominio = correo.slice(correo.lastIndexOf("@") + 1).toLowerCase();
  return dominios.some((d) => dominio === d || dominio.endsWith(`.${d}`));
}
