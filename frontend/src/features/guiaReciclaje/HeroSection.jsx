import React from "react";
import PageHero from "../../components/ui/PageHero";
import CtaButton from "../../components/ui/CtaButton";

const HeroSection = () => (
  <PageHero
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
