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

const post = (url: string, cuerpo: unknown) =>
  fetch(`${url}/api/respuestas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });

describe("con login obligatorio (valor por defecto)", () => {
  const { pool, consultas } = poolSimulado();
  let servidor: Server;
  let url = "";
  before(async () => ({ servidor, url } = await levantar({}, pool)));
  after(() => servidor.close());

  test("GET /api/me sin sesion", async () => {
    const r = await fetch(`${url}/api/me`);
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(await r.json(), { authenticated: false, permitido: false, participante: null });
  });

  test("POST /api/respuestas sin sesion devuelve 401 y no toca la base", async () => {
    const r = await post(url, cuerpoValido());
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(await r.json(), { success: false, error: "sin-sesion" });
    assert.strictEqual(consultas.length, 0);
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

describe("guardado de respuestas (REQUIERE_LOGIN=false)", () => {
  const env = { REQUIERE_LOGIN: "false" };

  test("guarda una respuesta valida con todos los parametros", async () => {
    const { pool, consultas } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const r = await post(url, cuerpoValido());
      assert.strictEqual(r.status, 201);
      assert.deepStrictEqual(await r.json(), { success: true });
      assert.strictEqual(consultas.length, 1);
      const [consulta] = consultas;
      assert.ok(consulta);
      assert.strictEqual(consulta.valores.length, COLUMNAS.length);
      assert.strictEqual((consulta.sql.match(/\?/g) ?? []).length, COLUMNAS.length);
      assert.strictEqual(consulta.valores[COLUMNAS.indexOf("participante_id")], null);
      assert.strictEqual(consulta.valores[COLUMNAS.indexOf("habito_cambiar")], "ñ á é");
    } finally {
      servidor.close();
    }
  });

  test("devuelve 400 con el detalle cuando los datos no son validos y no toca la base", async () => {
    const { pool, consultas } = poolSimulado();
    const { url, servidor } = await levantar(env, pool);
    try {
      const cuerpo = cuerpoValido();
      cuerpo.respuestas["1"] = "12";
      cuerpo.respuestas["2"] = "Docente";
      const r = await post(url, cuerpo);
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
      const r = await post(url, cuerpoValido());
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
      const r = await post(url, cuerpoValido());
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
