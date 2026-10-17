// Validacion de las respuestas del experimento. Las listas de opciones deben coincidir con
// frontend/src/config/experiment.js.
const SEXO = ["Femenino", "Masculino", "Prefiero no decirlo"];
const CARRERA = ["Ingeniería en Software", "Ingeniería en Tecnologías de la Información"];
const SEMESTRE = ["1", "3", "5", "7"];
const SI_NO = ["Sí", "No"];
const PLANETAS = ["menos de 1", "entre 1 y 2", "más de 2"];

const IDS_LIKERT = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const ABIERTAS = { 8: "pregunta_sin_respuesta", 25: "habito_cambiar", 26: "mayor_dificultad", 27: "comentarios" };
const MAX_TEXTO = 2000;

const columnaLikert = (id) => (id <= 18 ? `u${id}` : id <= 22 ? `c${id}` : `i${id}`);

const COLUMNAS = [
  "participante_id", "correo", "edad", "sexo", "carrera", "semestre", "conocia_calculadora",
  "completo_calculo", "tiempo_min", "planetas",
  ...IDS_LIKERT.map(columnaLikert),
  ...Object.values(ABIERTAS),
];

function validarRespuesta(body, participante) {
  const errores = [];
  const r = body && typeof body.respuestas === "object" && body.respuestas ? body.respuestas : null;
  if (!r) return { ok: false, errores: ["respuestas faltantes"] };

  const elegir = (id, opciones, nombre) => {
    if (!opciones.includes(r[id])) errores.push(`${nombre} invalido`);
    return r[id];
  };

  const edad = Number(r[1]);
  if (!Number.isInteger(edad) || edad < 15 || edad > 99) errores.push("edad invalida");

  const tiempo = Number(body.tiempoMin);
  if (!Number.isInteger(tiempo) || tiempo < 0 || tiempo > 1440) errores.push("tiempo invalido");

  const datos = {
    participante_id: participante?.id ?? null,
    correo: participante?.correo ? String(participante.correo).trim().toLowerCase() : null,
    edad,
    sexo: elegir("S1", SEXO, "sexo"),
    carrera: elegir(2, CARRERA, "carrera"),
    semestre: elegir(3, SEMESTRE, "semestre"),
    conocia_calculadora: elegir(4, SI_NO, "conocia_calculadora"),
    completo_calculo: elegir(5, SI_NO, "completo_calculo"),
    tiempo_min: tiempo,
    planetas: body.planetas,
  };
  if (!PLANETAS.includes(body.planetas)) errores.push("planetas invalido");

  for (const id of IDS_LIKERT) {
    const valor = Number(r[id]);
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) errores.push(`pregunta ${id} fuera de 1 a 5`);
    datos[columnaLikert(id)] = valor;
  }

  for (const [id, columna] of Object.entries(ABIERTAS)) {
    const texto = r[id] === undefined || r[id] === null ? "" : String(r[id]).trim();
    if (texto.length > MAX_TEXTO) errores.push(`pregunta ${id} demasiado larga`);
    datos[columna] = texto === "" ? null : texto;
  }

  return errores.length ? { ok: false, errores } : { ok: true, datos };
}

module.exports = { validarRespuesta, COLUMNAS };
