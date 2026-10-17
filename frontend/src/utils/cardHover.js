export const cardHover = {
  enter: (e) => {
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.boxShadow = "0 8px 28px rgba(34,85,44,0.18)";
  },
  leave: (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 2px 12px rgba(34,85,44,0.08)";
  },
};
