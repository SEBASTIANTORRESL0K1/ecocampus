import { useEffect, useId, useRef } from "react";
import { TriangleAlert } from "lucide-react";

const SELECTOR_ENFOCABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Diálogo modal de confirmación sobre el elemento nativo <dialog>:
//  - showModal() lo pone en la capa superior y vuelve inerte el resto de la página.
//  - El estado `abierto` del padre es la fuente de verdad: Escape (evento
//    `cancel`) y el clic en el fondo solo llaman a onCancelar.
//  - Al abrir enfoca "Cancelar"; Tab / Shift+Tab rotan entre los botones.
//  - Al cerrar el foco vuelve al disparador y se libera el scroll del body.
//  - La entrada y salida usan transiciones CSS discretas (@starting-style),
//    así el diálogo se cierra de inmediato sin esperar temporizadores.
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
  const abiertoRef = useRef(abierto);
  abiertoRef.current = abierto;
  const onCancelarRef = useRef(onCancelar);
  onCancelarRef.current = onCancelar;

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!abierto || !dialogo) return undefined;

    // Escape: se cancela el cierre nativo y se delega en el estado del padre.
    const alCancelar = (e) => {
      e.preventDefault();
      onCancelarRef.current();
    };
    // Si el navegador cerró el diálogo por su cuenta, se sincroniza el estado.
    const alCerrar = () => {
      if (abiertoRef.current) onCancelarRef.current();
    };
    // El contenido está en un div interno, así que target === dialog solo
    // ocurre al hacer clic en el fondo (::backdrop). Su equivalente de teclado es Escape.
    const alHacerClic = (e) => {
      if (e.target === dialogo) onCancelarRef.current();
    };
    // Mantiene Tab / Shift+Tab dentro del diálogo (sin saltar a la barra del navegador).
    const alPresionarTecla = (e) => {
      if (e.key !== "Tab") return;
      const enfocables = Array.from(dialogo.querySelectorAll(SELECTOR_ENFOCABLES));
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables.at(-1);
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    // Eventos propios del <dialog> nativo, registrados mientras está abierto.
    dialogo.addEventListener("cancel", alCancelar);
    dialogo.addEventListener("close", alCerrar);
    dialogo.addEventListener("click", alHacerClic);
    dialogo.addEventListener("keydown", alPresionarTecla);

    const disparador = document.activeElement;
    if (!dialogo.open) dialogo.showModal();
    cancelarRef.current?.focus();
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      dialogo.removeEventListener("cancel", alCancelar);
      dialogo.removeEventListener("close", alCerrar);
      dialogo.removeEventListener("click", alHacerClic);
      dialogo.removeEventListener("keydown", alPresionarTecla);
      document.body.style.overflow = overflowPrevio;
      if (dialogo.open) dialogo.close();
      if (disparador?.isConnected) disparador.focus?.();
    };
  }, [abierto]);

  return (
    <dialog
      ref={dialogoRef}
      aria-labelledby={idTitulo}
      aria-describedby={idDescripcion}
      className="m-auto w-[calc(100%-2rem)] max-w-md p-0 bg-white rounded-md shadow-xl
      opacity-0 scale-95 transition-all transition-discrete duration-200 ease-out
      open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-95
      backdrop:bg-black/50 backdrop:opacity-0 backdrop:transition-all backdrop:transition-discrete backdrop:duration-200
      open:backdrop:opacity-100 starting:open:backdrop:opacity-0
      motion-reduce:transition-none motion-reduce:backdrop:transition-none"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <TriangleAlert aria-hidden="true" className="shrink-0 w-6 h-6 text-red-700" />
          <h2 id={idTitulo} className="text-xl font-bold text-gray-900">
            {titulo}
          </h2>
        </div>
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
    </dialog>
  );
};

export default ModalConfirmacion;
