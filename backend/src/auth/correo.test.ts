import assert from "node:assert";
import test from "node:test";
import { dominioPermitido, normalizarCorreo } from "./correo";

test("normaliza a minusculas, sin espacios y sin +alias", () => {
  assert.strictEqual(normalizarCorreo("  Alumno@UCOL.mx "), "alumno@ucol.mx");
  assert.strictEqual(normalizarCorreo("alumno+2@ucol.mx"), "alumno@ucol.mx");
  assert.strictEqual(normalizarCorreo("a.b_c-d@alumnos.ucol.mx"), "a.b_c-d@alumnos.ucol.mx");
});

test("rechaza lo que no parece un correo", () => {
  const invalidos: unknown[] = [
    "", "   ", "sin-arroba", "a@b@ucol.mx", "@ucol.mx", "+solo@ucol.mx", "alumno@", "alumno@localhost",
    "alumno@ucol", "al umno@ucol.mx", "alumno@-ucol.mx", `${"a".repeat(65)}@ucol.mx`, `a@${"b".repeat(250)}.mx`,
    null, undefined, 42, {}, ["a@ucol.mx"],
  ];
  for (const entrada of invalidos) assert.strictEqual(normalizarCorreo(entrada), null, JSON.stringify(entrada));
});

test("dominioPermitido acepta el dominio exacto y sus subdominios, no los que solo lo terminan", () => {
  const lista = ["ucol.mx"];
  assert.ok(dominioPermitido("a@ucol.mx", lista));
  assert.ok(dominioPermitido("a@alumnos.ucol.mx", lista));
  assert.ok(dominioPermitido("a@x.y.ucol.mx", lista));
  assert.ok(!dominioPermitido("a@gmail.com", lista));
  assert.ok(!dominioPermitido("a@falsoucol.mx", lista));
  assert.ok(!dominioPermitido("a@ucol.mx.evil.com", lista));
  assert.ok(dominioPermitido("a@otra.edu.mx", ["ucol.mx", "otra.edu.mx"]));
});
