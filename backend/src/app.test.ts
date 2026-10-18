import assert from "node:assert";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test, { after, before, describe } from "node:test";
import type { Pool } from "mysql2/promise";
import { crearApp } from "./app";
import { cargarConfig } from "./config/cargar";
import { COLUMNAS } from "./validacion/respuestas";

// Pruebas de las rutas HTTP con una base de datos simulada: no necesitan MySQL ni el IdP.
type Consulta = { sql: string; valores: unknown[] };

function poolSimulado(comportamiento: (c: Consulta) => unknown = () => [{ insertId: 7 }]) {
  const consultas: Consulta[] = [];
  const pool = {
    query: async (sql: string, valores: unknown[] = []) => {
      consultas.push({ sql, valores });
      const resultado = comportamiento({ sql, valores });
      if (resultado instanceof Error) throw resultado;
      return resultado;
    },
  } as unknown as Pool;
  return { pool, consultas };
}

async function levantar(env: Record<string, string>, pool: Pool): Promise<{ url: string; servidor: Server }> {
  const servidor = crearApp({ config: cargarConfig(env), pool }).listen(0);
  await once(servidor, "listening");
  return { url: `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`, servidor };
}

function cuerpoValido() {
  const respuestas: Record<string, unknown> = { 1: "21", S1: "Femenino", 2: "Ingeniería en Software", 3: "3", 4: "Sí", 5: "Sí", 25: "ñ á é" };
  for (let id = 9; id <= 24; id++) respuestas[id] = 4;
  return { respuestas, tiempoMin: 3, planetas: "entre 1 y 2" };
}

const post = (url: string, cuerpo: unknown, cookie = "") =>
  fetch(`${url}/api/respuestas`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(cuerpo) });

