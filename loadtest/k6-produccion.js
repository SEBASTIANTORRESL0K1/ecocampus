// Prueba de carga contra el sitio desplegado (Lightsail). Ver docs/testing/produccion/README.md.
// Solo lecturas (GET): no abre sesiones ni escribe en la base de datos de produccion. No pide las fotos de los
// contenedores (1.5 MB cada una): medirian ancho de banda y gastarian la cuota de transferencia de Lightsail.
//   docker run --rm -v <repo>/loadtest:/scripts -e BASE=http://3.143.203.113 -e PERFIL=ligero grafana/k6 run \
//     --summary-export=/scripts/results/produccion-ligero.json /scripts/k6-produccion.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE = __ENV.BASE || "http://3.143.203.113";

// PERFIL=ligero (hasta 10 usuarios virtuales), medio (30), alto (60) o cien (100). Se sube de nivel solo si el anterior sale limpio.
const PERFILES = {
  ligero: [
    { duration: "20s", target: 5 },
    { duration: "40s", target: 10 },
    { duration: "20s", target: 0 },
  ],
  medio: [
    { duration: "30s", target: 15 },
    { duration: "60s", target: 30 },
    { duration: "20s", target: 0 },
  ],
  alto: [
    { duration: "30s", target: 30 },
    { duration: "60s", target: 60 },
    { duration: "20s", target: 0 },
  ],
  // cien: hasta 100 usuarios virtuales (30 s de subida, 90 s sostenidos). Correrlo con muestrear-recursos.sh en el servidor.
  cien: [
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "90s", target: 100 },
    { duration: "20s", target: 0 },
  ],
};

const ENDPOINTS = ["home", "calculadora", "mapa", "asset_js", "asset_css", "api_me"];
const umbrales = Object.fromEntries(ENDPOINTS.map((e) => [`http_req_duration{endpoint:${e}}`, ["p(95)<1500"]]));

export const options = {
  stages: PERFILES[__ENV.PERFIL || "ligero"],
  summaryTrendStats: ["min", "med", "avg", "p(90)", "p(95)", "p(99)", "max"],
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<1500"], ...umbrales },
};

const erroresPorEstado = new Counter("errores_por_estado");

function verificar(res, endpoint) {
  const ok = check(res, { [`${endpoint} 2xx`]: (r) => r.status >= 200 && r.status < 300 });
  if (!ok) erroresPorEstado.add(1, { endpoint, estado: String(res.status) });
  return ok;
}

// Los assets llevan hash en el nombre: se descubren una vez desde index.html.
export function setup() {
  const html = http.get(`${BASE}/ecocampus/`).body;
  return {
    js: (html.match(/\/ecocampus\/assets\/[^"]+\.js/) || [])[0],
    css: (html.match(/\/ecocampus\/assets\/[^"]+\.css/) || [])[0],
  };
}

export default function (datos) {
  verificar(http.get(`${BASE}/ecocampus/`, { tags: { endpoint: "home" } }), "home");
  verificar(http.get(`${BASE}/ecocampus/calculadora`, { tags: { endpoint: "calculadora" } }), "calculadora");
  verificar(http.get(`${BASE}/ecocampus/mapa`, { tags: { endpoint: "mapa" } }), "mapa");
  if (datos.js) verificar(http.get(`${BASE}${datos.js}`, { tags: { endpoint: "asset_js" } }), "asset_js");
  if (datos.css) verificar(http.get(`${BASE}${datos.css}`, { tags: { endpoint: "asset_css" } }), "asset_css");
  verificar(http.get(`${BASE}/api/me`, { tags: { endpoint: "api_me" } }), "api_me");
  sleep(1);
}
