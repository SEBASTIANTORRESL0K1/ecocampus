import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "../../components/layout/PageLayout";
import { puntosReciclaje } from "./puntosReciclaje";
import { customIcon } from "./customIcon";

const Mapa = () => {
  const posicionCampus = [19.249437, -103.698893]; // Coordenadas del Campus Central

  return (
    <PageLayout>
      <main className="flex-grow flex flex-col items-center text-center px-4 py-10">
        <h1 className="text-3xl font-bold mt-6">Mapa de Puntos de Reciclaje</h1>
        <p className="text-lg text-gray-700">Ubicación de los depósitos de reciclaje en el Campus</p>

        <MapContainer center={posicionCampus} zoom={17} className="w-11/12 h-[500px] mt-6 rounded-lg shadow-lg">
          {/* Capa de mapa */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Agregar marcadores con el ícono personalizado */}
          {puntosReciclaje.map((punto) => (
            <Marker key={punto.id} position={punto.coordenadas} icon={customIcon}>
              <Popup>
                <div className="text-center">
                  <h2 className="font-bold text-lg">{punto.nombre}</h2>
                  <img src={process.env.PUBLIC_URL + punto.imagen} alt={punto.nombre} className="w-40 h-32 object-cover rounded-lg mt-2" />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </PageLayout>
  );
};

export default Mapa;
