import assert from "node:assert";
import { once } from "node:events";
import fs from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test, { after, before, describe } from "node:test";
import type { Express } from "express";
import type { Pool } from "mysql2/promise";
import { crearApp } from "../app";
import { cargarConfig } from "../config/cargar";
import { respuestasSchema, validarRespuesta } from "../validacion/respuestas";
import { ejemploCuerpo, especificacion } from "./especificacion";
import { RUTA_SALIDA, serializar } from "./generar";

const poolSimulado = { query: async () => [{ insertId: 1 }] } as unknown as Pool;

type Capa = { route?: { path: string; methods: Record<string, boolean> }; handle?: { stack?: Capa[] } };

/** Rutas registradas en Express como "metodo /ruta" (recorre tambien los routers montados). */
function rutasDeExpress(app: Express): string[] {
  const salida = new Set<string>();
  const recorrer = (pila: Capa[]) => {
    for (const capa of pila) {
      if (capa.route) for (const metodo of Object.keys(capa.route.methods)) salida.add(`${metodo} ${capa.route.path}`);
      else if (capa.handle?.stack) recorrer(capa.handle.stack);
    }
  };
  recorrer((app as unknown as { _router: { stack: Capa[] } })._router.stack);
  return [...salida].sort();
}

function rutasDeLaEspecificacion(): string[] {
  const salida: string[] = [];
  for (const [ruta, operaciones] of Object.entries(especificacion.paths)) {
    for (const metodo of Object.keys(operaciones)) salida.push(`${metodo} ${ruta}`);
  }
  return salida.sort();
}

test("toda referencia $ref apunta a algo que existe en components", () => {
  const referencias: string[] = [];
  const recorrer = (nodo: unknown) => {
    if (Array.isArray(nodo)) nodo.forEach(recorrer);
    else if (typeof nodo === "object" && nodo !== null) {
      for (const [clave, valor] of Object.entries(nodo)) {
        if (clave === "$ref" && typeof valor === "string") referencias.push(valor);
        else recorrer(valor);
      }
    }
  };
  recorrer(especificacion);
  assert.ok(referencias.length > 0);
  for (const ref of referencias) {
    const partes = ref.replace(/^#\//, "").split("/");
    let actual: unknown = especificacion;
    for (const parte of partes) actual = (actual as Record<string, unknown> | undefined)?.[parte];
    assert.ok(actual !== undefined, `referencia rota: ${ref}`);
  }
});

test("la especificacion documenta exactamente las rutas registradas en Express", () => {
  const app = crearApp({ config: cargarConfig({}), pool: poolSimulado });
  // /openapi.json es la propia documentacion y no se describe a si misma
  const enExpress = rutasDeExpress(app).filter((r) => r !== "get /openapi.json");
  const enEspecificacion = rutasDeLaEspecificacion();
  assert.deepStrictEqual(
    enEspecificacion,
    enExpress,
    `Rutas desalineadas.\n  Solo en Express: ${enExpress.filter((r) => !enEspecificacion.includes(r)).join(", ") || "-"}\n  Solo en la especificacion: ${enEspecificacion.filter((r) => !enExpress.includes(r)).join(", ") || "-"}`
  );
});

describe("el esquema de las respuestas coincide con la validacion real", () => {
  const esquema = especificacion.components.schemas.Respuestas;
  const claves = Object.keys(esquema.properties);

  test("mismas preguntas que el esquema Zod", () => {
    assert.deepStrictEqual([...claves].sort(), Object.keys(respuestasSchema.shape).sort());
  });

  test("las obligatorias son exactamente las que la validacion exige", () => {
    for (const clave of claves) {
      const respuestas: Record<string, unknown> = { ...ejemploCuerpo.respuestas };
      delete respuestas[clave];
      const aceptada = validarRespuesta({ ...ejemploCuerpo, respuestas }, null).ok;
      const obligatoria = (esquema.required as readonly string[]).includes(clave);
      assert.strictEqual(aceptada, !obligatoria, `la pregunta ${clave} ${obligatoria ? "debe ser" : "no debe ser"} obligatoria`);
    }
  });

  test("el ejemplo del cuerpo es una peticion valida", () => {
    const r = validarRespuesta(ejemploCuerpo, null);
    assert.ok(r.ok, r.ok ? "" : r.errores.join("; "));
  });
});

test("docs/openapi.json esta al dia (si falla, ejecuta `npm run openapi` en backend/)", () => {
  const guardado = fs.readFileSync(RUTA_SALIDA, "utf8").replace(/\r\n/g, "\n");
  assert.strictEqual(guardado, serializar());
});

describe("rutas de documentacion", () => {
  async function levantar(env: Record<string, string>): Promise<{ url: string; servidor: Server }> {
    const servidor = crearApp({ config: cargarConfig(env), pool: poolSimulado }).listen(0);
    await once(servidor, "listening");
    return { url: `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`, servidor };
  }

  describe("fuera de produccion", () => {
    let servidor: Server;
    let url = "";
    before(async () => ({ servidor, url } = await levantar({})));
    after(() => servidor.close());

    test("GET /openapi.json devuelve la especificacion", async () => {
      const r = await fetch(`${url}/openapi.json`);
      assert.strictEqual(r.status, 200);
      assert.deepStrictEqual(await r.json(), JSON.parse(JSON.stringify(especificacion)));
    });

    test("GET /docs/ sirve la interfaz Swagger", async () => {
      const r = await fetch(`${url}/docs/`);
      assert.strictEqual(r.status, 200);
      assert.match(r.headers.get("content-type") ?? "", /html/);
      assert.match(await r.text(), /swagger/i);
    });
  });

  describe("en produccion", () => {
    let servidor: Server;
    let url = "";
    before(
      async () =>
        ({ servidor, url } = await levantar({
          NODE_ENV: "production",
          SESSION_SECRET: "secreto-largo-de-prueba-123",
          ID_SALT: "sal-de-prueba",
          DB_PASSWORD: "clave-db",
        }))
    );
    after(() => servidor.close());

    test("la interfaz Swagger no se monta, la especificacion sigue disponible", async () => {
      assert.strictEqual((await fetch(`${url}/docs/`)).status, 404);
      assert.strictEqual((await fetch(`${url}/openapi.json`)).status, 200);
    });
  });
});
