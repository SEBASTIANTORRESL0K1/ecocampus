import React from "react";

const HeroSection = () => (
  <section
    style={{
      backgroundImage: "url('https://picsum.photos/seed/reciclaje/1920/600')",
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
);

export default HeroSection;
