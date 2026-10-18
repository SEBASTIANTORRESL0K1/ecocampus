import React from "react";
import PageHero from "../../components/ui/PageHero";
import CtaButton from "../../components/ui/CtaButton";

const HeroSection = () => (
  <PageHero
    backgroundImageUrl="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVjaWNsYXJ8ZW58MHx8MHx8fDA%3D"
    backgroundSeed="reciclaje"
    eyebrow="Plataforma ambiental universitaria"
    title="Guía de Reciclaje"
    description="Conoce la importancia del reciclaje y cómo ayudar al planeta"
    minHeight="60dvh"
    cta={
      <CtaButton
        as="a"
        href="https://portal.ucol.mx/siga/reforestaccion/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Conoce más
      </CtaButton>
    }
  />
);

export default HeroSection;
