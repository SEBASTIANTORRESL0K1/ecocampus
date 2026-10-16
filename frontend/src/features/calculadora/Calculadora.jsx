import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { preguntasHuellaEcologica, calcularHuellaEcologica } from "./preguntas";
import ImagenTema from "./ImagenTema";
import ToastAviso from "./ToastAviso";
import ModalConfirmacion from "./ModalConfirmacion";
import { pasoRespondido } from "./pasoRespondido";
import CuestionarioExperimento from "./CuestionarioExperimento";
import { EXPERIMENTO_ACTIVO } from "../../config/experiment";
import {
  RESPUESTAS_INICIALES,
  borrarProgreso,
  cargarProgreso,
  guardarProgreso,
  tieneRespuestas,
} from "./progresoGuardado";

const SECCIONES = ["alimentos", "transporte", "energia", "forestal"];
const GRUPOS_25 = ["Televisor", "Computadora", "DVD", "Estéreo"];

// Arma la lista de "pasos" a mostrar: una pregunta a la vez, insertando un
// paso extra (habitantesHogar) antes de la pregunta 21, y marcando qué
// preguntas necesitan una interfaz especial en vez del selector simple.
function construirPasos() {
  const pasos = [];
  SECCIONES.forEach((clave) => {
    const seccion = preguntasHuellaEcologica[clave];
    seccion.preguntas.forEach((pregunta) => {
      if (pregunta.id === 21) {
        pasos.push({ tipo: "habitantesHogar", imagen: "family", seccionTitulo: seccion.titulo });
      }
      let tipo = "unica";
      if (pregunta.id === 11) tipo = "multipleCantidad";
      else if (pregunta.id === 21) tipo = "multipleCheckbox";
      else if (pregunta.id === 24) tipo = "cantidadDispositivo";
      else if (pregunta.id === 25) tipo = "multiGrupo";
      pasos.push({ tipo, pregunta, seccionTitulo: seccion.titulo });
    });
  });
  return pasos;
}

