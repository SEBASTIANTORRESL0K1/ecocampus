import { useEffect, useId, useRef, useState } from "react";

const DURACION_TRANSICION = 200;
const SELECTOR_ENFOCABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Diálogo modal de confirmación accesible:
//  - role="dialog" + aria-modal, con título y descripción enlazados.
//  - Al abrir enfoca "Cancelar"; Tab / Shift+Tab quedan atrapados dentro.
//  - Escape o clic en el fondo cancelan; al cerrar el foco vuelve al disparador.
//  - Bloquea el scroll del body mientras está abierto.
const ModalConfirmacion = ({
  abierto,
  titulo,
  descripcion,
  textoConfirmar,
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) => {
  const idTitulo = useId();
  const idDescripcion = useId();
  const dialogoRef = useRef(null);
  const cancelarRef = useRef(null);
  const disparadorRef = useRef(null);
  const onCancelarRef = useRef(onCancelar);
  onCancelarRef.current = onCancelar;

  // `montado` mantiene el modal en el DOM durante la transición de salida.
  const [montado, setMontado] = useState(abierto);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (abierto) {
      setMontado(true);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }
    setVisible(false);
    const t = setTimeout(() => setMontado(false), DURACION_TRANSICION);
    return () => clearTimeout(t);
  }, [abierto]);

  // Foco inicial, bloqueo de scroll y retorno del foco al cerrar.
  useEffect(() => {
    if (!abierto) return undefined;
    disparadorRef.current = document.activeElement;
    cancelarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
      const disparador = disparadorRef.current;
      if (disparador && disparador.isConnected && typeof disparador.focus === "function") {
        disparador.focus();
      }
    };
  }, [abierto]);

  // Escape cierra y Tab queda atrapado dentro del diálogo.
  useEffect(() => {
    if (!abierto) return undefined;
    const alPresionarTecla = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancelarRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !dialogoRef.current) return;
      const enfocables = Array.from(dialogoRef.current.querySelectorAll(SELECTOR_ENFOCABLES));
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const dentro = dialogoRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primero || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [abierto]);

  if (!abierto && !montado) return null;

  return (
    <div
      // Durante la salida queda oculto para tecnologías de asistencia.
      aria-hidden={abierto ? undefined : true}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50
      transition-opacity duration-200 motion-reduce:transition-none
      ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        className={`bg-white rounded-md shadow-xl w-full max-w-md p-6
        transition-all duration-200 ease-out motion-reduce:transition-none
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <h2 id={idTitulo} className="text-xl font-bold text-gray-900">
          {titulo}
        </h2>
        <p id={idDescripcion} className="mt-3 text-base text-gray-700">
          {descripcion}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            ref={cancelarRef}
            onClick={onCancelar}
            className="min-h-12 px-5 text-base font-semibold text-gray-800 bg-white border-2 border-gray-400 rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            className="min-h-12 px-5 text-base font-semibold text-white bg-red-700 rounded-md hover:bg-red-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
