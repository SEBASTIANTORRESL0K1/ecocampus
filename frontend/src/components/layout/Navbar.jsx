import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="bg-lime-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-white rounded-full h-9 w-9 flex items-center justify-center shrink-0">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Logo EcoCampus" className="h-7 w-7" />
          </span>
          <span className="text-2xl font-bold">EcoCampus</span>
        </div>

        {/* Botón hamburguesa: sólo en móvil */}
        <button
          className="sm:hidden flex flex-col justify-center gap-1.5 p-2 min-h-[44px] min-w-[44px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="nav-menu-mobile"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-200 origin-center ${menuAbierto ? "rotate-45 translate-y-2" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity duration-200 ${menuAbierto ? "opacity-0" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-200 origin-center ${menuAbierto ? "-rotate-45 -translate-y-2" : ""}`}
          ></span>
        </button>

        {/* Menú escritorio */}
        <ul className="hidden sm:flex space-x-6">
          <li><Link to="/" className="hover:underline">Inicio</Link></li>
          <li><Link to="/calculadora" className="hover:underline">Calculadora</Link></li>
          <li><Link to="/mapa" className="hover:underline">Mapa</Link></li>
          <li><Link to="/comunidad" className="hover:underline">Comunidad</Link></li>
          <li><Link to="/guia-reciclaje" className="hover:underline">Guía de Reciclaje</Link></li>
        </ul>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <ul
          id="nav-menu-mobile"
          className="sm:hidden flex flex-col mt-3 gap-0 border-t border-lime-500 pt-3"
        >
          <li>
            <Link to="/" className="block py-3 min-h-[44px] hover:underline" onClick={cerrarMenu}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/calculadora" className="block py-3 min-h-[44px] hover:underline" onClick={cerrarMenu}>
              Calculadora
            </Link>
          </li>
          <li>
            <Link to="/mapa" className="block py-3 min-h-[44px] hover:underline" onClick={cerrarMenu}>
              Mapa
            </Link>
          </li>
          <li>
            <Link to="/comunidad" className="block py-3 min-h-[44px] hover:underline" onClick={cerrarMenu}>
              Comunidad
            </Link>
          </li>
          <li>
            <Link to="/guia-reciclaje" className="block py-3 min-h-[44px] hover:underline" onClick={cerrarMenu}>
              Guía de Reciclaje
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
