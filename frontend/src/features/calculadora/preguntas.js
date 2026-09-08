/**
 * Cuestionario para calcular la Huella Ecológica de estudiantes universitarios mexicanos
 * Fuente: Ibarra-Cisneros, J.M. & Monroy-Ata, A. (2014).
 * TIP Revista Especializada en Ciencias Químico-Biológicas, 17(2):147-154.
 *
 * Estructura: objeto agrupado por sección. Cada pregunta tiene:
 *  - id: número de pregunta según el artículo original (1-30)
 *  - tipo: "unica" (radio/select, un solo valor) | "multiple" (checkbox, se suman los valores marcados)
 *  - pregunta: texto de la pregunta
 *  - nota: aclaración de la pregunta (si aplica)
 *  - opciones: [{ label, valor }]
 *
 * Notas de cálculo:
 *  - Preguntas 21, 22 y 23 se suman entre sí y el resultado se divide entre
 *    el número de habitantes del hogar (ver `energia.notaCalculo21_22_23`).
 *  - Pregunta 24 (celular): el valor se multiplica por la cantidad de dispositivos.
 *  - Pregunta 19 (auto propio): si la respuesta es "Sí" (12,000), la pregunta 20
 *    (km diarios en auto/taxi) normalmente se pondera aparte; el artículo no
 *    publica la tabla de valores de la pregunta 20 en el extracto disponible,
 *    revisar la página 152 del PDF original si necesitas esos valores exactos.
 *  - Infraestructura: valor fijo de 6,400 que se suma al total general.
 *  - Interpretación final (en puntos, sumando TODAS las secciones + infraestructura):
 *      < 16,000        -> huella < 1.6 hag (dentro del límite del planeta)
 *      16,000 - 32,000 -> huella 1.6 - 3.2 hag (por arriba del umbral)
 *      > 32,000        -> huella > 3.2 hag (insostenible)
 */

