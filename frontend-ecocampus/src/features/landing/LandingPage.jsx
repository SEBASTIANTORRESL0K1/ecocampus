import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";

const LandingPage = () => {
  return (
    <PageLayout>
      <main className="flex-grow flex flex-col items-center text-center px-4 py-10">
        {/* Encabezado */}
        <header className="w-full bg-lime-600 text-white py-6 text-center rounded-lg shadow-md">
          <h1 className="text-3xl font-bold">Calcula tu huella ecológica y ayuda al planeta</h1>
          <p className="text-lg mt-2">Conoce tu impacto y ayuda al planeta</p>
          <Link to="/calculadora">
            <button
              className="mt-4 px-6 py-2 bg-indigo-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700">
              Comenzar cálculo
            </button>
          </Link>
        </header>

        {/* Sección de información */}
        <section className="w-11/12 md:w-3/4 bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-xl font-bold text-center text-gray-800">¿Qué es la huella ecológica?</h2>
          <p className="mt-4 text-gray-700 bg-neutral-200 p-4 rounded-lg">
            La huella ecológica es un indicador que mide el impacto de las actividades humanas en el medio ambiente. Evalúa la cantidad de tierra y agua necesarias para producir los recursos que consumimos y absorber los desechos generados.
          </p>
          <p className="mt-4 text-gray-700">
            México tiene una huella ecológica de aproximadamente <span className="font-bold">3.1 hectáreas globales</span> por persona, según datos del WWF. Además, México ocupa el lugar 26 en el ranking de concentración anual de PM2.5, con un promedio de <span className="font-bold">20.1 µg/m³</span>.
          </p>
        </section>
      </main>
    </PageLayout>
  );
};

export default LandingPage;
