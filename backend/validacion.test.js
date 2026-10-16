const test = require("node:test");
const assert = require("node:assert");
const { validarRespuesta, COLUMNAS } = require("./validacion");

const participante = { id: "abcd1234abcd1234", correo: "Alumno@UCOL.mx" };

function cuerpoValido() {
  const respuestas = { 1: "21", S1: "Femenino", 2: "Ingeniería en Software", 3: "3", 4: "Sí", 5: "Sí", 8: "", 25: " leer ", 26: "", 27: "" };
  for (let id = 9; id <= 24; id++) respuestas[id] = 4;
  return { respuestas, tiempoMin: 5, planetas: "entre 1 y 2" };
}

test("acepta un cuerpo valido y normaliza correo y textos", () => {
  const r = validarRespuesta(cuerpoValido(), participante);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.datos.correo, "alumno@ucol.mx");
  assert.strictEqual(r.datos.habito_cambiar, "leer");
  assert.strictEqual(r.datos.pregunta_sin_respuesta, null);
  assert.strictEqual(r.datos.u9, 4);
  assert.strictEqual(r.datos.i24, 4);
});

test("datos cubren todas las columnas que se insertan", () => {
  const { datos } = validarRespuesta(cuerpoValido(), participante);
  for (const columna of COLUMNAS) assert.ok(columna in datos, `falta ${columna}`);
});

test("sin participante guarda id y correo nulos", () => {
  const { datos } = validarRespuesta(cuerpoValido(), null);
  assert.strictEqual(datos.participante_id, null);
  assert.strictEqual(datos.correo, null);
});

test("rechaza edad fuera de rango o no numerica", () => {
  for (const edad of ["14", "100", "abc", "21.5"]) {
    const cuerpo = cuerpoValido();
    cuerpo.respuestas[1] = edad;
    assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false, edad);
  }
});

test("rechaza opciones fuera de lista (carrera Docente, semestre No aplica, sexo libre)", () => {
  for (const [id, valor] of [[2, "Docente"], [3, "No aplica"], ["S1", "otro"]]) {
    const cuerpo = cuerpoValido();
    cuerpo.respuestas[id] = valor;
    assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false, `${id}=${valor}`);
  }
});

test("rechaza likert fuera de 1 a 5 o faltante", () => {
  for (const valor of [0, 6, "x", undefined]) {
    const cuerpo = cuerpoValido();
    cuerpo.respuestas[12] = valor;
    assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false, String(valor));
  }
});

test("rechaza texto abierto demasiado largo y cuerpo vacio", () => {
  const cuerpo = cuerpoValido();
  cuerpo.respuestas[27] = "a".repeat(2001);
  assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false);
  assert.strictEqual(validarRespuesta({}, participante).ok, false);
  assert.strictEqual(validarRespuesta(null, participante).ok, false);
});

test("rechaza tiempo y planetas invalidos", () => {
  const a = cuerpoValido();
  a.tiempoMin = -1;
  const b = cuerpoValido();
  b.planetas = "7 planetas";
  assert.strictEqual(validarRespuesta(a, participante).ok, false);
  assert.strictEqual(validarRespuesta(b, participante).ok, false);
});
