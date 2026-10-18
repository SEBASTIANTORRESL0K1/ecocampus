import React from "react";

const SectionWrapper = ({
  background = "#ffffff",
  padding = "5rem 1.5rem",
  maxWidth = "1100px",
  innerStyle = {},
  className,
  children,
}) => (
  <section style={{ background, padding }}>
    <div
      style={{ maxWidth, margin: "0 auto", ...innerStyle }}
      className={className}
    >
      {children}
    </div>
  </section>
);

export default SectionWrapper;
