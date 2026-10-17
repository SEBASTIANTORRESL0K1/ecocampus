import React from "react";

const ctaStyle = {
  background: "var(--color-brand-mid)",
  color: "#ffffff",
  border: "none",
  borderRadius: "4px",
  padding: "0.85rem 2.5rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "transform 200ms ease, box-shadow 200ms ease, background 200ms ease",
  boxShadow: "var(--shadow-btn)",
  textDecoration: "none",
  display: "inline-block",
};

const CtaButton = ({ as: Tag = "button", children, ...props }) => (
  <Tag
    style={ctaStyle}
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
    {...props}
  >
    {children}
  </Tag>
);

export default CtaButton;
