// Valida las coordenadas de los contenedores de reciclaje (frontend/src/features/mapa/puntosReciclaje.js):
// rango, distancia al centro del mapa, duplicados, vecino mas cercano y que exista la foto de cada punto.
//   node docs/testing/produccion/validar-georreferencia.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { puntosReciclaje } = await import(pathToFileURL(path.join(raiz, "frontend/src/features/mapa/puntosReciclaje.js")).href);

const CENTRO = [19.249437, -103.698893]; // centro del mapa (Mapa.jsx)
const R = 6371000;
const rad = (g) => (g * Math.PI) / 180;
// Haversine: distancia en metros entre dos coordenadas
function metros([la1, lo1], [la2, lo2]) {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const filas = puntosReciclaje.map((p) => {
  const [lat, lng] = p.coordenadas;
  const vecinos = puntosReciclaje.filter((q) => q.id !== p.id).map((q) => metros(p.coordenadas, q.coordenadas));
  const decimales = String(lat).split(".")[1]?.length ?? 0;
  return {
    id: p.id,
    nombre: p.nombre.trim().slice(0, 48),
    lat,
    lng,
    alCentro: Math.round(metros(CENTRO, p.coordenadas)),
    vecino: Math.min(...vecinos).toFixed(1),
    precision: decimales >= 6 ? `~${(111000 * 10 ** -Math.min(decimales, 6)).toFixed(1)} m (${decimales} dec.)` : `${decimales} dec.`,
    foto: fs.existsSync(path.join(raiz, "frontend/public", p.imagen)) ? "si" : "NO",
  };
});

console.log("| ID | Punto | Latitud | Longitud | Al centro (m) | Vecino mas cercano (m) | Foto |");
console.log("| ---: | :--- | ---: | ---: | ---: | ---: | :--- |");
for (const f of filas) console.log(`| ${f.id} | ${f.nombre} | ${f.lat} | ${f.lng} | ${f.alCentro} | ${f.vecino} | ${f.foto} |`);

const lats = filas.map((f) => f.lat);
const lngs = filas.map((f) => f.lng);
const ancho = metros([Math.min(...lats), Math.min(...lngs)], [Math.min(...lats), Math.max(...lngs)]);
const alto = metros([Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.min(...lngs)]);
const duplicados = filas.filter((f) => Number(f.vecino) < 1).length;
const sinFoto = filas.filter((f) => f.foto !== "si").length;
console.log("\nResumen:");
console.log(`- Puntos: ${filas.length}`);
console.log(`- Caja envolvente: ${Math.round(ancho)} m (este-oeste) x ${Math.round(alto)} m (norte-sur)`);
console.log(`- Distancia al centro del mapa: maxima ${Math.max(...filas.map((f) => f.alCentro))} m`);
console.log(`- Distancia minima entre dos puntos: ${Math.min(...filas.map((f) => Number(f.vecino)))} m; puntos a menos de 1 m de otro: ${duplicados}`);
console.log(`- Latitudes validas (-90..90) y longitudes (-180..180): ${filas.every((f) => Math.abs(f.lat) <= 90 && Math.abs(f.lng) <= 180) ? "si" : "NO"}`);
console.log(`- Puntos sin fotografia en frontend/public: ${sinFoto}`);
