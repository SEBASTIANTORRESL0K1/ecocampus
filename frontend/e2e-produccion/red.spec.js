import fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';

// Registro de peticiones de red del navegador contra produccion: cada pagina se carga N veces en frio
// (contexto nuevo, sin cache) y se guarda cada peticion con su tipo, estado, tamano y duracion.
// Salida: docs/testing/produccion/resultados/red.json (lo resume resumir-red.mjs).
const CORRIDAS = Number(process.env.CORRIDAS_RED || 5);
const PAGINAS = ['/ecocampus/', '/ecocampus/calculadora', '/ecocampus/mapa', '/ecocampus/comunidad', '/ecocampus/guia-reciclaje'];
const SALIDA = path.resolve('../docs/testing/produccion/resultados/red.json');

test('registro de peticiones de red', async ({ browser, baseURL }) => {
  test.setTimeout(10 * 60 * 1000);
  const propio = new URL(baseURL).origin;
  const registros = [];
  for (const ruta of PAGINAS) {
    for (let corrida = 1; corrida <= CORRIDAS; corrida++) {
      const contexto = await browser.newContext();
      const page = await contexto.newPage();
      const inicio = new Map();
      const pendientes = [];
      page.on('request', (r) => inicio.set(r, Date.now()));
      page.on('requestfinished', (r) => {
        pendientes.push(
          (async () => {
            const resp = await r.response();
            const t = r.timing();
            const tam = await r.sizes().catch(() => ({}));
            registros.push({
              pagina: ruta, corrida, url: r.url(), tipo: r.resourceType(),
              origen: new URL(r.url()).origin === propio ? 'propio' : 'externo',
              estado: resp ? resp.status() : null, bytes: tam.responseBodySize ?? null,
              ms: t.responseEnd >= 0 ? Math.round(t.responseEnd) : Date.now() - inicio.get(r), falla: false,
            });
          })()
        );
      });
      page.on('requestfailed', (r) => {
        registros.push({
          pagina: ruta, corrida, url: r.url(), tipo: r.resourceType(),
          origen: new URL(r.url()).origin === propio ? 'propio' : 'externo',
          estado: null, bytes: null, ms: Date.now() - inicio.get(r), falla: true, error: r.failure()?.errorText,
        });
      });
      await page.goto(`${baseURL}${ruta}`, { waitUntil: 'networkidle' });
      await Promise.all(pendientes);
      await contexto.close();
    }
  }
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, JSON.stringify({ baseURL, corridas: CORRIDAS, fecha: new Date().toISOString(), registros }, null, 1));
});
