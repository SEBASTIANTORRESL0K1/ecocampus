import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Comunidad from "./Comunidad";

vi.mock("lucide-react", () => ({
  Calendar: () => null,
  Newspaper: () => null,
  CalendarDays: () => null,
}));

const renderComunidad = () =>
  render(
    <MemoryRouter>
      <Comunidad />
    </MemoryRouter>
  );

describe("Comunidad", () => {
  test("renderiza sin errores", () => {
    expect(() => renderComunidad()).not.toThrow();
  });

  test("muestra el titulo hero", () => {
    renderComunidad();
    screen.getByRole("heading", { level: 1, name: /comunidad ecocampus/i });
  });

  test("muestra el subtitulo del hero en italica", () => {
    renderComunidad();
    screen.getByText(/mantente informado sobre eventos y noticias ambientales/i);
  });

  test("muestra las tres publicaciones", () => {
    renderComunidad();
    screen.getByRole("heading", { level: 2, name: /limpieza de playa/i });
    screen.getByRole("heading", { level: 2, name: /nueva estación de reciclaje/i });
    screen.getByRole("heading", { level: 2, name: /taller de compostaje/i });
  });

  test("muestra los badges de tipo de publicacion", () => {
    renderComunidad();
    const badges = screen.getAllByText(/^(Evento|Noticia)$/);
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  test("muestra las fechas de las publicaciones", () => {
    renderComunidad();
    screen.getByText(/15 de febrero/i);
    screen.getByText(/10 de febrero/i);
    screen.getByText(/20 de febrero/i);
  });
});
