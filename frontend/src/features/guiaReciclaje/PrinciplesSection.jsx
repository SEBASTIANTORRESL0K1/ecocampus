import React from "react";
import { principles } from "./data";
import SectionWrapper from "../../components/ui/SectionWrapper";
import SectionHeading from "../../components/ui/SectionHeading";
import FeatureCard from "../../components/ui/FeatureCard";

const PrinciplesSection = () => (
  <SectionWrapper>
    <SectionHeading eyebrow="Principios fundamentales" title="Las 3 R's del reciclaje" />

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {principles.map((p) => (
        <FeatureCard key={p.name} background="var(--color-surface-light)">
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
      ))}
    </div>
  </SectionWrapper>
);

export default PrinciplesSection;
