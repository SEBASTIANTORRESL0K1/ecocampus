import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-lime-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src={`${process.env.PUBLIC_URL}/favicon.svg`} alt="Logo EcoCampus" className="h-8 w-8" />
        <h1 className="text-2xl font-bold">EcoCampus</h1>
      </div>
      <ul className="flex space-x-6">
        <li><Link to="/" className="hover:underline">Inicio</Link></li>
        <li><Link to="/calculadora" className="hover:underline">Calculadora</Link></li>
        <li><Link to="/mapa" className="hover:underline">Mapa</Link></li>
        <li><Link to="/comunidad" className="hover:underline">Comunidad</Link></li>
        <li><Link to="/guia-reciclaje" className="hover:underline">Guía de Reciclaje</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
