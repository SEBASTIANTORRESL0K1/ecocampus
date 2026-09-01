import L from "leaflet";
import markpointIcon from "../../assets/markpointMap.svg";

export const customIcon = new L.Icon({
  iconUrl: markpointIcon,
  iconSize: [18, 18], // Tamaño del ícono
  iconAnchor: [16, 32], // Punto de anclaje (centro inferior)
  popupAnchor: [0, -32] // Ajustar posición del popup
});
