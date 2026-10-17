import React from "react";
import { Calendar, Newspaper, CalendarDays } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { noticiasEventos } from "./noticiasEventos";

const badgeIcon = (tipo) => {
  if (tipo === "Noticia") return <Newspaper size={14} color="#2d6a2d" strokeWidth={1.5} aria-hidden="true" />;
  return <CalendarDays size={14} color="#2d6a2d" strokeWidth={1.5} aria-hidden="true" />;
};

const Comunidad = () => {
  return (
    <PageLayout>
      <main>
        {/* ── Hero ── */}
        <section
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/comunidad/1920/600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              background: "rgba(34,85,44,0.65)",
              minHeight: "42vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 1.5rem",
            }}
          >
            <p
              style={{
                fontStyle: "italic",
                color: "#b8e0c8",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                letterSpacing: "0.05em",
              }}
            >
              Noticias y eventos ambientales
            </p>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "clamp(2rem, 5vw, 3.8rem)",
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.02em",
                textWrap: "balance",
                margin: "0 0 1rem",
                lineHeight: 1.1,
              }}
            >
              Comunidad EcoCampus
            </h1>
            <p
              style={{
                fontStyle: "italic",
                color: "#d4ead9",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                textAlign: "center",
                maxWidth: "520px",
                textWrap: "balance",
                margin: 0,
              }}
            >
              Mantente informado sobre eventos y noticias ambientales
            </p>
          </div>
        </section>

        {/* ── Cards grid ── */}
        <section
          style={{
            background: "#f7f9f4",
            padding: "4rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
              className="comunidad-cards-grid"
            >
              {noticiasEventos.map((item) => (
                <article
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    padding: "1.75rem",
                    boxShadow: "0 2px 12px rgba(34,85,44,0.08)",
                    transition: "transform 200ms ease, box-shadow 200ms ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 28px rgba(34,85,44,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 12px rgba(34,85,44,0.08)";
                  }}
                >
                  {/* Badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: "#e8f4ec",
                      color: "#2d6a2d",
                      borderRadius: "999px",
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      marginBottom: "0.9rem",
                    }}
                  >
                    {badgeIcon(item.tipo)}
                    {item.tipo}
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#2d6a2d",
                      margin: "0 0 0.4rem",
                      lineHeight: 1.3,
                      textWrap: "balance",
                    }}
                  >
                    {item.titulo}
                  </h2>

                  {/* Date */}
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.85rem",
                      color: "#6a8a6a",
                      fontStyle: "italic",
                      margin: "0 0 0.85rem",
                    }}
                  >
                    <Calendar size={14} color="#6a8a6a" strokeWidth={1.5} aria-hidden="true" />
                    {item.fecha}
                  </p>

                  {/* Description */}
                  <p
                    style={{
                      color: "#3a4a3a",
                      lineHeight: 1.65,
                      fontSize: "0.95rem",
                      margin: 0,
                    }}
                  >
                    {item.descripcion}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .comunidad-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default Comunidad;
