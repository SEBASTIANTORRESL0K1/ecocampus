import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import AccesoCorreo from "./AccesoCorreo";
import AvisoPrivacidad from "./AvisoPrivacidad";
import { API_URL, LOGIN_REQUERIDO } from "../../config/experiment";

// Pide acceso antes de mostrar a los hijos, solo cuando LOGIN_REQUERIDO. El backend decide el modo
// (/api/me -> modoAcceso): "saml" = login institucional de la UCOL, "correo" = solo el correo.
// La identidad se lee de la sesion en el servidor; el navegador no recibe correo ni cuenta.
const LoginGate = ({ children }) => {
  const [estado, setEstado] = useState(LOGIN_REQUERIDO ? "cargando" : "libre");
  const [modo, setModo] = useState("saml");
  const [privacidadAceptada, setPrivacidadAceptada] = useState(false);

  useEffect(() => {
    if (!LOGIN_REQUERIDO) return;
    let cancelado = false;
    fetch(`${API_URL}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((datos) => {
        if (cancelado) return;
        setModo(datos.modoAcceso === "correo" ? "correo" : "saml");
        setEstado(!datos.authenticated ? "sin-sesion" : datos.permitido ? "autenticado" : "no-permitido");
      })
      .catch(() => !cancelado && setEstado("error"));
    return () => {
      cancelado = true;
    };
  }, []);

  if (estado === "libre" || estado === "autenticado") return children;

  return (
    <PageLayout className="bg-[#f4f1ec]">
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg text-center">
          {estado === "cargando" && <p className="text-gray-600">Verificando sesión...</p>}

          {estado === "sin-sesion" && modo === "correo" && <AccesoCorreo alEntrar={() => setEstado("autenticado")} />}

          {estado === "sin-sesion" && modo === "saml" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Inicia sesión para participar</h2>
              <p className="text-gray-600 mb-6">
                Usa tu cuenta institucional de la Universidad de Colima. Tu correo institucional se guardará
                junto con tus respuestas; no se guarda tu nombre ni tu número de cuenta.
              </p>
              <AvisoPrivacidad aceptado={privacidadAceptada} onChange={setPrivacidadAceptada} />
              <div className={`transition-opacity duration-200 ${!privacidadAceptada ? "opacity-50 pointer-events-none" : ""}`}>
                <a
                  href={`${API_URL}/login`}
                  tabIndex={privacidadAceptada ? 0 : -1}
                  aria-disabled={!privacidadAceptada}
                  className="inline-block px-6 py-3 bg-lime-600 text-white text-lg rounded hover:bg-lime-800"
                >
                  Iniciar sesión con UCOL
                </a>
              </div>
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
                href={`${API_URL}/logout`}
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