const preguntasHuellaEcologica = {

  alimentos: {
    titulo: "Sección A: Alimentos",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        pregunta: "¿Cuántas raciones de fruta consumes a la semana?",
        nota: "Considera una ración de fruta mixta de 200 g",
        opciones: [
          { label: "Menos de una ración a la semana", valor: 0 },
          { label: "1 a 2 raciones a la semana", valor: 2 },
          { label: "2 a 4 raciones a la semana", valor: 4 },
          { label: "4 a 6 raciones a la semana", valor: 6 },
          { label: "6 a 8 raciones a la semana", valor: 9 },
        ],
      },
      {
        id: 2,
        tipo: "unica",
        pregunta: "¿Cuántas raciones de verdura consumes a la semana?",
        nota: "Considera una ración de verdura mixta de 200 g",
        opciones: [
          { label: "Menos de una ración a la semana", valor: 0 },
          { label: "1 a 2 raciones a la semana", valor: 1 },
          { label: "2 a 4 raciones a la semana", valor: 2 },
          { label: "4 a 6 raciones a la semana", valor: 4 },
          { label: "6 a 8 raciones a la semana", valor: 6 },
        ],
      },
      {
        id: 3,
        tipo: "unica",
        pregunta: "¿Cuántas piezas de pan (dulce y/o salado) consumes a la semana?",
        opciones: [
          { label: "1 a 2 piezas a la semana", valor: 27 },
          { label: "2 a 4 piezas a la semana", valor: 55 },
          { label: "4 a 6 piezas a la semana", valor: 93 },
          { label: "6 a 8 piezas a la semana", valor: 131 },
          { label: "8 a 10 piezas a la semana", valor: 170 },
        ],
      },
      {
        id: 4,
        tipo: "unica",
        pregunta: "¿Qué cantidad de tortilla consumes en promedio al día (piezas)?",
        opciones: [
          { label: "1 a 2 piezas al día", valor: 91 },
          { label: "2 a 4 piezas al día", valor: 182 },
          { label: "4 a 6 piezas al día", valor: 295 },
          { label: "6 a 8 piezas al día", valor: 422 },
          { label: "8 a 10 piezas al día", valor: 542 },
        ],
      },
      {
        id: 5,
        tipo: "unica",
        pregunta: "¿Cuántas veces a la semana consumes carne de res?",
        opciones: [
          { label: "1 a 2 veces por semana", valor: 57 },
          { label: "2 a 4 veces por semana", valor: 121 },
          { label: "4 a 6 veces por semana", valor: 190 },
          { label: "6 a 8 veces por semana", valor: 267 },
          { label: "8 a 10 veces por semana", valor: 343 },
        ],
      },
      {
        id: 6,
        tipo: "unica",
        pregunta: "¿Cuántas veces a la semana consumes carne de pollo?",
        opciones: [
          { label: "1 a 2 veces por semana", valor: 234 },
          { label: "2 a 4 veces por semana", valor: 470 },
          { label: "4 a 6 veces por semana", valor: 789 },
          { label: "6 a 8 veces por semana", valor: 1107 },
        ],
      },
      {
        id: 7,
        tipo: "unica",
        pregunta: "¿Cuántas veces a la semana consumes carne de cerdo?",
        opciones: [
          { label: "1 a 2 veces por semana", valor: 12 },
          { label: "2 a 4 veces por semana", valor: 25 },
          { label: "4 a 6 veces por semana", valor: 41 },
          { label: "6 a 8 veces por semana", valor: 140 },
          { label: "8 a 10 veces por semana", valor: 155 },
        ],
      },
      {
        id: 8,
        tipo: "unica",
        pregunta: "¿Cuántas veces al mes consumes pescado y/o mariscos?",
        opciones: [
          { label: "1 a 2 veces al mes", valor: 217 },
          { label: "2 a 4 veces al mes", valor: 425 },
          { label: "4 a 6 veces al mes", valor: 711 },
          { label: "6 a 8 veces al mes", valor: 998 },
          { label: "8 a 10 veces al mes", valor: 1298 },
        ],
      },
      {
        id: 9,
        tipo: "unica",
        pregunta: "¿Cuántas veces a la semana consumes yoghurt?",
        nota: "Considera una ración en presentación individual de vaso o para beber",
        opciones: [
          { label: "1 a 2 veces a la semana", valor: 104 },
          { label: "3 a 4 veces a la semana", valor: 243 },
          { label: "5 a 6 veces a la semana", valor: 382 },
          { label: "7 a 8 veces a la semana", valor: 521 },
          { label: "9 a 10 veces a la semana", valor: 660 },
        ],
      },
      {
        id: 10,
        tipo: "unica",
        pregunta: "¿Cuántas veces a la semana tomas leche?",
        nota: "Considera una ración de 250 mL",
        opciones: [
          { label: "1 a 2 veces a la semana", valor: 130 },
          { label: "3 a 4 veces a la semana", valor: 304 },
          { label: "5 a 6 veces a la semana", valor: 478 },
          { label: "7 a 8 veces a la semana", valor: 651 },
          { label: "9 a 10 veces a la semana", valor: 825 },
        ],
      },
      {
        id: 11,
        tipo: "multiple",
        pregunta:
          "¿Cuál de los siguientes alimentos consumes durante una semana promedio? Indica cuántas veces por semana consumes cada uno; el valor de cada ítem se multiplica por el número de veces marcado.",
        nota: "El valor de cada opción es 'puntos por vez a la semana'. Total pregunta 11 = suma de (veces × valor) de cada ítem.",
        opciones: [
          { label: "Bolsita de cacahuates de 60 g (por vez/semana)", valor: 50 },
          { label: "Bolsa de papas fritas o frituras (por vez/semana)", valor: 22 },
          {
            label:
              "Quesadillas, gorditas, tlacoyo, tortas (pierna, suadero, chicharrón, al pastor) (por vez/semana)",
            valor: 347,
          },
          { label: "Tacos, orden de 3 (suadero, pastor o longaniza) (por vez/semana)", valor: 240 },
          { label: "Jugo de naranja natural (por vez/semana)", valor: 242 },
        ],
      },
      {
        id: 12,
        tipo: "unica",
        pregunta: "¿Cuántas veces a la semana tomas refresco?",
        nota: "Considera como base una lata de refresco de 355 mL. Si no consumes refresco, omite esta pregunta.",
        opciones: [
          { label: "1 a 2 veces a la semana", valor: 1 },
          { label: "2 a 4 veces a la semana", valor: 2 },
          { label: "4 a 6 veces a la semana", valor: 4 },
          { label: "6 a 8 veces a la semana", valor: 5 },
          { label: "8 a 10 veces a la semana", valor: 7 },
        ],
      },
      {
        id: 13,
        tipo: "unica",
        pregunta: "¿Cuántos cigarrillos fumas al día?",
        nota: "Si no fumas, omite esta pregunta",
        opciones: [
          { label: "1 al día", valor: 3 },
          { label: "Entre 2 y 5", valor: 10 },
          { label: "Entre 6 y 10", valor: 24 },
          { label: "Entre 11 y 15", valor: 37 },
          { label: "Entre 16 y 20", valor: 52 },
        ],
      },
      {
        id: 14,
        tipo: "unica",
        pregunta: "¿En cuánto estimas tu consumo a la semana de cerveza?",
        nota: "Toma como base una lata de cerveza de 355 mL. Si no consumes, pasa a la siguiente pregunta.",
        opciones: [
          { label: "1 a 2 cervezas a la semana", valor: 40 },
          { label: "2 a 4 cervezas a la semana", valor: 79 },
          { label: "4 a 6 cervezas a la semana", valor: 131 },
          { label: "6 a 8 cervezas a la semana", valor: 186 },
          { label: "8 a 10 cervezas a la semana", valor: 239 },
        ],
      },
      {
        id: 15,
        tipo: "unica",
        pregunta: "¿Cuántos litros (L) de agua embotellada consumes aproximadamente a la semana?",
        opciones: [
          { label: "1 a 2 L", valor: 4 },
          { label: "3 a 4 L", valor: 10 },
          { label: "5 a 6 L", valor: 14 },
          { label: "7 a 8 L", valor: 20 },
          { label: "9 a 10 L", valor: 25 },
        ],
      },
    ],
  },

  transporte: {
    titulo: "Sección B: Transporte",
    nota: "Considera un día hábil promedio",
    preguntas: [
      {
        id: 16,
        tipo: "unica",
        pregunta: "¿Cuántos kilómetros recorres diariamente en el Sistema Colectivo Metro?",
        nota: "Considera recorridos de ida y vuelta",
        opciones: [
          { label: "2-6 kilómetros diarios", valor: 68 },
          { label: "7-12 kilómetros diarios", valor: 160 },
          { label: "13-18 kilómetros diarios", valor: 260 },
          { label: "19-24 kilómetros diarios", valor: 360 },
          { label: "25-30 kilómetros diarios", valor: 470 },
        ],
      },
      {
        id: 17,
        tipo: "unica",
        pregunta: "¿Cuántos kilómetros recorres diariamente en transporte colectivo (combi, microbús o autobús)?",
        nota: "Considera recorridos de ida y vuelta",
        opciones: [
          { label: "5-7 kilómetros diarios", valor: 250 },
          { label: "8-10 kilómetros diarios", valor: 380 },
          { label: "11-13 kilómetros diarios", valor: 510 },
          { label: "14-16 kilómetros diarios", valor: 630 },
          { label: "17-20 kilómetros diarios", valor: 780 },
        ],
      },
      {
        id: 18,
        tipo: "unica",
        pregunta: "¿Cuántas horas, en promedio, viajas en avión al año?",
        nota:
          "Considera recorridos de ida y vuelta. Si no utilizas este transporte, pasa a la siguiente pregunta.",
        opciones: [
          { label: "Menos de 2 horas (ej. Méx-Acapulco-Méx)", valor: 1100 },
          { label: "Entre 2 y 7 horas (ej. Méx-Los Ángeles-Méx)", valor: 4400 },
          { label: "Entre 7 y 15 horas (ej. 2 viajes Méx-EUA-Méx)", valor: 8800 },
          { label: "Entre 15 y 25 horas (ej. Méx-Europa-Méx)", valor: 11100 },
          { label: "Más de 25 horas (varios viajes largos y/o más de 5 cortos)", valor: 22200 },
        ],
      },
      {
        id: 19,
        tipo: "unica",
        pregunta: "¿Cuentas con auto propio?",
        opciones: [
          { label: "Sí", valor: 12000 },
          { label: "No", valor: 0 },
        ],
      },
      {
        id: 20,
        tipo: "unica",
        pregunta: "¿Qué distancia recorres (km) en auto propio o taxi, diariamente?",
        nota:
          "Considera recorridos de ida y vuelta. Si no usas este transporte, omite la respuesta y pasa a la siguiente pregunta.",
        opciones: [
          { label: "2-6 kilómetros diarios", valor: 520 },
          { label: "7-12 kilómetros diarios", valor: 1200 },
          { label: "13-18 kilómetros diarios", valor: 2000 },
          { label: "19-24 kilómetros diarios", valor: 2800 },
          { label: "25-30 kilómetros diarios", valor: 3500 },
        ],
      },
    ],
  },

  energia: {
    titulo: "Sección C: Energía",
    notaCalculo21_22_23:
      "Las preguntas 21, 22 y 23 se suman entre sí y el resultado se divide entre el número de habitantes del hogar. Ese cociente es el valor final que se usa para esas tres preguntas juntas.",
    preguntas: [
      {
        id: 21,
        tipo: "multiple",
        pregunta:
          "De los siguientes aparatos electrodomésticos, si cuentas con ellos suma la cantidad indicada; de lo contrario no sumes nada.",
        opciones: [
          { label: "Plancha", valor: 10 },
          { label: "Licuadora", valor: 11 },
          { label: "Extractor de jugos", valor: 6 },
          { label: "Microondas", valor: 56 },
          { label: "Refrigerador", valor: 4400 },
          { label: "Lavadora", valor: 35 },
        ],
      },
      {
        id: 22,
        tipo: "unica",
        pregunta: "¿Cuántos focos convencionales hay en tu casa?",
        opciones: [
          { label: "1-3", valor: 190 },
          { label: "4-6", valor: 480 },
          { label: "7-9", valor: 780 },
          { label: "10-12", valor: 1000 },
          { label: "13-15", valor: 1300 },
        ],
      },
      {
        id: 23,
        tipo: "unica",
        pregunta: "¿Cuántos focos ahorradores hay en tu casa?",
        opciones: [
          { label: "1-3", valor: 78 },
          { label: "4-6", valor: 190 },
          { label: "7-9", valor: 310 },
          { label: "10-12", valor: 430 },
          { label: "13-15", valor: 540 },
        ],
      },
      {
        id: 24,
        tipo: "unica",
        pregunta: "¿Cuentas con teléfono celular propio?",
        nota: "Si tienes más de 1, multiplica el valor por el número de dispositivos.",
        opciones: [
          { label: "Sí (valor por dispositivo)", valor: 76 },
          { label: "No", valor: 0 },
        ],
      },
      {
        id: 25,
        tipo: "multiple",
        pregunta:
          "De los siguientes aparatos electrónicos, ¿cuánto tiempo a la semana los mantienes encendidos? Selecciona el rango correspondiente para cada aparato; los valores se suman.",
        opciones: [
          // Televisor
          { label: "Televisor: 7 hrs o menos a la semana", valor: 28 },
          { label: "Televisor: 8 a 12 hrs a la semana", valor: 70 },
          { label: "Televisor: 13 a 17 hrs a la semana", valor: 100 },
          { label: "Televisor: 18 a 22 hrs a la semana", valor: 140 },
          { label: "Televisor: 23 a 28 hrs a la semana", valor: 170 },
          // Computadora
          { label: "Computadora: 15 a 20 hrs a la semana", valor: 120 },
          { label: "Computadora: 21 a 25 hrs a la semana", valor: 160 },
          { label: "Computadora: 26 a 30 hrs a la semana", valor: 190 },
          { label: "Computadora: 31 a 35 hrs a la semana", valor: 230 },
          { label: "Computadora: 36 a 40 hrs a la semana", valor: 260 },
          // DVD
          { label: "DVD: 2 a 3 hrs a la semana", valor: 3 },
          { label: "DVD: 4 a 6 hrs a la semana", valor: 6 },
          { label: "DVD: 7 a 9 hrs a la semana", valor: 9 },
          { label: "DVD: 10 a 12 hrs a la semana", valor: 12 },
          { label: "DVD: 13 a 15 hrs a la semana", valor: 16 },
          // Estéreo
          { label: "Estéreo: 2 a 3 hrs a la semana", valor: 9 },
          { label: "Estéreo: 4 a 6 hrs a la semana", valor: 17 },
          { label: "Estéreo: 7 a 9 hrs a la semana", valor: 28 },
          { label: "Estéreo: 10 a 12 hrs a la semana", valor: 38 },
          { label: "Estéreo: 13 a 15 hrs a la semana", valor: 48 },
        ],
      },
      {
        id: 26,
        tipo: "unica",
        pregunta: "Tu calentador o \"boiler\" utiliza:",
        opciones: [
          { label: "Gas LP", valor: 500 },
          { label: "Gas natural", valor: 400 },
          { label: "Electricidad", valor: 300 },
        ],
      },
      {
        id: 27,
        tipo: "unica",
        pregunta: "¿Cuánto tiempo tardas en bañarte?",
        opciones: [
          { label: "Más de 20 minutos", valor: 910 },
          { label: "Entre 10 y 20 minutos", valor: 450 },
          { label: "Entre 5 y 10 minutos", valor: 223 },
          { label: "Sólo 5 minutos", valor: 149 },
        ],
      },
      {
        id: 28,
        tipo: "unica",
        pregunta: "Cuando me lavo los dientes…",
        opciones: [
          { label: "Dejo correr el agua mientras lo hago", valor: 6 },
          { label: "Utilizo un vaso de agua para esta actividad", valor: 1 },
        ],
      },
      {
        id: 29,
        tipo: "unica",
        pregunta: "¿Cuántas veces por día vacías el escusado o WC?",
        opciones: [
          { label: "2 a 3 veces por día", valor: 55 },
          { label: "4 a 6 veces por día", valor: 108 },
          { label: "7 a 9 veces por día", valor: 176 },
          { label: "10 a 12 veces por día", valor: 240 },
        ],
      },
    ],
  },

  forestal: {
    titulo: "Sección D: Forestal",
    preguntas: [
      {
        id: 30,
        tipo: "unica",
        pregunta: "¿Cuántas libretas profesionales de 100 hojas usas en un semestre?",
        opciones: [
          { label: "2 a 3 libretas por semestre", valor: 58 },
          { label: "3 a 4 libretas por semestre", valor: 81 },
          { label: "4 a 5 libretas por semestre", valor: 105 },
          { label: "5 a 6 libretas por semestre", valor: 128 },
          { label: "6 a 7 libretas por semestre", valor: 151 },
        ],
      },
    ],
  },

  infraestructura: {
    titulo: "Infraestructura",
    valorFijo: 6400,
    descripcion: "Valor fijo que se suma una sola vez al puntaje total del test.",
  },

  interpretacion: [
    { max: 16000, hagMin: 0.1, hagMax: 1.6, mensaje: "Dentro de los límites del planeta. ¡Bien hecho!" },
    { min: 16000, max: 32000, hagMin: 1.6, hagMax: 3.2, mensaje: "Por arriba del umbral de sostenibilidad. ¡Cuidado!" },
    { min: 32000, hagMin: 3.2, hagMax: null, mensaje: "Ritmo de vida completamente insostenible." },
  ],
};

