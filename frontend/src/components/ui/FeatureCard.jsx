import React from "react";
import { cardHover } from "../../utils/cardHover";

const FeatureCard = ({
  background = "#ffffff",
  padding = "2rem 1.5rem",
  cursor = "default",
  children,
  ...rest
}) => (
  <article
    style={{
      background,
      borderRadius: "var(--radius-card)",
      padding,
      textAlign: "center",
      boxShadow: "var(--shadow-card)",
      transition: "transform 200ms ease, box-shadow 200ms ease",
      cursor,
    }}
    onMouseEnter={cardHover.enter}
    onMouseLeave={cardHover.leave}
    {...rest}
  >
    {children}
  </article>
);

export default FeatureCard;
