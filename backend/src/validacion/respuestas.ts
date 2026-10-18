import { z } from "zod";
import type { Participante } from "../auth/tipos";

// Las listas de opciones deben coincidir con frontend/src/config/experiment.js.
export const SEXO = ["Femenino", "Masculino", "Prefiero no decirlo"] as const;
export const CARRERA = ["Ingeniería en Software", "Ingeniería en Tecnologías de la Información"] as const;
export const SEMESTRE = ["1", "3", "5", "7"] as const;
export const SI_NO = ["Sí", "No"] as const;
export const PLANETAS = ["menos de 1", "entre 1 y 2", "más de 2"] as const;
export const MAX_TEXTO = 2000;

// Los numeros pueden llegar como texto ("21"): se convierten y deben ser enteros dentro del rango.
const entero = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
const likert = entero(1, 5);
// Texto abierto: opcional, sin espacios en los extremos, vacio => null.
const textoAbierto = z
  .preprocess((v) => (v === undefined || v === null ? "" : String(v).trim()), z.string().max(MAX_TEXTO))
  .transform((s) => (s === "" ? null : s));

// Las claves son los ids de pregunta del cuestionario (frontend/src/config/experiment.js).
export const respuestasSchema = z.object({
  "1": entero(15, 99), // edad
  S1: z.enum(SEXO),
  "2": z.enum(CARRERA),
  "3": z.enum(SEMESTRE),
  "4": z.enum(SI_NO), // conocia calculadora
  "5": z.enum(SI_NO), // completo calculo
  "8": textoAbierto, // pregunta sin respuesta
  "9": likert, "10": likert, "11": likert, "12": likert, "13": likert,
  "14": likert, "15": likert, "16": likert, "17": likert, "18": likert, // usabilidad
  "19": likert, "20": likert, "21": likert, "22": likert, // conciencia
  "23": likert, "24": likert, // intencion
  "25": textoAbierto, // habito a cambiar
  "26": textoAbierto, // mayor dificultad
  "27": textoAbierto, // comentarios
});

export const cuerpoSchema = z.object({
  respuestas: respuestasSchema,
  tiempoMin: entero(0, 1440),
  planetas: z.enum(PLANETAS),
});

export type CuerpoRespuesta = z.infer<typeof cuerpoSchema>;

/** Una fila de la tabla `respuestas` (db/schema.sql), sin id ni fecha. */
export interface FilaRespuesta {
  participante_id: string;
  correo: string | null;
  metodo_acceso: Participante["metodoAcceso"];
  edad: number;
  sexo: (typeof SEXO)[number];
  carrera: (typeof CARRERA)[number];
  semestre: (typeof SEMESTRE)[number];
  conocia_calculadora: (typeof SI_NO)[number];
  completo_calculo: (typeof SI_NO)[number];
  tiempo_min: number;
  planetas: (typeof PLANETAS)[number];
  u9: number; u10: number; u11: number; u12: number; u13: number;
  u14: number; u15: number; u16: number; u17: number; u18: number;
  c19: number; c20: number; c21: number; c22: number;
  i23: number; i24: number;
  pregunta_sin_respuesta: string | null;
  habito_cambiar: string | null;
  mayor_dificultad: string | null;
  comentarios: string | null;
}

// Orden de las columnas del INSERT. El compilador exige que toda clave sea de FilaRespuesta.
export const COLUMNAS = [
  "participante_id", "correo", "metodo_acceso", "edad", "sexo", "carrera", "semestre", "conocia_calculadora",
  "completo_calculo", "tiempo_min", "planetas",
  "u9", "u10", "u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18",
  "c19", "c20", "c21", "c22", "i23", "i24",
  "pregunta_sin_respuesta", "habito_cambiar", "mayor_dificultad", "comentarios",
] as const satisfies readonly (keyof FilaRespuesta)[];

export type ResultadoValidacion = { ok: true; datos: FilaRespuesta } | { ok: false; errores: string[] };

function aFila(c: CuerpoRespuesta, participante: Participante): FilaRespuesta {
  const r = c.respuestas;
  return {
    participante_id: participante.id,
    correo: participante?.correo ? participante.correo.trim().toLowerCase() : null,
    metodo_acceso: participante.metodoAcceso,
    edad: r["1"],
    sexo: r.S1,
    carrera: r["2"],
    semestre: r["3"],
    conocia_calculadora: r["4"],
    completo_calculo: r["5"],
    tiempo_min: c.tiempoMin,
    planetas: c.planetas,
    u9: r["9"], u10: r["10"], u11: r["11"], u12: r["12"], u13: r["13"],
    u14: r["14"], u15: r["15"], u16: r["16"], u17: r["17"], u18: r["18"],
    c19: r["19"], c20: r["20"], c21: r["21"], c22: r["22"],
    i23: r["23"], i24: r["24"],
    pregunta_sin_respuesta: r["8"],
    habito_cambiar: r["25"],
    mayor_dificultad: r["26"],
    comentarios: r["27"],
  };
}

/** Valida el cuerpo recibido y lo convierte en la fila a insertar. La identidad viene de la sesion, no del cuerpo. */
export function validarRespuesta(body: unknown, participante: Participante): ResultadoValidacion {
  const resultado = cuerpoSchema.safeParse(body);
  if (!resultado.success) {
    const errores = resultado.error.issues.map((i) => `${i.path.join(".") || "cuerpo"}: ${i.message}`);
    return { ok: false, errores };
  }
  return { ok: true, datos: aFila(resultado.data, participante) };
}