const entrarConCorreo = (url: string, correo: unknown) =>
  fetch(`${url}/api/acceso/correo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correo }) });

/** Cookie de sesion (nombre=valor) de una respuesta de acceso. */
function cookieDe(r: Response): string {
  const cookie = r.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "la respuesta debe abrir una sesion");
  return cookie;
}

describe("con login federado (valor por defecto)", () => {
  const { pool, consultas } = poolSimulado();
  let servidor: Server;
  let url = "";
  before(async () => ({ servidor, url } = await levantar({}, pool)));
  after(() => servidor.close());

  test("GET /api/me sin sesion", async () => {
    const r = await fetch(`${url}/api/me`);
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(await r.json(), { authenticated: false, permitido: false, modoAcceso: "saml", participante: null });
  });

  test("POST /api/respuestas sin sesion devuelve 401 y no toca la base", async () => {
    const r = await post(url, cuerpoValido());
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(await r.json(), { success: false, error: "sin-sesion" });
    assert.strictEqual(consultas.length, 0);
  });

  test("no monta el acceso por correo", async () => {
    assert.strictEqual((await entrarConCorreo(url, "alumno@ucol.mx")).status, 404);
  });

  test("GET /Metadata entrega el XML del proveedor de servicio con el EntityID configurado", async () => {
    const r = await fetch(`${url}/Metadata`);
    assert.strictEqual(r.status, 200);
    assert.match(r.headers.get("content-type") ?? "", /xml/);
    assert.match(await r.text(), /entityID="http:\/\/localhost\/20166932"/);
  });

  test("GET /login redirige al IdP de la UCOL", async () => {
    const r = await fetch(`${url}/login`, { redirect: "manual" });
    assert.strictEqual(r.status, 302);
    assert.match(r.headers.get("location") ?? "", /^https:\/\/wayf\.ucol\.mx\//);
  });

  test("CORS permite solo el origen del frontend y con credenciales", async () => {
    const permitido = await fetch(`${url}/api/me`, { headers: { Origin: "http://localhost:5173" } });
    assert.strictEqual(permitido.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.strictEqual(permitido.headers.get("access-control-allow-credentials"), "true");
    const otro = await fetch(`${url}/api/me`, { headers: { Origin: "https://sitio-malicioso.example" } });
    assert.notStrictEqual(otro.headers.get("access-control-allow-origin"), "https://sitio-malicioso.example");
  });
});

describe("acceso con solo el correo (REQUIERE_LOGIN=false)", () => {
  const env = { REQUIERE_LOGIN: "false" };

  test("no monta el login federado y /api/me informa el modo", async () => {
    const { pool } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      assert.strictEqual((await fetch(`${url}/login`, { redirect: "manual" })).status, 404);
      assert.strictEqual((await fetch(`${url}/Metadata`)).status, 404);
      const me = await (await fetch(`${url}/api/me`)).json();
      assert.deepStrictEqual(me, { authenticated: false, permitido: false, modoAcceso: "correo", participante: null });
    } finally {
      servidor.close();
    }
  });

  test("POST /api/respuestas sin sesion devuelve 401: no hay envios anonimos", async () => {
    const { pool, consultas } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const r = await post(url, cuerpoValido());
      assert.strictEqual(r.status, 401);
      assert.deepStrictEqual(await r.json(), { success: false, error: "sin-sesion" });
      assert.strictEqual(consultas.length, 0);
    } finally {
      servidor.close();
    }
  });

  test("rechaza correos invalidos (400) y de otros dominios (403) sin abrir sesion", async () => {
    const { pool } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const invalido = await entrarConCorreo(url, "no-es-correo");
      assert.strictEqual(invalido.status, 400);
      assert.deepStrictEqual(await invalido.json(), { success: false, error: "correo-invalido" });
      const ajeno = await entrarConCorreo(url, "alguien@gmail.com");
      assert.strictEqual(ajeno.status, 403);
      assert.deepStrictEqual(await ajeno.json(), { success: false, error: "dominio-no-permitido", dominios: ["ucol.mx"] });
      assert.strictEqual(ajeno.headers.get("set-cookie"), null);
    } finally {
      servidor.close();
    }
  });

  test("acepta ucol.mx y sus subdominios; /api/me no expone el correo", async () => {
    const { pool } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const entrada = await entrarConCorreo(url, "Alumno+2@alumnos.UCOL.mx");
      assert.strictEqual(entrada.status, 200);
      const cookie = cookieDe(entrada);
      const textoMe = await (await fetch(`${url}/api/me`, { headers: { Cookie: cookie } })).text();
      const me = JSON.parse(textoMe) as { authenticated: boolean; permitido: boolean; modoAcceso: string; participante: { id: string } };
      assert.strictEqual(me.authenticated, true);
      assert.strictEqual(me.permitido, true);
      assert.strictEqual(me.modoAcceso, "correo");
      assert.match(me.participante.id, /^[0-9a-f]{16}$/);
      assert.ok(!textoMe.includes("alumno"), "el navegador no debe recibir el correo");
    } finally {
      servidor.close();
    }
  });

  test("alumno@ucol.mx y alumno+2@ucol.mx son el mismo participante", async () => {
    const { pool } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const ids: string[] = [];
      for (const correo of ["alumno@ucol.mx", "alumno+2@ucol.mx", "otro@ucol.mx"]) {
        const cookie = cookieDe(await entrarConCorreo(url, correo));
        const me = (await (await fetch(`${url}/api/me`, { headers: { Cookie: cookie } })).json()) as { participante: { id: string } };
        ids.push(me.participante.id);
      }
      assert.strictEqual(ids[0], ids[1]);
      assert.notStrictEqual(ids[0], ids[2]);
    } finally {
      servidor.close();
    }
  });

  test("guarda una respuesta valida con todos los parametros, el correo normalizado y el metodo", async () => {
    const { pool, consultas } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const cookie = cookieDe(await entrarConCorreo(url, "Alumno+2@ucol.mx"));
      const r = await post(url, cuerpoValido(), cookie);
      assert.strictEqual(r.status, 201);
      assert.deepStrictEqual(await r.json(), { success: true });
      assert.strictEqual(consultas.length, 1);
      const [consulta] = consultas;
      assert.ok(consulta);
      assert.strictEqual(consulta.valores.length, COLUMNAS.length);
      assert.strictEqual((consulta.sql.match(/\?/g) ?? []).length, COLUMNAS.length);
      assert.match(String(consulta.valores[COLUMNAS.indexOf("participante_id")]), /^[0-9a-f]{16}$/);
      assert.strictEqual(consulta.valores[COLUMNAS.indexOf("correo")], "alumno@ucol.mx");
      assert.strictEqual(consulta.valores[COLUMNAS.indexOf("metodo_acceso")], "correo");
      assert.strictEqual(consulta.valores[COLUMNAS.indexOf("habito_cambiar")], "ñ á é");
    } finally {
      servidor.close();
    }
  });

  test("salir cierra la sesion", async () => {
    const { pool } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const cookie = cookieDe(await entrarConCorreo(url, "alumno@ucol.mx"));
      const salir = await fetch(`${url}/api/acceso/salir`, { method: "POST", headers: { Cookie: cookie } });
      assert.strictEqual(salir.status, 200);
      const me = (await (await fetch(`${url}/api/me`, { headers: { Cookie: cookie } })).json()) as { authenticated: boolean };
      assert.strictEqual(me.authenticated, false);
      assert.strictEqual((await post(url, cuerpoValido(), cookie)).status, 401);
    } finally {
      servidor.close();
    }
  });

  test("devuelve 400 con el detalle cuando los datos no son validos y no toca la base", async () => {
    const { pool, consultas } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const cookie = cookieDe(await entrarConCorreo(url, "alumno@ucol.mx"));
      const cuerpo = cuerpoValido();
      cuerpo.respuestas["1"] = "12";
      cuerpo.respuestas["2"] = "Docente";
      const r = await post(url, cuerpo, cookie);
      assert.strictEqual(r.status, 400);
      const json = (await r.json()) as { error: string; detalle: string[] };
      assert.strictEqual(json.error, "invalido");
      assert.ok(json.detalle.some((d) => d.startsWith("respuestas.1")));
      assert.ok(json.detalle.some((d) => d.startsWith("respuestas.2")));
      assert.strictEqual(consultas.length, 0);
    } finally {
      servidor.close();
    }
  });

  test("traduce el duplicado de MySQL a 409", async () => {
    const duplicado = Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" });
    const { pool } = poolSimulado(() => duplicado);
    const { url, servidor } = await levantar(env, pool);
    try {
      const cookie = cookieDe(await entrarConCorreo(url, "alumno@ucol.mx"));
      const r = await post(url, cuerpoValido(), cookie);
      assert.strictEqual(r.status, 409);
      assert.deepStrictEqual(await r.json(), { success: false, error: "duplicado" });
    } finally {
      servidor.close();
    }
  });

  test("devuelve 500 ante cualquier otro error de la base", async () => {
    const { pool } = poolSimulado(() => Object.assign(new Error("connection lost"), { code: "PROTOCOL_CONNECTION_LOST" }));
    const { url, servidor } = await levantar(env, pool);
    try {
      const cookie = cookieDe(await entrarConCorreo(url, "alumno@ucol.mx"));
      const r = await post(url, cuerpoValido(), cookie);
      assert.strictEqual(r.status, 500);
      assert.deepStrictEqual(await r.json(), { success: false, error: "error-interno" });
    } finally {
      servidor.close();
    }
  });
});

describe("salud", () => {
  test("GET /health responde ok si MySQL responde", async () => {
    const { pool } = poolSimulado();
    const { url, servidor } = await levantar({}, pool);
    try {
      const r = await fetch(`${url}/health`);
      assert.strictEqual(r.status, 200);
      assert.deepStrictEqual(await r.json(), { status: "ok" });
    } finally {
      servidor.close();
    }
  });

  test("GET /health responde 503 si MySQL no responde", async () => {
    const { pool } = poolSimulado(() => Object.assign(new Error("down"), { code: "ECONNREFUSED" }));
    const { url, servidor } = await levantar({}, pool);
    try {
      const r = await fetch(`${url}/health`);
      assert.strictEqual(r.status, 503);
      assert.deepStrictEqual(await r.json(), { status: "db-down" });
    } finally {
      servidor.close();
    }
  });
});
