import assert from "node:assert";
import test from "node:test";
import type { Participante } from "../auth/tipos";
import { COLUMNAS, validarRespuesta, type FilaRespuesta } from "./respuestas";

const participante: Participante = { id: "abcd1234abcd1234", tipo: "Estudiante", correo: "Alumno@UCOL.mx", metodoAcceso: "saml" };

function cuerpoValido() {
  const respuestas: Record<string, unknown> = {
    1: "21", S1: "Femenino", 2: "Ingeniería en Software", 3: "3", 4: "Sí", 5: "Sí", 8: "", 25: " leer ", 26: "", 27: "",
  };
  for (let id = 9; id <= 24; id++) respuestas[id] = 4;
  return { respuestas, tiempoMin: 5, planetas: "entre 1 y 2" } as { respuestas: Record<string, unknown>; tiempoMin: unknown; planetas: unknown };
}

function datosDe(body: unknown, p: Participante): FilaRespuesta {
  const r = validarRespuesta(body, p);
  if (!r.ok) throw new Error(`se esperaba valido: ${r.errores.join("; ")}`);
  return r.datos;
}

test("acepta un cuerpo valido y normaliza correo y textos", () => {
  const datos = datosDe(cuerpoValido(), participante);
  assert.strictEqual(datos.correo, "alumno@ucol.mx");
  assert.strictEqual(datos.habito_cambiar, "leer");
  assert.strictEqual(datos.pregunta_sin_respuesta, null);
  assert.strictEqual(datos.edad, 21);
  assert.strictEqual(datos.u9, 4);
  assert.strictEqual(datos.i24, 4);
});

test("datos cubren exactamente las columnas que se insertan", () => {
  const datos = datosDe(cuerpoValido(), participante);
  for (const columna of COLUMNAS) assert.ok(columna in datos, `falta ${columna}`);
  assert.strictEqual(Object.keys(datos).length, COLUMNAS.length);
});

test("guarda el metodo de acceso del participante", () => {
  assert.strictEqual(datosDe(cuerpoValido(), participante).metodo_acceso, "saml");
  const porCorreo: Participante = { id: "0123456789abcdef", tipo: null, correo: "alumno@ucol.mx", metodoAcceso: "correo" };
  const datos = datosDe(cuerpoValido(), porCorreo);
  assert.strictEqual(datos.metodo_acceso, "correo");
  assert.strictEqual(datos.participante_id, porCorreo.id);
});

test("ignora campos de identidad enviados en el cuerpo (la identidad viene de la sesion)", () => {
  const cuerpo = { ...cuerpoValido(), participante_id: "falsificado", correo: "otro@ucol.mx" };
  const datos = datosDe(cuerpo, participante);
  assert.strictEqual(datos.participante_id, participante.id);
  assert.strictEqual(datos.correo, "alumno@ucol.mx");
});

test("rechaza edad fuera de rango o no numerica", () => {
  for (const edad of ["14", "100", "abc", "21.5", "", null, undefined]) {
    const cuerpo = cuerpoValido();
    cuerpo.respuestas["1"] = edad;
    assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false, String(edad));
  }
});

test("rechaza opciones fuera de lista (carrera Docente, semestre No aplica, sexo libre)", () => {
  for (const [id, valor] of [["2", "Docente"], ["3", "No aplica"], ["S1", "otro"]] as const) {
    const cuerpo = cuerpoValido();
    cuerpo.respuestas[id] = valor;
    assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false, `${id}=${valor}`);
  }
});

test("rechaza likert fuera de 1 a 5 o faltante", () => {
  for (const valor of [0, 6, "x", undefined]) {
    const cuerpo = cuerpoValido();
    cuerpo.respuestas["12"] = valor;
    assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false, String(valor));
  }
});

test("rechaza texto abierto demasiado largo y cuerpos vacios o invalidos", () => {
  const cuerpo = cuerpoValido();
  cuerpo.respuestas["27"] = "a".repeat(2001);
  assert.strictEqual(validarRespuesta(cuerpo, participante).ok, false);
  for (const invalido of [{}, null, undefined, "texto", 42, []]) {
    assert.strictEqual(validarRespuesta(invalido, participante).ok, false, JSON.stringify(invalido));
  }
});

test("rechaza tiempo y planetas invalidos", () => {
  const a = cuerpoValido();
  a.tiempoMin = -1;
  const b = cuerpoValido();
  b.planetas = "7 planetas";
  assert.strictEqual(validarRespuesta(a, participante).ok, false);
  assert.strictEqual(validarRespuesta(b, participante).ok, false);
});

test("los errores indican la pregunta que fallo", () => {
  const cuerpo = cuerpoValido();
  cuerpo.respuestas["2"] = "Docente";
  const r = validarRespuesta(cuerpo, participante);
  assert.ok(!r.ok && r.errores.some((e) => e.startsWith("respuestas.2")), JSON.stringify(r));
});
