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
import useScrollReveal from "../../hooks/useScrollReveal";
import { cardHoverLink } from "../../utils/cardHover";
import "../../styles/scroll-animations.css";

const tools = [
  {
    Icon: Sprout,
    name: "Calculadora",
    description: "Mide tu huella ecológica personal",
    to: "/calculadora",
    bgImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDuHhA7Tq-lPpA3Islk-iNypGt2qKXdCxK3o7pLCxU9g0EH3hn5AiJY8-g&s=10",
  },
  {
    Icon: Map,
    name: "Mapa interactivo",
    description: "Localiza puntos de reciclaje en tu zona",
    to: "/mapa",
    bgImage: "https://images.pexels.com/photos/19507080/pexels-photo-19507080.jpeg?cs=srgb&dl=pexels-rndiid-19507080.jpg&fm=jpg",
  },
  {
    Icon: Users,
    name: "Comunidad",
    description: "Comparte y aprende con otros usuarios",
    to: "/comunidad",
    bgImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVjaWNsYXJ8ZW58MHx8MHx8fDA%3D",
  },
  {
    Icon: Recycle,
    name: "Guía de reciclaje",
    description: "Aprende a reducir y gestionar tus residuos",
    to: "/guia-reciclaje",
    bgImage: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVjaWNsYXJ8ZW58MHx8MHx8fDA%3D",
  },
];

const LandingPage = () => {
  /* ── About section refs ── */
  const { ref: aboutTextRef, isVisible: aboutTextVisible } = useScrollReveal();
  const { ref: aboutRightRef, isVisible: aboutRightVisible } = useScrollReveal();
  const { ref: stat0Ref, isVisible: stat0Visible } = useScrollReveal();
  const { ref: stat1Ref, isVisible: stat1Visible } = useScrollReveal();

  /* ── Tools section refs ── */
  const { ref: toolsHeadingRef, isVisible: toolsHeadingVisible } = useScrollReveal();
  const { ref: card0Ref, isVisible: card0Visible } = useScrollReveal();
  const { ref: card1Ref, isVisible: card1Visible } = useScrollReveal();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollReveal();
  const { ref: card3Ref, isVisible: card3Visible } = useScrollReveal();

  /* Map card refs so we can index into them during render */
  const cardReveal = [
    { ref: card0Ref, visible: card0Visible },
    { ref: card1Ref, visible: card1Visible },
    { ref: card2Ref, visible: card2Visible },
    { ref: card3Ref, visible: card3Visible },
  ];

  return (
    <PageLayout navTransparent>
      <main>
        {/* ── Hero — load-time animation via PageHero animateOnLoad ── */}
        <PageHero
          backgroundImageUrl="https://www.ucol.mx/content/portal/banner_733551615849.jpg"
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

        {/* ── About — 2-column scroll reveal with staggered stats ── */}
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
            {/* Left: text content block — reveals first */}
            <div>
              <div
                ref={aboutTextRef}
                className={`reveal${aboutTextVisible ? " is-visible" : ""}`}
                style={{ '--reveal-delay': '0ms' }}
              >
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
              </div>

              {/* Stats row — each stat reveals with 80ms stagger */}
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  marginTop: "2rem",
                }}
              >
                <div
                  ref={stat0Ref}
                  className={`reveal${stat0Visible ? " is-visible" : ""}`}
                  style={{ '--reveal-delay': '0ms' }}
                >
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

                <div
                  ref={stat1Ref}
                  className={`reveal${stat1Visible ? " is-visible" : ""}`}
                  style={{ '--reveal-delay': '80ms' }}
                >
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

            {/* Right: image — reveals 150ms after left column */}
            <div
              ref={aboutRightRef}
              className={`reveal${aboutRightVisible ? " is-visible" : ""}`}
              style={{
                '--reveal-delay': '150ms',
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(34,85,44,0.15)",
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDuHhA7Tq-lPpA3Islk-iNypGt2qKXdCxK3o7pLCxU9g0EH3hn5AiJY8-g&s=10"
                alt="Huella ecológica"
                loading="lazy"
                width="800"
                height="600"
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

        {/* ── Herramientas — heading then staggered cards ── */}
        <SectionWrapper background="var(--color-section-alt)">
          {/* Section heading reveals first */}
          <div
            ref={toolsHeadingRef}
            className={`reveal${toolsHeadingVisible ? " is-visible" : ""}`}
            style={{ '--reveal-delay': '0ms' }}
          >
            <SectionHeading eyebrow="Todo lo que necesitas" title="Nuestras herramientas" />
          </div>

          {/* Cards grid — each card staggered 80ms apart */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
              alignItems: "stretch",
            }}
          >
            {tools.map((tool, index) => (
              <div
                key={tool.to}
                ref={cardReveal[index].ref}
                className={`reveal-card${cardReveal[index].visible ? " is-visible" : ""}`}
                style={{ '--reveal-delay': `${index * 80}ms`, height: "100%" }}
              >
                <Link
                  to={tool.to}
                  style={{ textDecoration: "none", display: "block", height: "100%" }}
                >
                  {tool.bgImage ? (
                    <article
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "var(--radius-card)",
                        boxShadow: "var(--shadow-card)",
                        cursor: "pointer",
                        height: "100%",
                        minHeight: "220px",
                      }}
                    >
                      <img
                        src={tool.bgImage}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(20,50,20,0.55)",
                        }}
                      />
                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "2rem 1.5rem",
                          textAlign: "center",
                        }}
                      >
                        <IconCircle Icon={tool.Icon} />
                        <h3
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 600,
                            color: "#fff",
                            margin: "0 0 0.5rem",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {tool.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: "#fff",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {tool.description}
                        </p>
                      </div>
                    </article>
                  ) : (
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
                  )}
                </Link>
              </div>
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
