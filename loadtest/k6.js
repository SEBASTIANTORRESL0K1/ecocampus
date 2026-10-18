// Prueba de carga de Ecocampus con k6. Ver docs/testing/produccion/README.md (las pruebas medidas estan en el servidor de produccion).
// Ejecucion (red del compose de pruebas):
//   docker run --rm --network ecocampus-loadtest_default -v <repo>/loadtest:/scripts grafana/k6 run \
//     --summary-export=/scripts/results/resumen.json /scripts/k6.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const FRONT = __ENV.BASE_FRONT || "http://frontend";
const API = __ENV.BASE_API || "http://backend:4006";

// PERFIL=carga (por defecto, hasta 100 usuarios virtuales) o PERFIL=estres (hasta 300).
const PERFILES = {
  carga: [
    { duration: "30s", target: 25 },
    { duration: "30s", target: 50 },
    { duration: "60s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 100 },
    { duration: "20s", target: 0 },
  ],
  estres: [
    { duration: "30s", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "30s", target: 300 },
    { duration: "60s", target: 300 },
    { duration: "20s", target: 0 },
  ],
};

const ENDPOINTS = ["home", "calculadora", "asset_js", "asset_css", "health", "api_me", "acceso_correo", "post_respuestas"];
// Un umbral por endpoint hace que k6 reporte la distribucion de cada uno por separado.
const umbralesPorEndpoint = Object.fromEntries(
  ENDPOINTS.map((e) => [`http_req_duration{endpoint:${e}}`, ["p(95)<1000"]])
);

export const options = {
  stages: PERFILES[__ENV.PERFIL || "carga"],
  summaryTrendStats: ["min", "med", "avg", "p(90)", "p(95)", "p(99)", "max"],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    ...umbralesPorEndpoint,
  },
};

const erroresPorEstado = new Counter("errores_por_estado");

function verificar(res, endpoint) {
  const ok = check(res, { [`${endpoint} 2xx`]: (r) => r.status >= 200 && r.status < 300 });
  if (!ok) erroresPorEstado.add(1, { endpoint, estado: String(res.status) });
  return ok;
}

// Los archivos de assets llevan hash en el nombre; se descubren una vez desde index.html.
export function setup() {
  const html = http.get(`${FRONT}/ecocampus/`).body;
  return {
    js: (html.match(/\/ecocampus\/assets\/[^"]+\.js/) || [])[0],
    css: (html.match(/\/ecocampus\/assets\/[^"]+\.css/) || [])[0],
  };
}

const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function cuerpoRespuesta() {
  const respuestas = {
    1: String(entero(17, 30)),
    S1: ["Femenino", "Masculino", "Prefiero no decirlo"][entero(0, 2)],
    2: "Ingeniería en Software",
    3: ["1", "3", "5", "7"][entero(0, 3)],
    4: "Sí",
    5: "Sí",
    8: "",
    25: "carga",
    26: "",
    27: "",
  };
  for (let id = 9; id <= 24; id++) respuestas[id] = entero(1, 5);
  return JSON.stringify({ respuestas, tiempoMin: entero(2, 15), planetas: "entre 1 y 2" });
}

export default function (datos) {
  // 1) Carga de la aplicacion: HTML, ruta de la calculadora y sus assets
  verificar(http.get(`${FRONT}/ecocampus/`, { tags: { endpoint: "home" } }), "home");
  verificar(http.get(`${FRONT}/ecocampus/calculadora`, { tags: { endpoint: "calculadora" } }), "calculadora");
  if (datos.js) verificar(http.get(`${FRONT}${datos.js}`, { tags: { endpoint: "asset_js" } }), "asset_js");
  if (datos.css) verificar(http.get(`${FRONT}${datos.css}`, { tags: { endpoint: "asset_css" } }), "asset_css");

  // 2) API de lectura
  verificar(http.get(`${API}/health`, { tags: { endpoint: "health" } }), "health");
  verificar(http.get(`${API}/api/me`, { tags: { endpoint: "api_me" } }), "api_me");

  sleep(1);

  // 3) 20% de las iteraciones terminan enviando el cuestionario (escritura en MySQL). No hay envios anonimos:
  //    antes se abre sesion con un correo unico (acceso por correo, REQUIERE_LOGIN=false); la cookie queda en el VU.
  if (Math.random() < 0.2) {
    const correo = `k6-${__VU}-${__ITER}-${Date.now()}@ucol.mx`;
    const acceso = http.post(`${API}/api/acceso/correo`, JSON.stringify({ correo }), {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "acceso_correo" },
    });
    if (!verificar(acceso, "acceso_correo")) return;
    const res = http.post(`${API}/api/respuestas`, cuerpoRespuesta(), {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "post_respuestas" },
    });
    verificar(res, "post_respuestas");
  }

  sleep(1);
}
