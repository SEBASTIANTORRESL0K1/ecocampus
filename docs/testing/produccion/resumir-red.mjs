// Resume resultados/red.json (frontend/e2e-produccion/red.spec.js) en tablas Markdown.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const datos = JSON.parse(fs.readFileSync(path.join(dir, "resultados", "red.json"), "utf8"));
const r = datos.registros;

const pct = (a, p) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)] : 0;
};
const prom = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
const kb = (b) => (b / 1024).toFixed(1);

console.log(`Origen: ${datos.baseURL}; ${datos.corridas} corridas en frio por pagina; ${datos.fecha}.\n`);

console.log("## Por pagina (promedio de las corridas)\n");
console.log("| Pagina | Peticiones | Propias | Externas | Fallidas | HTTP 4xx/5xx | Transferido (KB) |");
console.log("| :--- | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const pagina of [...new Set(r.map((x) => x.pagina))]) {
  const g = r.filter((x) => x.pagina === pagina);
  const n = datos.corridas;
  const f = (fn) => (g.filter(fn).length / n).toFixed(1);
  console.log(
    `| ${pagina} | ${(g.length / n).toFixed(1)} | ${f((x) => x.origen === "propio")} | ${f((x) => x.origen === "externo")} | ${f((x) => x.falla)} | ${f((x) => x.estado >= 400)} | ${kb(g.reduce((s, x) => s + (x.bytes || 0), 0) / n)} |`
  );
}

console.log("\n## Por tipo de recurso (todas las paginas)\n");
console.log("| Tipo | Peticiones | Media (ms) | p95 (ms) | Maximo (ms) | Fallos | Porcentaje de fallos |");
console.log("| :--- | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const tipo of [...new Set(r.map((x) => x.tipo))].sort()) {
  const g = r.filter((x) => x.tipo === tipo);
  const ms = g.map((x) => x.ms);
  const fallos = g.filter((x) => x.falla || x.estado >= 400).length;
  console.log(`| ${tipo} | ${g.length} | ${prom(ms)} | ${pct(ms, 95)} | ${Math.max(...ms)} | ${fallos} | ${((fallos / g.length) * 100).toFixed(1)} % |`);
}

console.log("\n## Por origen\n");
console.log("| Origen | Peticiones | Media (ms) | p95 (ms) | Fallos |");
console.log("| :--- | ---: | ---: | ---: | ---: |");
for (const origen of ["propio", "externo"]) {
  const g = r.filter((x) => x.origen === origen);
  const ms = g.map((x) => x.ms);
  console.log(`| ${origen} | ${g.length} | ${prom(ms)} | ${pct(ms, 95)} | ${g.filter((x) => x.falla || x.estado >= 400).length} |`);
}

console.log("\n## Tiles de OpenStreetMap (pagina del mapa)\n");
const tiles = r.filter((x) => x.url.includes("tile.openstreetmap.org"));
const ms = tiles.map((x) => x.ms);
console.log(`Peticiones: ${tiles.length}; media ${prom(ms)} ms; p95 ${pct(ms, 95)} ms; fallos ${tiles.filter((x) => x.falla || x.estado >= 400).length}.`);

const mal = r.filter((x) => x.falla || x.estado >= 400);
console.log(`\n## Peticiones con falla o HTTP 4xx/5xx: ${mal.length}\n`);
for (const x of mal.slice(0, 15)) console.log(`- ${x.pagina} ${x.url} -> ${x.estado ?? x.error}`);
