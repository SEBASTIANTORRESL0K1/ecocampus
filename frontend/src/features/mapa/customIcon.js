import L from "leaflet";
import markpointIcon from "../../assets/markpointMap.svg";

export const customIcon = new L.Icon({
  iconUrl: markpointIcon,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -46]
});
