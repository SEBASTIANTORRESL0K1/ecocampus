import React from "react";

const IconCircle = ({ Icon, size = 28, strokeWidth = 1.5 }) => (
  <div
    style={{
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "var(--color-surface-light)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1rem",
    }}
    aria-hidden="true"
  >
    <Icon size={size} color="var(--color-brand-main)" strokeWidth={strokeWidth} />
  </div>
);

export default IconCircle;
