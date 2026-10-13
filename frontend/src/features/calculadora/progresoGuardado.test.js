import {
  CLAVE_PROGRESO,
  borrarProgreso,
  cargarProgreso,
  guardarProgreso,
  tieneRespuestas,
} from './progresoGuardado';
import { calcularHuellaEcologica } from './preguntas';
import { pasoRespondido } from './pasoRespondido';

const TOTAL_PASOS = 31;

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('progresoGuardado', () => {
  test('guardar y cargar conserva respuestas, paso y verResultado', () => {
    const estado = {
      respuestas: { 1: 27, 3: 0, habitantesHogar: 3, detalle21: [true, false] },
      pasoActual: 4,
      verResultado: false,
    };
    expect(guardarProgreso(estado)).toBe(true);

    const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO));
    expect(guardado.version).toBe(1);

    expect(cargarProgreso(TOTAL_PASOS)).toEqual(estado);
  });

  test('sin datos guardados devuelve null', () => {
    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();
  });

  test('JSON corrupto o forma invalida se ignora', () => {
    localStorage.setItem(CLAVE_PROGRESO, '{no es json');
    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();

    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify([1, 2]));
    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();

    localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ version: 1, respuestas: 'x', pasoActual: 0, verResultado: false })
    );
    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();

    localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ version: 1, respuestas: {}, pasoActual: 2.5, verResultado: false })
    );
    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();

    localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ version: 99, respuestas: {}, pasoActual: 0, verResultado: false })
    );
    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();
  });

  test('limita pasoActual al rango y asegura habitantesHogar', () => {
    localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ version: 1, respuestas: { 1: 27 }, pasoActual: 99, verResultado: 'si' })
    );
    expect(cargarProgreso(TOTAL_PASOS)).toEqual({
      respuestas: { 1: 27, habitantesHogar: 1 },
      pasoActual: TOTAL_PASOS - 1,
      verResultado: false,
    });

    localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ version: 1, respuestas: { habitantesHogar: -2 }, pasoActual: -5, verResultado: false })
    );
    expect(cargarProgreso(TOTAL_PASOS)).toMatchObject({
      respuestas: { habitantesHogar: 1 },
      pasoActual: 0,
    });
  });

  test('si localStorage lanza errores no se propaga la excepcion', () => {
    const error = () => {
      throw new Error('almacenamiento deshabilitado');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(error);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(error);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(error);

    expect(cargarProgreso(TOTAL_PASOS)).toBeNull();
    expect(guardarProgreso({ respuestas: {}, pasoActual: 0, verResultado: false })).toBe(false);
    expect(borrarProgreso()).toBe(false);
  });

  test('borrarProgreso elimina la clave', () => {
    guardarProgreso({ respuestas: { 1: 27 }, pasoActual: 1, verResultado: false });
    borrarProgreso();
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
  });

  test('las claves numericas convertidas a texto dan el mismo calculo y validacion', () => {
    const respuestas = {
      1: 27, 5: 1600, 19: 12000, 21: 300, 22: 0, 30: 0,
      habitantesHogar: 2, detalle21: [true, false], ninguno21: false,
    };
    guardarProgreso({ respuestas, pasoActual: 3, verResultado: true });
    const restauradas = cargarProgreso(TOTAL_PASOS).respuestas;

    expect(Object.keys(restauradas)).toContain('1');
    expect(calcularHuellaEcologica(restauradas)).toEqual(calcularHuellaEcologica(respuestas));
    expect(pasoRespondido({ tipo: 'unica', pregunta: { id: 5 } }, restauradas)).toBe(true);
    expect(pasoRespondido({ tipo: 'unica', pregunta: { id: 6 } }, restauradas)).toBe(false);
    expect(pasoRespondido({ tipo: 'multipleCheckbox', pregunta: { id: 21 } }, restauradas)).toBe(true);
  });

  test('tieneRespuestas ignora el valor por defecto de habitantesHogar', () => {
    expect(tieneRespuestas({ habitantesHogar: 1 })).toBe(false);
    expect(tieneRespuestas({ habitantesHogar: 3 })).toBe(true);
    expect(tieneRespuestas({ habitantesHogar: 1, 1: 0 })).toBe(true);
  });
});
