import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

const DURACION_SALIDA = 300;

// Aviso flotante (toast) que aparece con una transición, se cierra solo tras
// `duracion` ms y avisa al padre con `onCerrar` cuando ya terminó de ocultarse.
// El temporizador se pausa mientras el cursor o el foco están dentro del aviso,
// o mientras `pausado` es verdadero (por ejemplo, con un modal abierto).
const ToastAviso = ({ mensaje, textoAccion, onAccion, onCerrar, duracion = 5000, pausado = false }) => {
  const [entrado, setEntrado] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [conCursor, setConCursor] = useState(false);
  const [conFoco, setConFoco] = useState(false);
  const contenedorRef = useRef(null);
  const restanteRef = useRef(duracion);
  const onCerrarRef = useRef(onCerrar);
  onCerrarRef.current = onCerrar;

  const detenido = pausado || conCursor || conFoco;

  // Entrada: un tick después de montar para que se vea la transición.
  useEffect(() => {
    const t = setTimeout(() => setEntrado(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Pausa por cursor y por foco: escuchas nativas sobre el contenedor, que no
  // es un control (el foco lo reciben sus botones; focusin/focusout burbujean).
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return undefined;
    const alEntrar = () => setConCursor(true);
    const alSalir = () => setConCursor(false);
    const alEnfocar = () => setConFoco(true);
    const alDesenfocar = (e) => {
      if (!contenedor.contains(e.relatedTarget)) setConFoco(false);
    };
    contenedor.addEventListener("mouseenter", alEntrar);
    contenedor.addEventListener("mouseleave", alSalir);
    contenedor.addEventListener("focusin", alEnfocar);
    contenedor.addEventListener("focusout", alDesenfocar);
    return () => {
      contenedor.removeEventListener("mouseenter", alEntrar);
      contenedor.removeEventListener("mouseleave", alSalir);
      contenedor.removeEventListener("focusin", alEnfocar);
      contenedor.removeEventListener("focusout", alDesenfocar);
    };
  }, []);

  // Cuenta regresiva que conserva el tiempo restante entre pausas.
  useEffect(() => {
    if (saliendo || detenido) return undefined;
    const inicio = Date.now();
    const t = setTimeout(() => setSaliendo(true), restanteRef.current);
    return () => {
      clearTimeout(t);
      restanteRef.current = Math.max(0, restanteRef.current - (Date.now() - inicio));
    };
  }, [saliendo, detenido]);

  // Salida: espera a que termine la transición antes de desmontar.
  useEffect(() => {
    if (!saliendo) return undefined;
    const t = setTimeout(() => onCerrarRef.current?.(), DURACION_SALIDA);
    return () => clearTimeout(t);
  }, [saliendo]);

  const visible = entrado && !saliendo;

  return (
    // El contenedor solo pausa el temporizador; el anuncio vive en role="status".
    <div
      ref={contenedorRef}
      // Arriba a la derecha, debajo del navbar (80 px en móvil, 68 px en escritorio).
      // En móvil entra desde arriba; desde sm entra desde la derecha.
      className={`fixed z-40 inset-x-4 top-24 sm:inset-x-auto sm:right-6 sm:w-96
      bg-white border-l-4 border-[#4a7c59] rounded-md shadow-xl p-4
      transition-all duration-300 ease-out motion-reduce:transition-none
      ${visible
        ? "opacity-100 translate-x-0 translate-y-0"
        : "opacity-0 -translate-y-4 sm:translate-y-0 sm:translate-x-8"}`}
    >
      <div className="flex items-start gap-3">
        <RotateCcw aria-hidden="true" className="shrink-0 w-5 h-5 mt-0.5 text-[#4a7c59]" />
        <p role="status" aria-live="polite" className="flex-grow text-base text-gray-800 font-medium">
          {mensaje}
        </p>
        <button
          onClick={() => setSaliendo(true)}
          aria-label="Cerrar aviso"
          className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59]"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </div>
      {textoAccion && (
        <button
          onClick={onAccion}
          className="mt-2 min-h-11 text-base font-semibold text-[#2d6a2d] underline hover:text-[#1e4d1e] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59]"
        >
          {textoAccion}
        </button>
      )}
    </div>
  );
};

export default ToastAviso;
