import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./features/landing/LandingPage";
import Calculadora from "./features/calculadora/Calculadora";
import Mapa from "./features/mapa/Mapa";
import Comunidad from "./features/comunidad/Comunidad";
import GuiaReciclaje from "./features/guiaReciclaje/GuiaReciclaje";

function App() {
  return (
    <Router basename="/Eco-Campus2">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculadora" element={<Calculadora />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/guia-reciclaje" element={<GuiaReciclaje />} />
      </Routes>
    </Router>
  );
}

export default App;
