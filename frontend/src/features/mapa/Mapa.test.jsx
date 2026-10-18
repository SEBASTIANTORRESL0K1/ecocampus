import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../hooks/useScrollReveal", () => ({
  default: () => ({ ref: { current: null }, isVisible: true }),
}));

vi.mock("../../styles/scroll-animations.css", () => ({}));

vi.mock("react-leaflet", () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
}));

vi.mock("lucide-react", () => ({
  MapPin: () => null,
}));

vi.mock("leaflet/dist/leaflet.css", () => ({}));

import Mapa from "./Mapa";

const renderMapa = () =>
  render(
    <MemoryRouter>
      <Mapa />
    </MemoryRouter>
  );

describe("Mapa", () => {
  test("renders without errors", () => {
    expect(() => renderMapa()).not.toThrow();
  });

  test("shows heading 'Mapa de Reciclaje'", () => {
    renderMapa();
    expect(screen.getByRole("heading", { level: 1, name: /mapa de reciclaje/i })).toBeInTheDocument();
  });

  test("shows recycling points counter text", () => {
    renderMapa();
    expect(screen.getByText(/21 puntos de reciclaje/i)).toBeInTheDocument();
  });

  test("shows campus subtitle", () => {
    renderMapa();
    expect(screen.getByText(/campus central/i)).toBeInTheDocument();
  });
});
