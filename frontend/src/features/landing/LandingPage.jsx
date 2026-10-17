import React from "react";
import { Link } from "react-router-dom";
import { Sprout, Map, Users, Recycle, Leaf } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import PageHero from "../../components/ui/PageHero";
import CtaButton from "../../components/ui/CtaButton";
import SectionWrapper from "../../components/ui/SectionWrapper";
import SectionHeading from "../../components/ui/SectionHeading";
import FeatureCard from "../../components/ui/FeatureCard";
import IconCircle from "../../components/ui/IconCircle";

const tools = [
  {
    Icon: Sprout,
    name: "Calculadora",
    description: "Mide tu huella ecológica personal",
    to: "/calculadora",
  },
  {
    Icon: Map,
    name: "Mapa interactivo",
    description: "Visualiza el impacto ambiental en tu zona",
    to: "/mapa",
  },
  {
    Icon: Users,
    name: "Comunidad",
    description: "Comparte y aprende con otros usuarios",
    to: "/comunidad",
  },
  {
    Icon: Recycle,
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
        <PageHero
          backgroundSeed="ecocampus"
          eyebrow="Plataforma ambiental universitaria"
          title="Calcula tu huella ecológica"
          description="Conoce tu impacto ambiental y actúa hoy"
          minHeight="100dvh"
          cta={
            <Link to="/calculadora">
              <CtaButton>Comenzar cálculo</CtaButton>
            </Link>
          }
        />

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
                  marginBottom: "1.25rem",
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                <Leaf size={28} color="#4a7c59" />
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
                      color: "#5a7a5a",
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
                      color: "#5a7a5a",
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
        <SectionWrapper background="var(--color-section-alt)">
          <SectionHeading eyebrow="Todo lo que necesitas" title="Nuestras herramientas" />

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
                <FeatureCard cursor="pointer">
                  <IconCircle Icon={tool.Icon} />
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
                </FeatureCard>
              </Link>
            ))}
          </div>
        </SectionWrapper>
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
