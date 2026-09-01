import React from "react";
import PageLayout from "../../components/layout/PageLayout";

const GuiaReciclaje = () => {
  return (
    <PageLayout>
      {/* Encabezado */}
      <header className="bg-gray-800 text-white text-center p-6">
        <h2 className="text-3xl font-bold">Guía de Reciclaje</h2>
        <p className="text-lg">Conoce la importancia del reciclaje y cómo ayudar al planeta</p>
        <a
          href="https://portal.ucol.mx/siga/reforestaccion/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-6 py-2 bg-indigo-500 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 inline-block">
          Conoce más
        </a>
      </header>

      {/* Sección informativa */}
      <section className="bg-emerald-100 p-6 text-center">
        <p className="text-lg text-gray-800">
          El reciclaje es una de las acciones más efectivas para reducir el impacto ambiental y promover un uso más sostenible de los recursos.
        </p>
      </section>

      {/* Principios del reciclaje */}
      <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-6 p-6">
        <div className="bg-emerald-50 p-6 text-center rounded-lg shadow-md w-64">
          <h3 className="text-2xl font-bold text-green-800">1</h3>
          <h4 className="text-xl font-semibold mt-2">Reciclar</h4>
          <p>Convertir materiales usados en nuevos productos.</p>
        </div>
        <div className="bg-emerald-50 p-6 text-center rounded-lg shadow-md w-64">
          <h3 className="text-2xl font-bold text-green-800">2</h3>
          <h4 className="text-xl font-semibold mt-2">Reutilizar</h4>
          <p>Dar nueva vida a productos existentes sin modificarlos.</p>
        </div>
        <div className="bg-emerald-50 p-6 text-center rounded-lg shadow-md w-64">
          <h3 className="text-2xl font-bold text-green-800">3</h3>
          <h4 className="text-xl font-semibold mt-2">Reducir</h4>
          <p>Disminuir el consumo y generación de residuos.</p>
        </div>
      </div>

      {/* Beneficios del reciclaje */}
      <section className="p-6 text-center">
        <h3 className="text-2xl font-bold text-green-800">Beneficios del Reciclaje</h3>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-6 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-md w-64">
            <h4 className="text-lg font-bold text-green-700">Ambientales</h4>
            <p>Menos contaminación, ahorro de agua y energía, y conservación de recursos naturales.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-64">
            <h4 className="text-lg font-bold text-green-700">Económicos</h4>
            <p>Generación de empleo en la industria del reciclaje y reducción de costos de producción.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md w-64">
            <h4 className="text-lg font-bold text-green-700">Sociales</h4>
            <p>Un entorno más limpio y saludable para todos, así como comunidades con educación ambiental.</p>
          </div>
        </div>
      </section>

      {/* Infografía al final */}
      <section className="p-6 text-center bg-white">
        <h3 className="text-2xl font-bold text-lime-800 mb-4">Infografía informativa</h3>
        <div className="flex justify-center">
          <img
            src={process.env.PUBLIC_URL + "/infografia_guia.jpeg"}
            alt="Infografía Guía de Reciclaje"
            className="w-full max-w-4xl rounded-lg shadow-lg"
          />
        </div>
      </section>
    </PageLayout>
  );
};

export default GuiaReciclaje;
