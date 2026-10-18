import assert from "node:assert";
import test from "node:test";
import { cargarConfig, ErrorConfig } from "./cargar";

const produccion = {
  NODE_ENV: "production",
  SESSION_SECRET: "secreto-largo-de-prueba-123",
  ID_SALT: "sal-de-prueba",
  DB_PASSWORD: "clave-db",
};

test("sin variables usa los valores de desarrollo", () => {
  const c = cargarConfig({});
  assert.strictEqual(c.entorno, "development");
  assert.strictEqual(c.puerto, 4006);
  assert.strictEqual(c.requiereLogin, true);
  assert.strictEqual(c.cookieSegura, false);
  assert.strictEqual(c.secretosDeDesarrollo, true);
  assert.strictEqual(c.saml.issuer, "http://localhost/20166932");
  assert.strictEqual(c.saml.issuerEsDeDesarrollo, true);
  assert.strictEqual(c.saml.clockSkewMs, -1);
  assert.strictEqual(c.frontendOrigen, "http://localhost:5173");
});

test("convierte numeros y booleanos desde texto", () => {
  const c = cargarConfig({ PORT: "5000", DB_PORT: "3307", REQUIERE_LOGIN: "false", COOKIE_SECURE: "true", TRUST_PROXY: "true", SAML_CLOCK_SKEW_MS: "120000" });
  assert.strictEqual(c.puerto, 5000);
  assert.strictEqual(c.db.port, 3307);
  assert.strictEqual(c.requiereLogin, false);
  assert.strictEqual(c.cookieSegura, true);
  assert.strictEqual(c.confiarEnProxy, true);
  assert.strictEqual(c.saml.clockSkewMs, 120000);
});

test("trata las variables vacias como no definidas", () => {
  const c = cargarConfig({ PORT: "", REQUIERE_LOGIN: "", FRONTEND_URL: "", SAML_ISSUER: "", SESSION_SECRET: "" });
  assert.strictEqual(c.puerto, 4006);
  assert.strictEqual(c.requiereLogin, true);
  assert.strictEqual(c.saml.issuerEsDeDesarrollo, true);
});

test("deriva el origen CORS de FRONTEND_URL y la carpeta de certificados", () => {
  const c = cargarConfig({ FRONTEND_URL: "https://ecocampus.ejemplo.mx/ecocampus/calculadora" });
  assert.strictEqual(c.frontendOrigen, "https://ecocampus.ejemplo.mx");
  assert.ok(/[\\/]cert$/.test(c.saml.certDir), c.saml.certDir);
  assert.strictEqual(cargarConfig({ SAML_CERT_DIR: "/opt/cert" }).saml.certDir, "/opt/cert");
});

test("rechaza valores invalidos con un mensaje que nombra la variable", () => {
  const casos: Array<[Record<string, string>, string]> = [
    [{ REQUIERE_LOGIN: "si" }, "REQUIERE_LOGIN"],
    [{ PORT: "abc" }, "PORT"],
    [{ PORT: "70000" }, "PORT"],
    [{ DB_PORT: "0" }, "DB_PORT"],
    [{ FRONTEND_URL: "no-es-una-url" }, "FRONTEND_URL"],
    [{ SAML_CALLBACK_URL: "tampoco" }, "SAML_CALLBACK_URL"],
    [{ NODE_ENV: "staging" }, "NODE_ENV"],
    [{ SESSION_SECRET: "corto" }, "SESSION_SECRET"],
  ];
  for (const [env, variable] of casos) {
    assert.throws(() => cargarConfig(env), (err) => err instanceof ErrorConfig && err.message.includes(variable), variable);
  }
});

test("en produccion exige secretos y clave de base de datos", () => {
  assert.throws(
    () => cargarConfig({ NODE_ENV: "production" }),
    (err) => err instanceof ErrorConfig && ["SESSION_SECRET", "ID_SALT", "DB_PASSWORD"].every((v) => err.message.includes(v))
  );
  const c = cargarConfig(produccion);
  assert.strictEqual(c.entorno, "production");
  assert.strictEqual(c.secretosDeDesarrollo, false);
  assert.strictEqual(c.sessionSecret, produccion.SESSION_SECRET);
});

test("en produccion avisa si se usa el EntityID de desarrollo", () => {
  assert.strictEqual(cargarConfig(produccion).saml.issuerEsDeDesarrollo, true);
  assert.strictEqual(cargarConfig({ ...produccion, SAML_ISSUER: "https://ecocampus.ejemplo.mx/sp" }).saml.issuerEsDeDesarrollo, false);
});
