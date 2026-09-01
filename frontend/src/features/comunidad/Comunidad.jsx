import React from "react";
import PageLayout from "../../components/layout/PageLayout";
import { noticiasEventos } from "./noticiasEventos";

const Comunidad = () => {
  return (
    <PageLayout>
      {/* Encabezado */}
      <header className="bg-gray-800 text-white text-center p-6">
        <h2 className="text-3xl font-bold">Comunidad EcoCampus</h2>
        <p>Mantente informado sobre eventos y noticias ambientales</p>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow p-6 flex flex-col items-center">
        <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {noticiasEventos.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold text-green-700 mb-1">{item.titulo}</h3>
              <p className="text-sm text-gray-500 italic mb-2">{item.fecha}</p>
              <p className="text-gray-700">{item.descripcion}</p>
              <span className="inline-block mt-3 px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                {item.tipo}
              </span>
            </div>
          ))}
        </section>
      </main>
    </PageLayout>
  );
};

export default Comunidad;