/**
 * Calcula el puntaje total de la huella ecológica a partir de las respuestas del usuario.
 *
 * @param {Object} respuestas - Respuestas del usuario, indexadas por id de pregunta.
 *   - Para tipo "unica": respuestas[id] = valor numérico de la opción elegida (o 0/undefined si se omitió).
 *   - Para tipo "multiple" normal (ninguna en este test aparte de los casos especiales abajo):
 *     respuestas[id] = suma de valores ya calculada, o array de valores seleccionados.
 *   - Casos especiales que debes construir tú en el formulario antes de llamar a esta función:
 *
 *     respuestas[11] = suma de (veces_por_semana × valor) de cada ítem de la pregunta 11.
 *       Ej: cacahuates 2 veces/semana × 50 = 100; papas 1×22=22; etc. Súmalos y pon el total aquí.
 *
 *     respuestas[19] = 12000 si tiene auto propio, 0 si no.
 *     respuestas[20] = valor de la opción de km recorridos en auto/taxi (0 si no aplica, ej. no tiene auto).
 *
 *     respuestas[21] = suma de los valores de los electrodomésticos que sí tiene (checkbox múltiple).
 *     respuestas[22] = valor de la opción de focos convencionales.
 *     respuestas[23] = valor de la opción de focos ahorradores.
 *     respuestas.habitantesHogar = número de personas que viven en el hogar (para dividir 21+22+23).
 *
 *     respuestas[24] = 76 * numeroDeCelulares (0 si no tiene celular).
 *
 *     respuestas[25] = suma de los 4 valores elegidos (uno por Televisor, Computadora, DVD y Estéreo).
 *       Si no tiene alguno de los aparatos, ese valor es 0.
 *
 * @returns {Object} Desglose de puntajes por sección y el total general, más la interpretación.
 */
