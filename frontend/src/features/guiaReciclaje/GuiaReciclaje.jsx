import React from "react";
import { Leaf } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import HeroSection from "./HeroSection";
import PrinciplesSection from "./PrinciplesSection";
import BenefitsSection from "./BenefitsSection";
import SectionWrapper from "../../components/ui/SectionWrapper";
import useScrollReveal from "../../hooks/useScrollReveal";
import "../../styles/scroll-animations.css";

const GuiaReciclaje = () => {
  const { ref: bannerRef, isVisible: bannerVisible } = useScrollReveal();
  const { ref: infografiaRef, isVisible: infografiaVisible } = useScrollReveal();

  return (
    <PageLayout navTransparent>
      <main>
        <HeroSection />

        {/* Banner intro */}
        <section style={{ background: "#f7f9f4", padding: "3.5rem 1.5rem" }}>
          <div
            ref={bannerRef}
            className={`reveal${bannerVisible ? " is-visible" : ""}`}
            style={{
              '--reveal-delay': '0ms',
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

        <PrinciplesSection />
        <BenefitsSection />

        {/* Infografía */}
        <SectionWrapper innerStyle={{ textAlign: "center" }}>
          <div
            ref={infografiaRef}
            className={`reveal${infografiaVisible ? " is-visible" : ""}`}
            style={{ '--reveal-delay': '0ms' }}
          >
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
        </SectionWrapper>
      </main>
    </PageLayout>
  );
};

export default GuiaReciclaje;
