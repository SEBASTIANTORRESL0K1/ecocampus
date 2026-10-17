import { useState } from "react";

export const IMAGEN_DEFAULT = `${import.meta.env.BASE_URL}apple-touch-icon.png`;

const resolverSrcImagen = (src) => {
	if (!src) return IMAGEN_DEFAULT;
	if (src.startsWith("http://") || src.startsWith("https://")) return src;
	if (src.startsWith(import.meta.env.BASE_URL)) return src;
	if (src.startsWith("/")) return `${import.meta.env.BASE_URL}${src.slice(1)}`;
	return IMAGEN_DEFAULT;
};

// Imagen ilustrativa del tema de la pregunta. El contenedor gris reserva el
// espacio mientras carga y muestra la imagen por defecto si la imagen falla.
// Usar con `key` distinta por paso para reiniciar el estado de error.
const ImagenTema = ({ palabraClave, alt }) => {
	const [error, setError] = useState(false);

	return (
		<div className="w-full h-40 bg-gray-100 rounded-md mb-4 overflow-hidden flex items-center justify-center">
			{error ? (
				<span className="text-sm text-gray-500">Imagen no disponible</span>
			) : (
				<img
					src={resolverSrcImagen(palabraClave)}
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