function calcularHuellaEcologica(respuestas = {}) {
  const val = (id) => Number(respuestas[id]) || 0;

  // --- Sección A: Alimentos (preguntas 1 a 15) ---
  const totalAlimentos =
    val(1) + val(2) + val(3) + val(4) + val(5) + val(6) + val(7) + val(8) +
    val(9) + val(10) + val(11) + val(12) + val(13) + val(14) + val(15);

  // --- Sección B: Transporte (preguntas 16 a 20) ---
  const totalTransporte = val(16) + val(17) + val(18) + val(19) + val(20);

  // --- Sección C: Energía (preguntas 21 a 29) ---
  // 21, 22 y 23 se suman y se dividen entre el número de habitantes del hogar.
  const habitantesHogar = Number(respuestas.habitantesHogar) || 1;
  const subtotal212223 = (val(21) + val(22) + val(23)) / habitantesHogar;

  const totalEnergia =
    subtotal212223 + val(24) + val(25) + val(26) + val(27) + val(28) + val(29);

  // --- Sección D: Forestal (pregunta 30) ---
  const totalForestal = val(30);

  // --- Infraestructura: valor fijo ---
  const infraestructura = preguntasHuellaEcologica.infraestructura.valorFijo;

  const totalGeneral =
    totalAlimentos + totalTransporte + totalEnergia + totalForestal + infraestructura;

  return {
    totalAlimentos,
    totalTransporte,
    totalEnergia,
    totalForestal,
    infraestructura,
    totalGeneral,
    interpretacion: interpretarPuntaje(totalGeneral),
  };
}

