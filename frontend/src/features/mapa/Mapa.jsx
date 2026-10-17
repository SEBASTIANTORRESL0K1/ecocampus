import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { puntosReciclaje } from "./puntosReciclaje";
import { customIcon } from "./customIcon";

const Mapa = () => {
  const posicionCampus = [19.249437, -103.698893];

  return (
    <PageLayout>
      <main>
        {/* ── Hero compacto ── */}
        <section
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/campusmapa/1920/400')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(34,85,44,0.7)",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1.5rem",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                color: "#ffffff",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                letterSpacing: "0.02em",
                margin: "0 0 0.75rem",
                lineHeight: 1.1,
              }}
            >
              Mapa de Reciclaje
            </h1>
            <p
              style={{
                fontStyle: "italic",
                color: "#d4ead9",
                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                maxWidth: "540px",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Localiza los contenedores en el Campus Central de la Universidad de Colima
            </p>
          </div>
        </section>

        {/* ── Contador de puntos ── */}
        <section
          style={{
            background: "#f7f9f4",
            padding: "1.25rem 1.5rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#2d6a2d",
              fontSize: "1rem",
              fontWeight: 600,
              margin: 0,
            }}
          >
            <MapPin size={18} color="#4a7c59" aria-hidden="true" />
            21 puntos de reciclaje en el campus
          </p>
        </section>

        {/* ── Mapa ── */}
        <section
          style={{
            background: "#ffffff",
            padding: "2.5rem 1.5rem 3rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1100px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(34,85,44,0.15)",
              height: "520px",
            }}
          >
            <MapContainer
              center={posicionCampus}
              zoom={17}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {puntosReciclaje.map((punto) => (
                <Marker key={punto.id} position={punto.coordenadas} icon={customIcon}>
                  <Popup>
                    <div className="text-center">
                      <h2 className="font-bold text-lg">{punto.nombre}</h2>
                      <img
                        src={`${import.meta.env.BASE_URL}${punto.imagen.slice(1)}`}
                        alt={punto.nombre}
                        className="w-40 h-32 object-cover rounded-lg mt-2"
                      />
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Mapa;
