import React from "react";

const Footer = () => {
  return (
    <footer className="bg-zinc-700 text-white px-6 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">

        {/* Logos a la izquierda */}
        <div className="flex items-center space-x-4 mb-6 md:mb-0">
          <img src={process.env.PUBLIC_URL + "/Logos/UdC_logo.png"} alt="Universidad de Colima" className="h-14" />
        </div>

        {/* Redes sociales al centro (sin correo) */}
        <div className="flex space-x-5 text-2xl mb-6 md:mb-0">
          <a
            href="https://www.facebook.com/share/18zfi8HwvY/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook hover:text-lime-400"></i>
          </a>
          <a
            href="https://www.instagram.com/udec.oficial?igsh=MWxnc2ZvYzRsN2ZnYg=="
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram hover:text-lime-400"></i>
          </a>
          <a
            href="https://youtube.com/@universidaddecolimatv?si=kqP73Ld1sn6y2DmS"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-youtube hover:text-lime-400"></i>
          </a>
        </div>

        {/* Imagen y dirección a la derecha */}
        <div className="text-right">
          <img
            src={process.env.PUBLIC_URL + "/Logos/eslogan.png"}
            alt="Pertenencia que transforma"
            className="h-10 mx-auto md:mx-0 mb-2"
          />
          <p className="text-sm">Av. Universidad No. 333, Las Víboras</p>
          <p className="text-sm">CP. 28040, Colima, Colima, México</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
