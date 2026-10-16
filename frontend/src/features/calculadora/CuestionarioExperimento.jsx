import { useRef, useState } from "react";
import { cuestionarioExperimento } from "../../config/experiment";
import ToastAviso from "./ToastAviso";

const CuestionarioExperimento = ({ respuestasCalculadora, tiempoTranscurrido, onCompletar }) => {
  const [seccionActual, setSeccionActual] = useState(0);
  const [respuestasExperimento, setRespuestasExperimento] = useState({});
  const [aceptoConsentimiento, setAceptoConsentimiento] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMensaje, setToastMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const envioEnCurso = useRef(false);

  const secciones = cuestionarioExperimento.secciones;
  const seccionActualData = secciones[seccionActual];

  const manejarRespuesta = (idPregunta, valor) => {
    setRespuestasExperimento({
      ...respuestasExperimento,
      [idPregunta]: valor
    });
  };

  const manejarSiguiente = () => {
    // Validar consentimiento en la primera sección
    if (seccionActual === 0) {
      if (aceptoConsentimiento === null) {
        setToastMensaje("Por favor responde a la pregunta de consentimiento");
        setShowToast(true);
        return;
      }
      if (aceptoConsentimiento === "No, gracias") {
        onCompletar(null);
        return;
      }
    }

    // Validar respuestas obligatorias en otras secciones
    const respuestasObligatorias = seccionActualData.preguntas.filter(p => !p.opcional);
    const faltanRespuestas = respuestasObligatorias.some(p => !respuestasExperimento[p.id]);

    if (faltanRespuestas) {
      setToastMensaje("Por favor responde todas las preguntas obligatorias");
      setShowToast(true);
      return;
    }

    if (seccionActual < secciones.length - 1) {
      setSeccionActual(seccionActual + 1);
    } else {
      finalizarCuestionario();
    }
  };

  const finalizarCuestionario = () => {
    if (envioEnCurso.current) return;
    envioEnCurso.current = true;
    setEnviando(true);
    const datosFinales = {
      respuestasCalculadora,
      respuestasExperimento,
      tiempoTranscurrido,
      timestamp: new Date().toISOString()
    };
    console.log("Cuestionario completado:", datosFinales);
    onCompletar(datosFinales);
  };

  const renderizarPregunta = (pregunta) => {
    const valor = respuestasExperimento[pregunta.id] ?? "";

    switch (pregunta.tipo) {
      case "opcion_unica":
        return (
          <div key={pregunta.id} className="mb-4">
            <p className="font-semibold text-gray-800 mb-2">{pregunta.texto}</p>
            <div className="space-y-2">
              {pregunta.opciones.map((opcion) => (
                <label key={opcion} className="flex items-center">
                  <input
                    type="radio"
                    name={pregunta.id}
                    value={opcion}
                    checked={valor === opcion}
                    onChange={(e) => {
                      if (seccionActual === 0) {
                        setAceptoConsentimiento(e.target.value);
                      }
                      manejarRespuesta(pregunta.id, e.target.value);
                    }}
                    className="mr-2"
                  />
                  {opcion}
                </label>
              ))}
            </div>
          </div>
        );

      case "escala_likert":
        return (
          <div key={pregunta.id} className="mb-6">
            <p className="font-semibold text-gray-800 mb-3">{pregunta.texto}</p>
            <div className="flex justify-between gap-2">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((numero) => (
                <button
                  key={numero}
                  onClick={() => manejarRespuesta(pregunta.id, numero)}
                  className={`flex-1 py-2 rounded border-2 transition ${
                    valor === numero
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:border-green-400"
                  }`}
                >
                  {numero}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Desacuerdo</span>
              <span>De acuerdo</span>
            </div>
          </div>
        );

      case "texto_corto":
        return (
          <div key={pregunta.id} className="mb-4">
            <label className="block font-semibold text-gray-800 mb-2">
              {pregunta.texto}
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => manejarRespuesta(pregunta.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Escribe tu respuesta"
            />
          </div>
        );

      case "select":
        return (
          <div key={pregunta.id} className="mb-4">
            <label className="block font-semibold text-gray-800 mb-2">
              {pregunta.texto}
            </label>
            <select
              value={valor}
              onChange={(e) => manejarRespuesta(pregunta.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona una opción</option>
              {pregunta.opciones.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>
        );

      case "texto_largo":
        return (
          <div key={pregunta.id} className="mb-4">
            <label className="block font-semibold text-gray-800 mb-2">
              {pregunta.texto}
              {pregunta.opcional && <span className="text-gray-500 text-sm ml-2">(opcional)</span>}
            </label>
            <textarea
              value={valor}
              onChange={(e) => manejarRespuesta(pregunta.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Escribe tu respuesta"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{seccionActualData.titulo}</h2>

      {seccionActualData.instrucciones_aplicador && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm text-blue-700">
          {seccionActualData.instrucciones_aplicador}
        </div>
      )}

      {seccionActualData.instrucciones && (
        <p className="text-gray-600 mb-4">{seccionActualData.instrucciones}</p>
      )}

      {seccionActualData.texto && (
        <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded">{seccionActualData.texto}</p>
      )}

      <div className="space-y-4 mb-6">
        {seccionActualData.preguntas.map(renderizarPregunta)}
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={() => seccionActual > 0 && setSeccionActual(seccionActual - 1)}
          disabled={seccionActual === 0}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <div className="text-sm text-gray-600">
          Sección {seccionActual + 1} de {secciones.length}
        </div>

        <button
          onClick={manejarSiguiente}
          disabled={enviando}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enviando ? "Enviando..." : seccionActual === secciones.length - 1 ? "Finalizar" : "Siguiente"}
        </button>
      </div>

      {showToast && (
        <ToastAviso
          mensaje={toastMensaje}
          tipo="advertencia"
          onCerrar={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default CuestionarioExperimento;
