import React from "react";
import { benefits } from "./data";
import SectionWrapper from "../../components/ui/SectionWrapper";
import SectionHeading from "../../components/ui/SectionHeading";
import FeatureCard from "../../components/ui/FeatureCard";
import IconCircle from "../../components/ui/IconCircle";

const BenefitsSection = () => (
  <SectionWrapper background="var(--color-section-alt)">
    <SectionHeading eyebrow="¿Por qué reciclar?" title="Beneficios del reciclaje" />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {benefits.map((b) => (
        <FeatureCard key={b.name}>
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
      ))}
    </div>
  </SectionWrapper>
);

export default BenefitsSection;
