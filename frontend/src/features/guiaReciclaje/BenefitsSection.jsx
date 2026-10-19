import React from "react";
import { benefits } from "./data";
import SectionWrapper from "../../components/ui/SectionWrapper";
import SectionHeading from "../../components/ui/SectionHeading";
import FeatureCard from "../../components/ui/FeatureCard";
import IconCircle from "../../components/ui/IconCircle";
import useScrollReveal from "../../hooks/useScrollReveal";
import "../../styles/scroll-animations.css";

const BenefitsSection = () => {
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal();
  const { ref: card0Ref, isVisible: card0Visible } = useScrollReveal();
  const { ref: card1Ref, isVisible: card1Visible } = useScrollReveal();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollReveal();

  const cardReveal = [
    { ref: card0Ref, visible: card0Visible },
    { ref: card1Ref, visible: card1Visible },
    { ref: card2Ref, visible: card2Visible },
  ];

  return (
    <SectionWrapper background="var(--color-section-alt)">
      <style>{`
        @media (max-width: 768px) {
          .benefits-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div
        ref={headingRef}
        className={`reveal${headingVisible ? " is-visible" : ""}`}
        style={{ '--reveal-delay': '0ms' }}
      >
        <SectionHeading eyebrow="¿Por qué reciclar?" title="Beneficios del reciclaje" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
        className="benefits-grid"
      >
        {benefits.map((b, index) => (
          <div
            key={b.name}
            ref={cardReveal[index].ref}
            className={`reveal-card${cardReveal[index].visible ? " is-visible" : ""}`}
            style={{ '--reveal-delay': `${index * 80}ms` }}
          >
            <FeatureCard>
              <IconCircle Icon={b.Icon} />
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
              <p style={{ fontSize: "0.9rem", color: "#3a4a3a", margin: 0, lineHeight: 1.6 }}>
                {b.description}
              </p>
            </FeatureCard>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default BenefitsSection;
