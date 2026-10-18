import React from "react";
import { Leaf } from "lucide-react";

const SectionHeading = ({ eyebrow, title, leafSize = 24 }) => (
  <div style={{ textAlign: "center", marginBottom: "3rem" }}>
    {eyebrow && (
      <p
        style={{
          fontStyle: "italic",
          color: "var(--color-brand-main)",
          fontSize: "1.05rem",
          marginBottom: "0.4rem",
        }}
      >
        {eyebrow}
      </p>
    )}
    <h2
      style={{
        fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--color-brand-dark)",
        margin: "0 0 0.5rem",
        textWrap: "balance",
      }}
    >
      {title}
    </h2>
    <div
      style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}
      aria-hidden="true"
    >
      <Leaf size={leafSize} color="var(--color-brand-main)" />
    </div>
  </div>
);

export default SectionHeading;
