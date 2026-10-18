import { useState } from "react";
import { API_URL } from "../../config/experiment";

// Acceso con solo el correo institucional (backend con REQUIERE_LOGIN=false). No se verifica que el correo
// sea de quien lo escribe; el backend solo comprueba que sea de un dominio permitido.
const AccesoCorreo = ({ alEntrar }) => {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const r = await fetch(`${API_URL}/api/acceso/correo`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      if (r.ok) return alEntrar();
      const datos = await r.json().catch(() => ({}));
      if (datos.error === "correo-invalido") setError("Escribe un correo válido, por ejemplo alumno@ucol.mx.");
      else if (datos.error === "dominio-no-permitido") {
        setError(`Solo se admiten correos de ${(datos.dominios ?? []).map((d) => `@${d}`).join(", ")}.`);
      } else setError("No se pudo iniciar. Intenta de nuevo en un momento.");
    } catch {
      setError("El servicio no responde. Intenta de nuevo en un momento.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">Ingresa tu correo para participar</h2>
      <p className="text-gray-600 mb-6">
        Escribe tu correo institucional de la Universidad de Colima. Se guardará junto con tus respuestas para
        que cada persona participe una sola vez; no se guarda tu nombre ni tu número de cuenta.
      </p>
      <label htmlFor="correo-acceso" className="block text-left text-sm text-gray-700 mb-1">
        Correo institucional
      </label>
      <input
        id="correo-acceso"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="alumno@ucol.mx"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "correo-acceso-error" : undefined}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-lime-600"
      />
      {error && (
        <p id="correo-acceso-error" role="alert" className="text-left text-sm text-red-700 mb-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando || correo.trim() === ""}
        className="px-6 py-3 bg-lime-600 text-white text-lg rounded hover:bg-lime-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enviando ? "Entrando..." : "Continuar"}
      </button>
    </form>
  );
};

export default AccesoCorreo;
