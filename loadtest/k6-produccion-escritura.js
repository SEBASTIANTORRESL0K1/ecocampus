// Prueba de ESCRITURA contra el sitio desplegado (Lightsail): cada iteracion abre una sesion con un correo unico y
// envia el cuestionario. Escribe filas en `respuestas` y sesiones en `sessions` de la base de produccion.
// Los correos empiezan con "k6-carga-" para borrarlos despues:
//   DELETE FROM respuestas WHERE correo LIKE 'k6-carga-%';   (y las sesiones: DELETE FROM sessions;)
//   docker run --rm -v <repo>/loadtest:/scripts -e BASE=http://3.143.203.113 -e PERFIL=ligero grafana/k6 run \
//     --summary-export=/scripts/results/produccion-escritura-ligero.json /scripts/k6-produccion-escritura.js
import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE = __ENV.BASE || "http://3.143.203.113";

// ligero: hasta 10 usuarios virtuales; medio: hasta 30. Cada usuario escribe una respuesta por iteracion (~1.5 s).
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
};

const ENDPOINTS = ["acceso_correo", "post_respuestas"];
const umbrales = Object.fromEntries(ENDPOINTS.map((e) => [`http_req_duration{endpoint:${e}}`, ["p(95)<1500"]]));

export const options = {
  stages: PERFILES[__ENV.PERFIL || "ligero"],
  summaryTrendStats: ["min", "med", "avg", "p(90)", "p(95)", "p(99)", "max"],
  thresholds: { http_req_failed: ["rate<0.01"], ...umbrales },
};

const erroresPorEstado = new Counter("errores_por_estado");
const guardadas = new Counter("respuestas_guardadas");

function verificar(res, endpoint, esperado) {
  const ok = check(res, { [`${endpoint} ${esperado}`]: (r) => r.status === esperado });
  if (!ok) erroresPorEstado.add(1, { endpoint, estado: String(res.status) });
  return ok;
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

export default function () {
  const correo = `k6-carga-${__VU}-${__ITER}-${Date.now()}@ucol.mx`;
  const encabezados = { headers: { "Content-Type": "application/json" } };

  const acceso = http.post(`${BASE}/api/acceso/correo`, JSON.stringify({ correo }), { ...encabezados, tags: { endpoint: "acceso_correo" } });
  if (!verificar(acceso, "acceso_correo", 200)) return;

  const envio = http.post(`${BASE}/api/respuestas`, cuerpoRespuesta(), { ...encabezados, tags: { endpoint: "post_respuestas" } });
  if (verificar(envio, "post_respuestas", 201)) guardadas.add(1);

  sleep(1);
}
