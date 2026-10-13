// Indica si el paso actual ya tiene una respuesta válida para poder avanzar.
//  - unica: debe haber una opción elegida (valor 0 = opción nula, también es válida).
//  - multipleCheckbox (Q21): al menos un electrodoméstico o "Ninguno de estos".
//  - multipleCantidad, cantidadDispositivo, multiGrupo y habitantesHogar tienen
//    valores por defecto (0 / "No tengo" / 1) que ya son una respuesta válida.
export function pasoRespondido(paso, respuestas) {
  if (paso.tipo === "unica") {
    return respuestas[paso.pregunta.id] !== undefined;
  }
  if (paso.tipo === "multipleCheckbox") {
    return respuestas.ninguno21 === true || (respuestas.detalle21 || []).some(Boolean);
  }
  return true;
}

export default pasoRespondido;
