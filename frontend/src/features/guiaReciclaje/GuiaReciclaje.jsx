import React from "react";
import { RefreshCw, Repeat, TrendingDown, Leaf, DollarSign, Users } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";

const principles = [
  {
    number: "1",
    name: "Reciclar",
    description: "Convertir materiales usados en nuevos productos.",
    Icon: RefreshCw,
  },
  {
    number: "2",
    name: "Reutilizar",
    description: "Dar nueva vida a productos existentes sin modificarlos.",
    Icon: Repeat,
  },
  {
    number: "3",
    name: "Reducir",
    description: "Disminuir el consumo y generación de residuos.",
    Icon: TrendingDown,
  },
];

const benefits = [
  {
    name: "Ambientales",
    description:
      "Menos contaminación, ahorro de agua y energía, y conservación de recursos naturales.",
    Icon: Leaf,
  },
  {
    name: "Económicos",
    description:
      "Generación de empleo en la industria del reciclaje y reducción de costos de producción.",
    Icon: DollarSign,
  },
  {
    name: "Sociales",
    description:
      "Un entorno más limpio y saludable para todos, así como comunidades con educación ambiental.",
    Icon: Users,
  },
];

const GuiaReciclaje = () => {
  return (
    <PageLayout>
      <main>
        {/* ── Hero ── */}
        <section
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/reciclaje/1920/600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              background: "rgba(34,85,44,0.65)",
              minHeight: "60dvh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 1.5rem",
              textAlign: "center",
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
                letterSpacing: "0.02em",
                textWrap: "balance",
                margin: "0 0 1rem",
                lineHeight: 1.1,
              }}
            >
              Guía de Reciclaje
            </h1>
            <p
              style={{
                color: "#d4ead9",
                fontStyle: "italic",
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                maxWidth: "520px",
                marginBottom: "2rem",
                textWrap: "balance",
              }}
            >
              Conoce la importancia del reciclaje y cómo ayudar al planeta
            </p>
            <a
              href="https://portal.ucol.mx/siga/reforestaccion/"
              target="_blank"
              rel="noopener noreferrer"
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
                textDecoration: "none",
                display: "inline-block",
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
              Conoce más
            </a>
          </div>
        </section>

        {/* ── Banner intro ── */}
        <section
          style={{
            background: "#f7f9f4",
            padding: "3.5rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1rem",
            }}
          >
            <div aria-hidden="true">
              <Leaf size={32} color="#4a7c59" />
            </div>
            <p
              style={{
                color: "#3a4a3a",
                lineHeight: 1.75,
                fontSize: "clamp(1rem, 2vw, 1.15rem)",
                textWrap: "balance",
              }}
            >
              El reciclaje es una de las acciones más efectivas para reducir el
              impacto ambiental y promover un uso más sostenible de los recursos.
              Cada residuo correctamente gestionado es un paso hacia un campus
              más limpio y un planeta más saludable.
            </p>
          </div>
        </section>

        {/* ── Las 3 R's ── */}
        <section
          style={{
            background: "#ffffff",
            padding: "5rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p
                style={{
                  fontStyle: "italic",
                  color: "#4a7c59",
                  fontSize: "1.05rem",
                  marginBottom: "0.4rem",
                }}
              >
                Principios fundamentales
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
                Las 3 R's del reciclaje
              </h2>
              <div
                style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}
                aria-hidden="true"
              >
                <Leaf size={24} color="#4a7c59" />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {principles.map((p) => (
                <article
                  key={p.name}
                  style={{
                    background: "#e8f4ec",
                    borderRadius: "8px",
                    padding: "2rem 1.5rem",
                    textAlign: "center",
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
                  <p
                    style={{
                      fontSize: "3rem",
                      fontWeight: 700,
                      color: "#2d6a2d",
                      margin: "0 0 0.5rem",
                      lineHeight: 1,
                    }}
                  >
                    {p.number}
                  </p>
                  <div
                    style={{ marginBottom: "0.75rem" }}
                    aria-hidden="true"
                  >
                    <p.Icon size={28} color="#4a7c59" strokeWidth={1.5} />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#1a2e1a",
                      margin: "0 0 0.5rem",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#3a4a3a",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {p.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Beneficios ── */}
        <section
          style={{
            background: "#f7f9f4",
            padding: "5rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p
                style={{
                  fontStyle: "italic",
                  color: "#4a7c59",
                  fontSize: "1.05rem",
                  marginBottom: "0.4rem",
                }}
              >
                ¿Por qué reciclar?
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
                Beneficios del reciclaje
              </h2>
              <div
                style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}
                aria-hidden="true"
              >
                <Leaf size={24} color="#4a7c59" />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {benefits.map((b) => (
                <article
                  key={b.name}
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    padding: "2rem 1.5rem",
                    textAlign: "center",
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
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "#e8f4ec",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                    aria-hidden="true"
                  >
                    <b.Icon size={28} color="#4a7c59" strokeWidth={1.5} />
                  </div>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#1a2e1a",
                      margin: "0 0 0.5rem",
                    }}
                  >
                    {b.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#3a4a3a",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {b.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Infografía ── */}
        <section
          style={{
            background: "#ffffff",
            padding: "5rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1a2e1a",
                margin: "0 0 2rem",
                textWrap: "balance",
              }}
            >
              Infografía informativa
            </h2>
            <img
              src={`${import.meta.env.BASE_URL}infografia_guia.jpeg`}
              alt="Infografía Guía de Reciclaje"
              style={{
                width: "100%",
                maxWidth: "896px",
                margin: "0 auto",
                display: "block",
                borderRadius: "8px",
                boxShadow: "0 8px 28px rgba(34,85,44,0.15)",
              }}
            />
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default GuiaReciclaje;
