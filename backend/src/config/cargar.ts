import path from "node:path";
import { z } from "zod";

// Valores de desarrollo del asesor (UCOL); en produccion se sobrescriben por variables de entorno.
const SAML_ISSUER_DEV = "http://localhost/20166932";

// Docker puede pasar variables vacias: se tratan como no definidas.
const sinVacios = (v: unknown) => (v === "" ? undefined : v);

const texto = (defecto: string) => z.preprocess(sinVacios, z.string().min(1).default(defecto));
const url = (defecto: string) => z.preprocess(sinVacios, z.url().default(defecto));
const entero = (defecto: number, min: number, max: number) =>
  z.preprocess(sinVacios, z.coerce.number().int().min(min).max(max).default(defecto));
const booleano = (defecto: boolean) =>
  z.preprocess(sinVacios, z.enum(["true", "false"]).optional()).transform((v) => (v === undefined ? defecto : v === "true"));

const DOMINIO = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
// Lista separada por comas ("ucol.mx,alumnos.ucol.mx"): se normaliza a minusculas y se valida cada dominio.
const dominios = (defecto: string) =>
  z.preprocess(sinVacios, z.string().default(defecto)).transform((lista, ctx) => {
    const encontrados = lista.split(",").map((d) => d.trim().toLowerCase()).filter((d) => d !== "");
    const invalidos = encontrados.filter((d) => !DOMINIO.test(d));
    if (encontrados.length === 0 || invalidos.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `lista de dominios invalida (ejemplo: ucol.mx,alumnos.ucol.mx)${invalidos.length ? `; invalidos: ${invalidos.join(", ")}` : ""}`,
      });
      return z.NEVER;
    }
    return encontrados;
  });

const esquemaEntorno = z
  .object({
    NODE_ENV: z.preprocess(sinVacios, z.enum(["development", "production", "test"]).default("development")),
    PORT: entero(4006, 1, 65535),
    FRONTEND_URL: url("http://localhost:5173/ecocampus/calculadora"),
    SESSION_SECRET: z.preprocess(sinVacios, z.string().min(16).optional()),
    ID_SALT: z.preprocess(sinVacios, z.string().min(8).optional()),
    // true = login federado SAML de la UCOL; false = acceso con solo el correo institucional
    REQUIERE_LOGIN: booleano(true),
    // Dominios que acepta el acceso por correo (el dominio exacto o cualquier subdominio)
    CORREO_DOMINIOS_PERMITIDOS: dominios("ucol.mx"),
    COOKIE_SECURE: booleano(false),
    TRUST_PROXY: booleano(false),
    DB_HOST: texto("localhost"),
    DB_PORT: entero(3306, 1, 65535),
    DB_USER: texto("ecocampus"),
    DB_PASSWORD: z.string().default(""),
    DB_NAME: texto("ecocampus"),
    SAML_ISSUER: texto(SAML_ISSUER_DEV),
    SAML_CALLBACK_URL: url("http://localhost:4006/login/callback"),
    SAML_LOGOUT_CALLBACK_URL: url("http://localhost:4006/logout/callback"),
    SAML_ENTRY_POINT: url("https://wayf.ucol.mx/saml2/idp/SSOService.php"),
    SAML_LOGOUT_URL: url("https://wayf.ucol.mx/saml2/idp/SingleLogoutService.php"),
    SAML_CERT_DIR: z.preprocess(sinVacios, z.string().optional()),
    // -1 desactiva la validacion de timestamps (desfase de reloj del IdP de UCOL)
    SAML_CLOCK_SKEW_MS: entero(-1, -1, 86_400_000),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    // En produccion los secretos son obligatorios: no se admiten los valores de desarrollo.
    if (!env.SESSION_SECRET) ctx.addIssue({ code: "custom", path: ["SESSION_SECRET"], message: "obligatoria en produccion (minimo 16 caracteres)" });
    if (!env.ID_SALT) ctx.addIssue({ code: "custom", path: ["ID_SALT"], message: "obligatoria en produccion (minimo 8 caracteres)" });
    if (!env.DB_PASSWORD) ctx.addIssue({ code: "custom", path: ["DB_PASSWORD"], message: "obligatoria en produccion" });
  });

export interface Config {
  entorno: "development" | "production" | "test";
  puerto: number;
  frontendUrl: string;
  frontendOrigen: string;
  sessionSecret: string;
  idSalt: string;
  secretosDeDesarrollo: boolean;
  /** "saml": login federado de la UCOL. "correo": acceso con solo el correo (sin verificar la identidad). */
  modoAcceso: "saml" | "correo";
  correoDominios: string[];
  cookieSegura: boolean;
  confiarEnProxy: boolean;
  db: { host: string; port: number; user: string; password: string; database: string };
  saml: {
    issuer: string;
    issuerEsDeDesarrollo: boolean;
    callbackUrl: string;
    logoutCallbackUrl: string;
    entryPoint: string;
    logoutUrl: string;
    certDir: string;
    clockSkewMs: number;
  };
}

export class ErrorConfig extends Error {}

/** Valida las variables de entorno y devuelve la configuracion tipada. Lanza ErrorConfig si algo es invalido. */
export function cargarConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const resultado = esquemaEntorno.safeParse(env);
  if (!resultado.success) {
    const detalle = resultado.error.issues.map((i) => `  - ${i.path.join(".") || "(entorno)"}: ${i.message}`).join("\n");
    throw new ErrorConfig(`Configuracion invalida:\n${detalle}`);
  }
  const e = resultado.data;
  return {
    entorno: e.NODE_ENV,
    puerto: e.PORT,
    frontendUrl: e.FRONTEND_URL,
    frontendOrigen: new URL(e.FRONTEND_URL).origin,
    sessionSecret: e.SESSION_SECRET ?? "ecocampus-dev-secret-cambiar-en-produccion",
    idSalt: e.ID_SALT ?? "ecocampus-dev-salt-cambiar-en-produccion",
    secretosDeDesarrollo: !e.SESSION_SECRET || !e.ID_SALT,
    modoAcceso: e.REQUIERE_LOGIN ? "saml" : "correo",
    correoDominios: e.CORREO_DOMINIOS_PERMITIDOS,
    cookieSegura: e.COOKIE_SECURE,
    confiarEnProxy: e.TRUST_PROXY,
    db: { host: e.DB_HOST, port: e.DB_PORT, user: e.DB_USER, password: e.DB_PASSWORD, database: e.DB_NAME },
    saml: {
      issuer: e.SAML_ISSUER,
      issuerEsDeDesarrollo: e.SAML_ISSUER === SAML_ISSUER_DEV,
      callbackUrl: e.SAML_CALLBACK_URL,
      logoutCallbackUrl: e.SAML_LOGOUT_CALLBACK_URL,
      entryPoint: e.SAML_ENTRY_POINT,
      logoutUrl: e.SAML_LOGOUT_URL,
      // src/config -> raiz del backend (en dist ocurre lo mismo: dist/config -> raiz)
      certDir: e.SAML_CERT_DIR ?? path.resolve(__dirname, "..", "..", "cert"),
      clockSkewMs: e.SAML_CLOCK_SKEW_MS,
    },
  };
}
