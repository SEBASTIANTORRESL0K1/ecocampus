import { useState } from "react";

// Proveedor de imágenes: LoremFlickr (gratuito, sin API key). `lock` fija la
// imagen para que cada pregunta muestre siempre la misma. Para cambiar de
// proveedor basta con modificar esta función.
export const urlImagenTema = (palabraClave, lock) =>
  `https://loremflickr.com/640/320/${encodeURIComponent(palabraClave)}?lock=${lock}`;

// Imagen ilustrativa del tema de la pregunta. El contenedor gris reserva el
// espacio mientras carga y queda como respaldo si la imagen falla.
// Usar con `key` distinta por paso para reiniciar el estado de error.
const ImagenTema = ({ palabraClave, lock, alt }) => {
  const [error, setError] = useState(false);

  return (
    <div className="w-full h-40 bg-gray-100 rounded-md mb-4 overflow-hidden flex items-center justify-center">
      {error ? (
        <span className="text-sm text-gray-400">Imagen no disponible</span>
      ) : (
        <img
          src={urlImagenTema(palabraClave, lock)}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          className="w-full h-40 object-cover rounded-md"
        />
      )}
    </div>
  );
};

export default ImagenTema;
