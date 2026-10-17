import React from "react";
import { Leaf } from "lucide-react";
import { principles } from "./data";

const cardHover = {
  enter: (e) => {
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.boxShadow = "0 8px 28px rgba(34,85,44,0.18)";
  },
  leave: (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 2px 12px rgba(34,85,44,0.08)";
  },
};

const PrinciplesSection = () => (
  <section style={{ background: "#ffffff", padding: "5rem 1.5rem" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontStyle: "italic", color: "#4a7c59", fontSize: "1.05rem", marginBottom: "0.4rem" }}>
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
        <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }} aria-hidden="true">
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
            onMouseEnter={cardHover.enter}
            onMouseLeave={cardHover.leave}
          >
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
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default PrinciplesSection;
