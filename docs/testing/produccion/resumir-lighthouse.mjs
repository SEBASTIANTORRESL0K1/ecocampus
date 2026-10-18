// Resume los JSON de Lighthouse de resultados/lighthouse en una tabla Markdown (medianas de las 3 corridas).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "resultados", "lighthouse");
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const grupos = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const clave = f.replace(/-\d\.json$/, "");
  const a = j.audits;
  (grupos[clave] ??= []).push({
    perf: Math.round(j.categories.performance.score * 100),
    acc: Math.round(j.categories.accessibility.score * 100),
    bp: Math.round(j.categories["best-practices"].score * 100),
    seo: Math.round(j.categories.seo.score * 100),
    fcp: a["first-contentful-paint"].numericValue,
    lcp: a["largest-contentful-paint"].numericValue,
    tbt: a["total-blocking-time"].numericValue,
    cls: a["cumulative-layout-shift"].numericValue,
    si: a["speed-index"].numericValue,
    kb: a["total-byte-weight"].numericValue / 1024,
    reqs: a["network-requests"].details.items.length,
    version: j.lighthouseVersion,
    ua: j.environment.hostUserAgent,
  });
}
const s = (v) => (v / 1000).toFixed(2);
console.log("| Perfil | Pagina | Rendimiento | Accesibilidad | Buenas practicas | SEO | FCP (s) | LCP (s) | TBT (ms) | CLS | Speed Index (s) | Peso (KB) | Peticiones |");
console.log("| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
let ref;
for (const [k, v] of Object.entries(grupos).sort()) {
  const [perfil, pagina] = k.split("-");
  ref ??= v[0];
  const m = (c) => med(v.map((x) => x[c]));
  console.log(`| ${perfil} | ${pagina} | ${m("perf")} | ${m("acc")} | ${m("bp")} | ${m("seo")} | ${s(m("fcp"))} | ${s(m("lcp"))} | ${Math.round(m("tbt"))} | ${m("cls").toFixed(3)} | ${s(m("si"))} | ${Math.round(m("kb"))} | ${m("reqs")} |`);
}
console.error(`Lighthouse ${ref.version}; ${ref.ua}`);
