import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

const LandingPage = lazy(() => import("./features/landing/LandingPage"));
const Calculadora = lazy(() => import("./features/calculadora/Calculadora"));
const Mapa = lazy(() => import("./features/mapa/Mapa"));
const Comunidad = lazy(() => import("./features/comunidad/Comunidad"));
const GuiaReciclaje = lazy(() => import("./features/guiaReciclaje/GuiaReciclaje"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router basename="/ecocampus">
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/guia-reciclaje" element={<GuiaReciclaje />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
