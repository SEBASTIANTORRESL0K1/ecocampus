// Dibuja graficas SVG de CPU y memoria del servidor a partir de resultados/recursos.csv
// (generado por muestrear-recursos.sh mientras corria la carga). Sin dependencias.
//   node docs/testing/produccion/graficar-recursos.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "resultados");
const [cabecera, ...lineas] = fs.readFileSync(path.join(dir, "recursos.csv"), "utf8").trim().split("\n");
const columnas = cabecera.split(",");
const filas = lineas.map((l) => Object.fromEntries(l.split(",").map((v, i) => [columnas[i], Number(v)])));
const tMax = Math.max(...filas.map((f) => f.tiempo_s));

// Fases segun el patron de CPU (el muestreo no guarda la hora): reposo, lectura con 100 usuarios, escritura con 100 usuarios.
const FASES = [
  { nombre: "reposo", desde: 0, hasta: 100, color: "#f1f5f9" },
  { nombre: "lectura, 100 usuarios", desde: 100, hasta: 275, color: "#dcfce7" },
  { nombre: "escritura, 100 usuarios", desde: 275, hasta: tMax, color: "#fef9c3" },
];

const W = 900, H = 360, M = { i: 60, d: 20, s: 40, b: 70 };
const x = (t) => M.i + ((W - M.i - M.d) * t) / tMax;

function grafica({ titulo, etiquetaY, maximoY, series, nombreArchivo }) {
  const y = (v) => H - M.b - ((H - M.s - M.b) * v) / maximoY;
  const partes = [];
  partes.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="system-ui, sans-serif" font-size="12">`);
  partes.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  partes.push(`<text x="${W / 2}" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#111827">${titulo}</text>`);
  for (const f of FASES) {
    partes.push(`<rect x="${x(f.desde)}" y="${M.s}" width="${x(f.hasta) - x(f.desde)}" height="${H - M.s - M.b}" fill="${f.color}"/>`);
    partes.push(`<text x="${(x(f.desde) + x(f.hasta)) / 2}" y="${M.s + 14}" text-anchor="middle" fill="#475569">${f.nombre}</text>`);
  }
  for (let i = 0; i <= 4; i++) {
    const v = (maximoY * i) / 4;
    partes.push(`<line x1="${M.i}" x2="${W - M.d}" y1="${y(v)}" y2="${y(v)}" stroke="#e5e7eb"/>`);
    partes.push(`<text x="${M.i - 6}" y="${y(v) + 4}" text-anchor="end" fill="#475569">${Math.round(v)}</text>`);
  }
  for (let t = 0; t <= tMax; t += 60) {
    partes.push(`<text x="${x(t)}" y="${H - M.b + 16}" text-anchor="middle" fill="#475569">${t} s</text>`);
  }
  partes.push(`<text x="14" y="${H / 2}" transform="rotate(-90 14 ${H / 2})" text-anchor="middle" fill="#475569">${etiquetaY}</text>`);
  partes.push(`<text x="${W / 2}" y="${H - 8}" text-anchor="middle" fill="#475569">Tiempo desde el inicio del muestreo</text>`);
  series.forEach((s, k) => {
    const puntos = filas.map((f) => `${x(f.tiempo_s).toFixed(1)},${y(Math.min(f[s.columna], maximoY)).toFixed(1)}`).join(" ");
    partes.push(`<polyline fill="none" stroke="${s.color}" stroke-width="1.8" points="${puntos}"/>`);
    partes.push(`<rect x="${M.i + 8 + k * 170}" y="${H - 30}" width="12" height="3" fill="${s.color}"/>`);
    partes.push(`<text x="${M.i + 24 + k * 170}" y="${H - 25}" fill="#111827">${s.nombre}</text>`);
  });
  partes.push("</svg>");
  fs.writeFileSync(path.join(dir, nombreArchivo), partes.join("\n"));
  console.log("escrito", nombreArchivo);
}

grafica({
  titulo: "CPU del servidor (2 vCPU) durante la carga",
  etiquetaY: "% de la CPU total",
  maximoY: 100,
  nombreArchivo: "recursos-cpu-servidor.svg",
  series: [
    { columna: "cpu_host_pct", nombre: "CPU en uso", color: "#2563eb" },
    { columna: "robo_pct", nombre: "CPU robada (hipervisor)", color: "#dc2626" },
  ],
});

grafica({
  titulo: "CPU por contenedor (100 % = 1 vCPU)",
  etiquetaY: "% de un vCPU",
  maximoY: 100,
  nombreArchivo: "recursos-cpu-contenedores.svg",
  series: [
    { columna: "db_cpu_pct", nombre: "MySQL", color: "#7c3aed" },
    { columna: "backend_cpu_pct", nombre: "Backend", color: "#16a34a" },
    { columna: "proxy_cpu_pct", nombre: "Proxy (Caddy)", color: "#ea580c" },
    { columna: "frontend_cpu_pct", nombre: "Frontend (nginx)", color: "#64748b" },
  ],
});

grafica({
  titulo: "Memoria del servidor (1906 MB en total, sin swap)",
  etiquetaY: "MB",
  maximoY: 2000,
  nombreArchivo: "recursos-memoria.svg",
  series: [
    { columna: "mem_usada_mb", nombre: "Usada", color: "#dc2626" },
    { columna: "mem_disp_mb", nombre: "Disponible", color: "#16a34a" },
    { columna: "db_mem_mb", nombre: "MySQL", color: "#7c3aed" },
  ],
});
