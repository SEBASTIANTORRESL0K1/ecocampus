// Persistencia del progreso de la calculadora en localStorage.
// Se guarda un solo objeto JSON versionado:
//   { version: 1, respuestas, pasoActual, verResultado }
// El resultado no se guarda: se recalcula con calcularHuellaEcologica(respuestas).
// Todo acceso a localStorage va dentro de try/catch para que el modo privado,
// la cuota llena o el almacenamiento deshabilitado no rompan la página.

export const CLAVE_PROGRESO = "ecocampus:calculadora:v1";
export const VERSION_PROGRESO = 1;

export const RESPUESTAS_INICIALES = { habitantesHogar: 1 };

const esObjetoPlano = (valor) =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

// Indica si hay al menos una respuesta real (habitantesHogar = 1 es el valor por defecto).
export function tieneRespuestas(respuestas) {
  if (!esObjetoPlano(respuestas)) return false;
  return Object.keys(respuestas).some(
    (clave) => clave !== "habitantesHogar" || Number(respuestas.habitantesHogar) !== 1
  );
}

// Valida y normaliza los datos leídos. Devuelve null si no son utilizables.
export function normalizarProgreso(datos, totalPasos) {
  if (!esObjetoPlano(datos) || datos.version !== VERSION_PROGRESO) return null;
  if (!esObjetoPlano(datos.respuestas)) return null;
  if (!Number.isInteger(datos.pasoActual)) return null;

  const ultimoPaso = Math.max(0, totalPasos - 1);
  const pasoActual = Math.min(Math.max(datos.pasoActual, 0), ultimoPaso);

  const habitantes = Number(datos.respuestas.habitantesHogar);
  const respuestas = {
    ...datos.respuestas,
    habitantesHogar: Number.isFinite(habitantes) && habitantes >= 1 ? habitantes : 1,
  };

  return { respuestas, pasoActual, verResultado: datos.verResultado === true };
}

// Lee el progreso guardado; null si no hay, si está corrupto o si falla el almacenamiento.
export function cargarProgreso(totalPasos) {
  try {
    const texto = window.localStorage.getItem(CLAVE_PROGRESO);
    if (!texto) return null;
    return normalizarProgreso(JSON.parse(texto), totalPasos);
  } catch {
    return null;
  }
}

// Guarda el progreso. Devuelve false si el almacenamiento no está disponible.
export function guardarProgreso({ respuestas, pasoActual, verResultado }) {
  try {
    const datos = { version: VERSION_PROGRESO, respuestas, pasoActual, verResultado };
    window.localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}

export function borrarProgreso() {
  try {
    window.localStorage.removeItem(CLAVE_PROGRESO);
    return true;
  } catch {
    return false;
  }
}
