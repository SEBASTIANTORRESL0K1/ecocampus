import React from "react";

const PageHero = ({
  backgroundSeed,
  eyebrow,
  title,
  description,
  cta,
  minHeight = "42vh",
  overlayOpacity = "0.65",
  textAlign = "center",
}) => (
  <section style={{ position: "relative", overflow: "hidden" }}>
    {/* img instead of CSS background-image so browsers discover and preload it early */}
    <img
      src={`https://picsum.photos/seed/${backgroundSeed}/1920/600`}
      alt=""
      aria-hidden="true"
      fetchpriority="high"
      width="1920"
      height="600"
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
        position: "relative",
        background: `rgba(34,85,44,${overlayOpacity})`,
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem",
        textAlign,
      }}
    >
      {eyebrow && (
        <p
          style={{
            fontStyle: "italic",
            color: "var(--color-hero-sub)",
            fontSize: "1.1rem",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
          }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        style={{
          color: "#ffffff",
          fontSize: "clamp(2rem, 5vw, 4rem)",
          fontWeight: 700,
          letterSpacing: "0.02em",
          textWrap: "balance",
          margin: description || cta ? "0 0 1rem" : "0",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            color: "var(--color-hero-desc)",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            maxWidth: "520px",
            textWrap: "balance",
            margin: cta ? "0 0 2rem" : "0",
          }}
        >
          {description}
        </p>
      )}
      {cta}
    </div>
  </section>
);

export default PageHero;
