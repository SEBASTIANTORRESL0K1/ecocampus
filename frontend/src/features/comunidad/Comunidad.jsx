import React from "react";
import { Calendar, Newspaper, CalendarDays } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { noticiasEventos } from "./noticiasEventos";
import PageHero from "../../components/ui/PageHero";
import SectionWrapper from "../../components/ui/SectionWrapper";
import FeatureCard from "../../components/ui/FeatureCard";
import useScrollReveal from "../../hooks/useScrollReveal";
import "../../styles/scroll-animations.css";

const badgeIcon = (tipo) => {
  if (tipo === "Noticia") return <Newspaper size={14} color="#2d6a2d" strokeWidth={1.5} aria-hidden="true" />;
  return <CalendarDays size={14} color="#2d6a2d" strokeWidth={1.5} aria-hidden="true" />;
};

const Comunidad = () => {
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal();

  return (
    <PageLayout>
      <main>
        {/* ── Hero ── */}
        <PageHero
          backgroundSeed="comunidad"
          eyebrow="Noticias y eventos ambientales"
          title="Comunidad EcoCampus"
          description="Mantente informado sobre eventos y noticias ambientales"
          minHeight="42vh"
        />

        {/* ── Cards grid ── */}
        <SectionWrapper background="var(--color-section-alt)" padding="4rem 1.5rem">
          <div
            ref={gridRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
            className="comunidad-cards-grid"
          >
            {noticiasEventos.map((item, index) => (
              <div
                key={item.id}
                className={`reveal-card${gridVisible ? " is-visible" : ""}`}
                style={{ "--reveal-delay": `${index * 80}ms` }}
              >
              <FeatureCard padding="1.75rem">
                {/* Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "#e8f4ec",
                    color: "#2d6a2d",
                    borderRadius: "999px",
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    marginBottom: "0.9rem",
                  }}
                >
                  {badgeIcon(item.tipo)}
                  {item.tipo}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#2d6a2d",
                    margin: "0 0 0.4rem",
                    lineHeight: 1.3,
                    textWrap: "balance",
                  }}
                >
                  {item.titulo}
                </h2>

                {/* Date */}
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.85rem",
                    color: "#6a8a6a",
                    fontStyle: "italic",
                    margin: "0 0 0.85rem",
                  }}
                >
                  <Calendar size={14} color="#6a8a6a" strokeWidth={1.5} aria-hidden="true" />
                  {item.fecha}
                </p>

                {/* Description */}
                <p
                  style={{
                    color: "#3a4a3a",
                    lineHeight: 1.65,
                    fontSize: "0.95rem",
                    margin: 0,
                  }}
                >
                  {item.descripcion}
                </p>
              </FeatureCard>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .comunidad-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default Comunidad;