const Calculadora = () => {
  const pasos = useMemo(construirPasos, []);
  // El progreso guardado se lee una sola vez y de forma perezosa para que no
  // haya un parpadeo de la primera pregunta antes de restaurar.
  const [progresoInicial] = useState(() => cargarProgreso(pasos.length));
  const [pasoActual, setPasoActual] = useState(() => progresoInicial?.pasoActual ?? 0);
  const [respuestas, setRespuestas] = useState(
    () => progresoInicial?.respuestas ?? { ...RESPUESTAS_INICIALES }
  );
  const [verResultado, setVerResultado] = useState(() => progresoInicial?.verResultado ?? false);
  // El resultado no se guarda: se recalcula a partir de las respuestas restauradas.
  const [resultado, setResultado] = useState(() =>
    progresoInicial?.verResultado ? calcularHuellaEcologica(progresoInicial.respuestas) : null
  );
  const [avisoRecuperado, setAvisoRecuperado] = useState(
    () => progresoInicial !== null && tieneRespuestas(progresoInicial.respuestas)
  );
  const [modalBorrarAbierto, setModalBorrarAbierto] = useState(false);
  const [tiempoInicio] = useState(() => Date.now());
  const [verCuestionario, setVerCuestionario] = useState(false);

  const hayRespuestas = tieneRespuestas(respuestas);

  // Guarda el progreso en cada cambio; si el estado es el inicial, borra la clave.
  useEffect(() => {
    if (!verResultado && pasoActual === 0 && !hayRespuestas) {
      borrarProgreso();
    } else {
      guardarProgreso({ respuestas, pasoActual, verResultado });
    }
  }, [respuestas, pasoActual, verResultado, hayRespuestas]);

  const paso = pasos[pasoActual];
  const respondido = pasoRespondido(paso, respuestas);

  // Imagen ilustrativa del paso (el paso habitantesHogar no tiene pregunta propia).
  const imagenPaso = paso.pregunta
    ? {
        palabraClave: paso.pregunta.imagen,
        lock: paso.pregunta.id,
        alt: `Imagen ilustrativa: ${paso.pregunta.pregunta}`,
      }
    : {
        palabraClave: paso.imagen,
        lock: 0,
        alt: "Imagen ilustrativa: personas que viven en el hogar",
      };

  const gruposDe25 = useMemo(() => {
    if (paso.tipo !== "multiGrupo") return [];
    return GRUPOS_25.map((nombre) => ({
      nombre,
      opciones: paso.pregunta.opciones.filter((o) => o.label.startsWith(nombre)),
    }));
  }, [paso]);

  const seleccionarUnica = (id, valor) => {
    setRespuestas({ ...respuestas, [id]: valor });
  };

  const actualizarDetalle11 = (index, veces) => {
    const opciones = paso.pregunta.opciones;
    const detalle = respuestas.detalle11 ? [...respuestas.detalle11] : opciones.map(() => 0);
    detalle[index] = Math.max(0, Number(veces) || 0);
    const total = detalle.reduce((acc, v, i) => acc + v * opciones[i].valor, 0);
    setRespuestas({ ...respuestas, detalle11: detalle, 11: total });
  };

  const toggleDetalle21 = (index) => {
    const opciones = paso.pregunta.opciones;
    const detalle = respuestas.detalle21 ? [...respuestas.detalle21] : opciones.map(() => false);
    detalle[index] = !detalle[index];
    const total = detalle.reduce((acc, marcado, i) => acc + (marcado ? opciones[i].valor : 0), 0);
    setRespuestas({ ...respuestas, detalle21: detalle, 21: total, ninguno21: false });
  };

  // "Ninguno de estos" desmarca todos los electrodomésticos (Q21 = 0).
  const toggleNinguno21 = () => {
    const opciones = paso.pregunta.opciones;
    setRespuestas({
      ...respuestas,
      ninguno21: !respuestas.ninguno21,
      detalle21: opciones.map(() => false),
      21: 0,
    });
  };

  const actualizarCantidadCelulares = (cantidad) => {
    const n = Math.max(0, Number(cantidad) || 0);
    setRespuestas({ ...respuestas, cantidadCelulares: n, 24: n * 76 });
  };

  const actualizarGrupo25 = (nombreGrupo, valor) => {
    const detalle = { ...respuestas.detalle25, [nombreGrupo]: valor };
    const total = Object.values(detalle).reduce((acc, v) => acc + (Number(v) || 0), 0);
    setRespuestas({ ...respuestas, detalle25: detalle, 25: total });
  };

  const actualizarHabitantesHogar = (n) => {
    setRespuestas({ ...respuestas, habitantesHogar: Math.max(1, Number(n) || 1) });
  };

  const handleSiguiente = () => {
    if (!respondido) return;
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      const resultadoCalculado = calcularHuellaEcologica(respuestas);
      setResultado(resultadoCalculado);
      if (EXPERIMENTO_ACTIVO) {
        setVerCuestionario(true);
      } else {
        setVerResultado(true);
      }
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 0) setPasoActual(pasoActual - 1);
  };

  // Borra lo guardado y vuelve a la pregunta 1 con los valores iniciales.
  const reiniciarCuestionario = () => {
    borrarProgreso();
    setPasoActual(0);
    setRespuestas({ ...RESPUESTAS_INICIALES });
    setVerResultado(false);
    setVerCuestionario(false);
    setResultado(null);
    setAvisoRecuperado(false);
    setModalBorrarAbierto(false);
  };

  // Regresa al último paso conservando las respuestas para poder cambiarlas.
  const revisarRespuestas = () => {
    setVerResultado(false);
    setResultado(null);
    setPasoActual(pasos.length - 1);
  };

  const manejarCuestionarioCompleto = (datosCuestionario) => {
    if (datosCuestionario === null) {
      // Usuario rechazó participar
      reiniciarCuestionario();
      return;
    }

    // Guardar datos del cuestionario en localStorage
    const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000 / 60); // en minutos
    const datosCompletos = {
      ...datosCuestionario,
      tiempoTranscurrido,
      planesNecesarios: resultado.interpretacion.planetas
    };

    console.log("Datos del experimento completos:", datosCompletos);
    localStorage.setItem("datosExperimento", JSON.stringify(datosCompletos));

    // Mostrar resultado final
    setVerCuestionario(false);
    setVerResultado(true);
  };

  return (
    <PageLayout className="bg-[#f4f1ec]">
      {/* Barra de progreso */}
      {!verResultado && !verCuestionario && (
        <>
          <div className="w-full h-2 bg-gray-200">
            <div
              className="h-full bg-lime-500 transition-all duration-300"
              style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-1">
            {paso.seccionTitulo} · Pregunta {pasoActual + 1} de {pasos.length}
          </p>
        </>
      )}

      {/* Contenido principal */}
      {!verResultado && !verCuestionario && (
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
            <ImagenTema key={pasoActual} {...imagenPaso} />

            {/* --- Pregunta de una sola opción --- */}
            {paso.tipo === "unica" && (
              <>
                <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">
                  {paso.pregunta.pregunta}
                </h2>
                {paso.pregunta.nota && (
                  <p className="text-sm text-gray-500 text-center mb-4">{paso.pregunta.nota}</p>
                )}
                <div className="space-y-3">
                  {paso.pregunta.opciones.map((op) => {
                    const estaSeleccionado = respuestas[paso.pregunta.id] === op.valor;
                    return (
                      <button
                        key={op.label}
                        onClick={() => seleccionarUnica(paso.pregunta.id, op.valor)}
                        className={`w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100
                        ${estaSeleccionado ? "bg-lime-500 border-lime-600 font-bold text-white" : ""}`}
                      >
                        {op.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* --- Pregunta 11: alimentos con veces por semana --- */}
            {paso.tipo === "multipleCantidad" && (
              <>
                <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">
                  {paso.pregunta.pregunta}
                </h2>
                {paso.pregunta.nota && (
                  <p className="text-sm text-gray-500 text-center mb-4">{paso.pregunta.nota}</p>
                )}
                <div className="space-y-3">
                  {paso.pregunta.opciones.map((op, index) => (
                    <div key={op.label} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700">{op.label}</span>
                      <input
                        type="number"
                        min="0"
                        value={respuestas.detalle11?.[index] ?? 0}
                        onChange={(e) => actualizarDetalle11(index, e.target.value)}
                        className="w-16 border border-gray-300 rounded-md px-2 py-1 text-center"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* --- Pregunta 21: electrodomésticos (checkbox) --- */}
            {paso.tipo === "multipleCheckbox" && (
              <>
                <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">
                  {paso.pregunta.pregunta}
                </h2>
                {paso.pregunta.nota && (
                  <p className="text-sm text-gray-500 text-center mb-4">{paso.pregunta.nota}</p>
                )}
                <div className="space-y-3">
                  {paso.pregunta.opciones.map((op, index) => {
                    const marcado = respuestas.detalle21?.[index] || false;
                    return (
                      <button
                        key={op.label}
                        onClick={() => toggleDetalle21(index)}
                        className={`w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-left
                        ${marcado ? "bg-lime-500 border-lime-600 font-bold text-white" : ""}`}
                      >
                        {op.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <button
                    onClick={toggleNinguno21}
                    className={`w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-left
                    ${respuestas.ninguno21 ? "bg-lime-500 border-lime-600 font-bold text-white" : ""}`}
                  >
                    Ninguno de estos
                  </button>
                </div>
              </>
            )}

            {/* --- Pregunta 24: cantidad de celulares --- */}
            {paso.tipo === "cantidadDispositivo" && (
              <>
                <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">
                  {paso.pregunta.pregunta}
                </h2>
                {paso.pregunta.nota && (
                  <p className="text-sm text-gray-500 text-center mb-4">{paso.pregunta.nota}</p>
                )}
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="celulares-input" className="text-sm text-gray-600">Número de celulares</label>
                  <input
                    id="celulares-input"
                    type="number"
                    min="0"
                    value={respuestas.cantidadCelulares ?? 0}
                    onChange={(e) => actualizarCantidadCelulares(e.target.value)}
                    className="w-24 border border-gray-300 rounded-md px-2 py-2 text-center"
                  />
                </div>
              </>
            )}

            {/* --- Pregunta 25: TV / PC / DVD / Estéreo por separado --- */}
            {paso.tipo === "multiGrupo" && (
              <>
                <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
                  {paso.pregunta.pregunta}
                </h2>
                <div className="space-y-4">
                  {gruposDe25.map((grupo) => (
                    <div key={grupo.nombre}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {grupo.nombre}
                      </label>
                      <select
                        value={respuestas.detalle25?.[grupo.nombre] ?? 0}
                        onChange={(e) => actualizarGrupo25(grupo.nombre, Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-2 py-2"
                      >
                        <option value={0}>No tengo / no lo uso</option>
                        {grupo.opciones.map((op) => (
                          <option key={op.label} value={op.valor}>
                            {op.label.replace(`${grupo.nombre}: `, "")}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* --- Paso extra: habitantes del hogar --- */}
            {paso.tipo === "habitantesHogar" && (
              <>
                <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">
                  ¿Cuántas personas viven en tu hogar (incluyéndote)?
                </h2>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Este dato se usa para repartir entre todos los habitantes el consumo de
                  electrodomésticos y focos del hogar.
                </p>
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={respuestas.habitantesHogar ?? 1}
                    onChange={(e) => actualizarHabitantesHogar(e.target.value)}
                    className="w-24 border border-gray-300 rounded-md px-2 py-2 text-center"
                  />
                </div>
              </>
            )}

            {!respondido && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Selecciona una opción para continuar.
              </p>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleAnterior}
                disabled={pasoActual === 0}
                // py-1.5 + borde de 2 px iguala la altura de "Siguiente" (py-2 sin borde)
                className="px-4 py-1.5 bg-white text-gray-900 font-semibold border-2 border-gray-900 rounded hover:bg-lime-100 hover:border-lime-700 hover:text-lime-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-900 disabled:hover:text-gray-900"
              >
                Anterior
              </button>
              <button
                onClick={handleSiguiente}
                disabled={!respondido}
                className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-500"
              >
                {pasoActual < pasos.length - 1 ? "Siguiente" : "Finalizar"}
              </button>
            </div>

            {/* Borrar respuestas: abre el modal de confirmación */}
            {hayRespuestas && (
              <button
                onClick={() => setModalBorrarAbierto(true)}
                className="mt-6 w-full min-h-12 px-4 inline-flex items-center justify-center gap-2 text-base font-semibold text-red-700 bg-white border-2 border-red-700 rounded-md hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Borrar respuestas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cuestionario del experimento */}
      {verCuestionario && resultado && (
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <CuestionarioExperimento
            respuestasCalculadora={respuestas}
            tiempoTranscurrido={Math.round((Date.now() - tiempoInicio) / 1000 / 60)}
            onCompletar={manejarCuestionarioCompleto}
          />
        </div>
      )}

      {/* Pantalla de resultado final */}
      {verResultado && resultado && (
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-12 rounded-md shadow-md max-w-2xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">¡Tu resultado!</h2>

            <p className="text-2xl text-gray-800">
              Tu huella ecológica total es de{" "}
              <span className="font-bold text-lime-700 text-3xl">
                {Math.round(resultado.totalGeneral).toLocaleString()}
              </span>{" "}
              puntos.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 text-left text-gray-700 max-w-md mx-auto">
              <div className="flex justify-between border-b pb-1">
                <span>Alimentos</span>
                <span className="font-semibold">{Math.round(resultado.totalAlimentos).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Transporte</span>
                <span className="font-semibold">{Math.round(resultado.totalTransporte).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Energía</span>
                <span className="font-semibold">{Math.round(resultado.totalEnergia).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Forestal</span>
                <span className="font-semibold">{Math.round(resultado.totalForestal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1 col-span-2">
                <span>Infraestructura</span>
                <span className="font-semibold">{resultado.infraestructura.toLocaleString()}</span>
              </div>
            </div>

            <p className="mt-8 text-2xl text-gray-800">
              Equivale a{" "}
              <span className="font-bold text-lime-700 text-3xl">
                {resultado.interpretacion.hagMax
                  ? `${resultado.interpretacion.hagMin} - ${resultado.interpretacion.hagMax}`
                  : `más de ${resultado.interpretacion.hagMin}`}
              </span>{" "}
              hectáreas globales (hag)
              {" "}
              ≈{" "}
              <span className="font-bold text-lime-700 text-3xl">
                {resultado.interpretacion.planetasTexto}
              </span>{" "}
              planetas
            </p>

            <p className="mt-4 text-xl text-gray-800">{resultado.interpretacion.mensaje}</p>

            <p className="mt-6 text-lg text-gray-600">
              (Esto es una aproximación basada en tus respuestas, según la metodología de
              Ibarra-Cisneros &amp; Monroy-Ata, 2014.)
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/"
                className="px-6 py-3 bg-lime-600 text-white text-xl rounded hover:bg-lime-800"
              >
                Volver al Inicio
              </Link>
              <button
                onClick={reiniciarCuestionario}
                className="px-6 py-3 border border-lime-600 text-lime-700 text-xl rounded hover:bg-lime-50"
              >
                Contestar de nuevo
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={revisarRespuestas}
                className="text-gray-600 underline hover:text-gray-800"
              >
                Revisar mis respuestas
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Aviso flotante cuando se restauró progreso guardado */}
      {avisoRecuperado && !verCuestionario && (
        <ToastAviso
          mensaje="Recuperamos tus respuestas guardadas."
          textoAccion="Borrar respuestas y empezar de nuevo"
          onAccion={() => setModalBorrarAbierto(true)}
          onCerrar={() => setAvisoRecuperado(false)}
          pausado={modalBorrarAbierto}
        />
      )}

      {!verCuestionario && (
        <ModalConfirmacion
          abierto={modalBorrarAbierto}
          titulo="¿Borrar tus respuestas?"
          descripcion="Se perderán todas las respuestas guardadas en este navegador y el cuestionario volverá a empezar desde la pregunta 1."
          textoConfirmar="Sí, borrar respuestas"
          onConfirmar={reiniciarCuestionario}
          onCancelar={() => setModalBorrarAbierto(false)}
        />
      )}
    </PageLayout>
  );
};

export default Calculadora;
