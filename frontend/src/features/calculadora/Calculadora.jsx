import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import { preguntasHuellaEcologica, calcularHuellaEcologica } from "./preguntas";

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
        pasos.push({ tipo: "habitantesHogar", seccionTitulo: seccion.titulo });
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
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState({ habitantesHogar: 1 });
  const [verResultado, setVerResultado] = useState(false);
  const [resultado, setResultado] = useState(null);

  const paso = pasos[pasoActual];

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
    setRespuestas({ ...respuestas, detalle21: detalle, 21: total });
  };

  const actualizarCantidadCelulares = (cantidad) => {
    const n = Math.max(0, Number(cantidad) || 0);
    setRespuestas({ ...respuestas, cantidadCelulares: n, 24: n * 76 });
  };

  const actualizarGrupo25 = (nombreGrupo, valor) => {
    const detalle = { ...(respuestas.detalle25 || {}), [nombreGrupo]: valor };
    const total = Object.values(detalle).reduce((acc, v) => acc + (Number(v) || 0), 0);
    setRespuestas({ ...respuestas, detalle25: detalle, 25: total });
  };

  const actualizarHabitantesHogar = (n) => {
    setRespuestas({ ...respuestas, habitantesHogar: Math.max(1, Number(n) || 1) });
  };

  const handleSiguiente = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      setResultado(calcularHuellaEcologica(respuestas));
      setVerResultado(true);
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 0) setPasoActual(pasoActual - 1);
  };

  return (
    <PageLayout className="bg-[#f4f1ec]">
      {/* Barra de progreso */}
      {!verResultado && (
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
      {!verResultado && (
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
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
                  <label className="text-sm text-gray-600">Número de celulares</label>
                  <input
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

            {/* Botones de navegación */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handleAnterior}
                disabled={pasoActual === 0}
                className="px-4 py-2 bg-black-200 text-black-700 rounded hover:bg-black-300 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={handleSiguiente}
                className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-700"
              >
                {pasoActual < pasos.length - 1 ? "Siguiente" : "Finalizar"}
              </button>
            </div>
          </div>
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
              {resultado.interpretacion.planetasMax !== null && (
                <>
                  {" "}
                  ≈{" "}
                  <span className="font-bold text-lime-700 text-3xl">
                    {resultado.interpretacion.planetasMax}
                  </span>{" "}
                  planetas
                </>
              )}
            </p>

            <p className="mt-4 text-xl text-gray-800">{resultado.interpretacion.mensaje}</p>

            <p className="mt-6 text-lg text-gray-600">
              (Esto es una aproximación basada en tus respuestas, según la metodología de
              Ibarra-Cisneros &amp; Monroy-Ata, 2014.)
            </p>

            <div className="mt-8">
              <Link
                to="/"
                className="px-6 py-3 bg-lime-600 text-white text-xl rounded hover:bg-lime-800"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Calculadora;
