import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { AUTH_URL, LOGIN_REQUERIDO } from "../../config/experiment";

// Pide login institucional (UCOL) antes de mostrar a los hijos, solo cuando LOGIN_REQUERIDO.
// children recibe el participante pseudonimo: { id, tipo } (o null si no se requiere login).
const LoginGate = ({ children }) => {
  const [estado, setEstado] = useState(LOGIN_REQUERIDO ? "cargando" : "libre");
  const [participante, setParticipante] = useState(null);

  useEffect(() => {
    if (!LOGIN_REQUERIDO) return;
    let cancelado = false;
    fetch(`${AUTH_URL}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((datos) => {
        if (cancelado) return;
        setParticipante(datos.participante);
        setEstado(!datos.authenticated ? "sin-sesion" : datos.permitido ? "autenticado" : "no-permitido");
      })
      .catch(() => !cancelado && setEstado("error"));
    return () => {
      cancelado = true;
    };
  }, []);

  if (estado === "libre" || estado === "autenticado") return children(participante);

  return (
    <PageLayout className="bg-[#f4f1ec]">
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md text-center">
          {estado === "cargando" && <p className="text-gray-600">Verificando sesión...</p>}

          {estado === "sin-sesion" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Inicia sesión para participar</h2>
              <p className="text-gray-600 mb-6">
                Usa tu cuenta institucional de la Universidad de Colima. Solo se guarda un identificador
                anónimo, no tu nombre ni tu correo.
              </p>
              <a
                href={`${AUTH_URL}/login`}
                className="inline-block px-6 py-3 bg-lime-600 text-white text-lg rounded hover:bg-lime-800"
              >
                Iniciar sesión con UCOL
              </a>
            </>
          )}

          {estado === "no-permitido" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Estudio solo para estudiantes</h2>
              <p className="text-gray-600 mb-6">
                Tu cuenta institucional no corresponde a un estudiante de la Universidad de Colima, por lo que
                no puedes participar en esta evaluación.
              </p>
              <a
                href={`${AUTH_URL}/logout`}
                className="inline-block px-6 py-3 border border-lime-600 text-lime-700 text-lg rounded hover:bg-lime-50"
              >
                Cerrar sesión
              </a>
            </>
          )}

          {estado === "error" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">No se pudo verificar tu sesión</h2>
              <p className="text-gray-600 mb-6">El servicio de inicio de sesión no responde. Intenta de nuevo en un momento.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-lime-600 text-lime-700 text-lg rounded hover:bg-lime-50"
              >
                Reintentar
              </button>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginGate;