/**
 * Devuelve el mensaje de interpretación y el rango de hectáreas globales (hag)
 * correspondiente al puntaje total, según los umbrales del artículo original.
 */
function interpretarPuntaje(totalGeneral) {
  if (totalGeneral < 16000) {
    return {
      nivel: "sustentable",
      hagMin: 0.1,
      hagMax: 1.6,
      mensaje:
        "Requieres menos de 1.6 hectáreas globales (hag) y vives dentro de los límites del planeta. ¡Bien hecho!",
      planetasMin: 0.06,
      planetasMax: 1,
    };
  }
  if (totalGeneral <= 32000) {
    return {
      nivel: "advertencia",
      hagMin: 1.6,
      hagMax: 3.2,
      mensaje:
        "Tu impacto ambiental individual está por arriba del umbral de sostenibilidad del planeta. ¡Cuidado!",
      planetasMin: 1,
      planetasMax: 2,
    };
  }
  return {
    nivel: "insostenible",
    hagMin: 3.2,
    hagMax: null,
    mensaje:
      "Tu ritmo de vida es completamente insostenible; tu Huella Ecológica es muy superior a 1.6 hectáreas globales.",
    planetasMin: 2,
    planetasMax: null,
  };
}

export { preguntasHuellaEcologica, calcularHuellaEcologica, interpretarPuntaje };
export default preguntasHuellaEcologica;
