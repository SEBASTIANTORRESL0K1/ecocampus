import React from "react";
import { principles } from "./data";
import SectionWrapper from "../../components/ui/SectionWrapper";
import SectionHeading from "../../components/ui/SectionHeading";
import FeatureCard from "../../components/ui/FeatureCard";
import useScrollReveal from "../../hooks/useScrollReveal";
import "../../styles/scroll-animations.css";

const PrinciplesSection = () => {
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
    <SectionWrapper>
      <style>{`
        @media (max-width: 768px) {
          .principles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div
        ref={headingRef}
        className={`reveal${headingVisible ? " is-visible" : ""}`}
        style={{ '--reveal-delay': '0ms' }}
      >
        <SectionHeading eyebrow="Principios fundamentales" title="Las 3 R's del reciclaje" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
        className="principles-grid"
      >
        {principles.map((p, index) => (
          <div
            key={p.name}
            ref={cardReveal[index].ref}
            className={`reveal-card${cardReveal[index].visible ? " is-visible" : ""}`}
            style={{ '--reveal-delay': `${index * 80}ms` }}
          >
            <FeatureCard background="var(--color-surface-light)">
              <p style={{ fontSize: "3rem", fontWeight: 700, color: "#2d6a2d", margin: "0 0 0.5rem", lineHeight: 1 }}>
                {p.number}
              </p>
              <div style={{ marginBottom: "0.75rem" }} aria-hidden="true">
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
              <p style={{ fontSize: "0.9rem", color: "#3a4a3a", margin: 0, lineHeight: 1.6 }}>
                {p.description}
              </p>
            </FeatureCard>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default PrinciplesSection;
