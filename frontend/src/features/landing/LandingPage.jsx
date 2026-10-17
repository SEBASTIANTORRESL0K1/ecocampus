import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";

const tools = [
  {
    icon: "🌱",
    name: "Calculadora",
    description: "Mide tu huella ecológica personal",
    to: "/calculadora",
  },
  {
    icon: "🗺️",
    name: "Mapa interactivo",
    description: "Visualiza el impacto ambiental en tu zona",
    to: "/mapa",
  },
  {
    icon: "🤝",
    name: "Comunidad",
    description: "Comparte y aprende con otros usuarios",
    to: "/comunidad",
  },
  {
    icon: "♻️",
    name: "Guía de reciclaje",
    description: "Aprende a reducir y gestionar tus residuos",
    to: "/guia-reciclaje",
  },
];

const LandingPage = () => {
  return (
    <PageLayout>
      <main>
        {/* ── Hero ── */}
        <section
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/ecocampus/1920/600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              background: "rgba(34,85,44,0.65)",
              minHeight: "100dvh",
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
              Plataforma ambiental universitaria
            </p>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.02em",
                textWrap: "balance",
                margin: "0 0 1rem",
                lineHeight: 1.1,
              }}
            >
              Calcula tu huella ecológica
            </h1>
            <p
              style={{
                color: "#d4ead9",
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                textAlign: "center",
                maxWidth: "520px",
                marginBottom: "2rem",
                textWrap: "balance",
              }}
            >
              Conoce tu impacto ambiental y actúa hoy
            </p>
            <Link to="/calculadora">
              <button
                style={{
                  background: "#2d6a2d",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.85rem 2.5rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
                  boxShadow: "0 4px 14px rgba(45,106,45,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1e4d1e";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(45,106,45,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2d6a2d";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(45,106,45,0.4)";
                }}
              >
                Comenzar cálculo
              </button>
            </Link>
          </div>
        </section>

        {/* ── Welcome / About ── */}
        <section
          style={{
            background: "#ffffff",
            padding: "5rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
            className="landing-about-grid"
          >
            {/* Left: text */}
            <div>
              <p
                style={{
                  fontStyle: "italic",
                  color: "#4a7c59",
                  fontSize: "1.05rem",
                  marginBottom: "0.4rem",
                }}
              >
                Bienvenido a EcoCampus
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#1a2e1a",
                  margin: "0 0 1rem",
                  textWrap: "balance",
                  lineHeight: 1.2,
                }}
              >
                ¿Qué es la huella ecológica?
              </h2>
              {/* Decorative leaf divider */}
              <div
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "1.25rem",
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                🌿
              </div>
              <p
                style={{
                  color: "#3a4a3a",
                  lineHeight: 1.75,
                  marginBottom: "1.25rem",
                  fontSize: "1rem",
                }}
              >
                La huella ecológica es un indicador que mide el impacto de las
                actividades humanas en el medio ambiente. Evalúa la cantidad de
                tierra y agua necesarias para producir los recursos que
                consumimos y absorber los desechos generados.
              </p>
              <p
                style={{
                  color: "#3a4a3a",
                  lineHeight: 1.75,
                  fontSize: "1rem",
                }}
              >
                México tiene una huella ecológica de aproximadamente{" "}
                <strong style={{ color: "#2d6a2d" }}>3.1 hectáreas globales</strong>{" "}
                por persona, según datos del WWF. Además, México ocupa el lugar
                26 en el ranking de concentración anual de PM2.5, con un
                promedio de{" "}
                <strong style={{ color: "#2d6a2d" }}>20.1 µg/m³</strong>.
              </p>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  marginTop: "2rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#4a7c59",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    3.1
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6a8a6a",
                      margin: "0.3rem 0 0",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    ha globales / persona
                  </p>
                </div>
                <div
                  style={{
                    width: "1px",
                    background: "#d0e4d0",
                    alignSelf: "stretch",
                  }}
                  aria-hidden="true"
                />
                <div>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#4a7c59",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    20.1
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6a8a6a",
                      margin: "0.3rem 0 0",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    µg/m³ PM2.5
                  </p>
                </div>
              </div>
            </div>

            {/* Right: image */}
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(34,85,44,0.15)",
              }}
            >
              <img
                src="https://picsum.photos/seed/campo/800/600"
                alt="Campo natural con vegetación"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section
          style={{
            background: "#f7f9f4",
            padding: "5rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* Heading */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p
                style={{
                  fontStyle: "italic",
                  color: "#4a7c59",
                  fontSize: "1.05rem",
                  marginBottom: "0.4rem",
                }}
              >
                Todo lo que necesitas
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#1a2e1a",
                  margin: "0 0 0.5rem",
                  textWrap: "balance",
                }}
              >
                Nuestras herramientas
              </h2>
              <div
                style={{ fontSize: "1.6rem", marginTop: "0.5rem" }}
                aria-hidden="true"
              >
                🌿
              </div>
            </div>

            {/* Cards grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {tools.map((tool) => (
                <Link
                  key={tool.to}
                  to={tool.to}
                  style={{ textDecoration: "none" }}
                >
                  <article
                    style={{
                      background: "#ffffff",
                      borderRadius: "8px",
                      padding: "2rem 1.5rem",
                      textAlign: "center",
                      boxShadow: "0 2px 12px rgba(34,85,44,0.08)",
                      transition: "transform 200ms ease, box-shadow 200ms ease",
                      cursor: "pointer",
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
                    {/* Icon circle */}
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "#e8f4ec",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.75rem",
                        margin: "0 auto 1rem",
                      }}
                      aria-hidden="true"
                    >
                      {tool.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#1a2e1a",
                        margin: "0 0 0.5rem",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {tool.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: "#5a7a5a",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {tool.description}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .landing-about-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default LandingPage;
