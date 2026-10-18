import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ transparent = false }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);
  const { pathname } = useLocation();

  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const autoHideTimer = useRef(null);

  const clearAutoHideTimer = () => {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }
  };

  const resetAutoHideTimer = () => {
    clearAutoHideTimer();
    autoHideTimer.current = setTimeout(() => {
      if (window.scrollY >= 80) {
        setVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isAtTop = scrollY < 80;
      setAtTop(isAtTop);

      if (isAtTop) {
        setVisible(true);
        clearAutoHideTimer();
        lastScrollY.current = scrollY;
        return;
      }

      const scrollingDown = scrollY > lastScrollY.current;
      lastScrollY.current = scrollY;

      if (scrollingDown) {
        setVisible(false);
        clearAutoHideTimer();
      } else {
        setVisible(true);
        resetAutoHideTimer();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearAutoHideTimer();
    };
  }, []);

  const bgClass = transparent
    ? atTop
      ? "bg-transparent"
      : "bg-lime-600"
    : "bg-lime-600";

  const visibilityClass = visible ? "translate-y-0" : "-translate-y-full";

  const linkClass = (to) => {
    const isActive = pathname === to;
    return isActive
      ? "text-green-300 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
      : "text-white font-medium hover:text-green-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded";
  };

  const mobileLinkClass = (to) => {
    const isActive = pathname === to;
    return `block py-3 min-h-[44px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded ${
      isActive ? "text-green-300 font-semibold" : "text-white hover:text-green-300"
    }`;
  };

  const mobileMenuBg = transparent
    ? "bg-black/70 backdrop-blur-sm"
    : "bg-lime-700";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${bgClass} ${visibilityClass} transition-transform duration-300 ease-in-out text-white px-8 h-16`}>
      <div className="flex justify-between items-center h-full">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={cerrarMenu}>
          <span className="bg-white rounded-full h-9 w-9 flex items-center justify-center shrink-0">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Logo EcoCampus" className="h-7 w-7" />
          </span>
          <span className="text-2xl font-bold">EcoCampus</span>
        </Link>

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

        <ul className="hidden sm:flex items-center space-x-6">
          <li><Link to="/" className={linkClass("/")}>Inicio</Link></li>
          <li><Link to="/calculadora" className={linkClass("/calculadora")}>Calculadora</Link></li>
          <li><Link to="/mapa" className={linkClass("/mapa")}>Mapa</Link></li>
          <li><Link to="/comunidad" className={linkClass("/comunidad")}>Comunidad</Link></li>
          <li><Link to="/guia-reciclaje" className={linkClass("/guia-reciclaje")}>Guía de Reciclaje</Link></li>
        </ul>
      </div>

      {menuAbierto && (
        <ul
          id="nav-menu-mobile"
          className={`sm:hidden flex flex-col gap-0 border-t border-white/20 pt-3 pb-3 px-2 ${mobileMenuBg}`}
        >
          <li>
            <Link to="/" className={mobileLinkClass("/")} onClick={cerrarMenu}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/calculadora" className={mobileLinkClass("/calculadora")} onClick={cerrarMenu}>
              Calculadora
            </Link>
          </li>
          <li>
            <Link to="/mapa" className={mobileLinkClass("/mapa")} onClick={cerrarMenu}>
              Mapa
            </Link>
          </li>
          <li>
            <Link to="/comunidad" className={mobileLinkClass("/comunidad")} onClick={cerrarMenu}>
              Comunidad
            </Link>
          </li>
          <li>
            <Link to="/guia-reciclaje" className={mobileLinkClass("/guia-reciclaje")} onClick={cerrarMenu}>
              Guía de Reciclaje
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
