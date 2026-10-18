import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

vi.mock('../../hooks/useScrollReveal', () => ({
  default: () => ({ ref: { current: null }, isVisible: true }),
}));

vi.mock('lucide-react', () => ({
  Sprout: () => null,
  Map: () => null,
  Users: () => null,
  Recycle: () => null,
  Leaf: () => null,
}));

const renderLandingPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );

describe('LandingPage', () => {
  test('renderiza sin errores', () => {
    expect(() => renderLandingPage()).not.toThrow();
  });

  test('muestra el titulo principal', () => {
    renderLandingPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /calcula tu huella ecológica/i })
    ).toBeInTheDocument();
  });

  test('muestra el boton Comenzar cálculo', () => {
    renderLandingPage();
    expect(
      screen.getByRole('button', { name: /comenzar cálculo/i })
    ).toBeInTheDocument();
  });

  test('el enlace del boton apunta a /calculadora', () => {
    renderLandingPage();
    expect(
      screen.getByRole('link', { name: /comenzar cálculo/i })
    ).toHaveAttribute('href', '/calculadora');
  });

  test('muestra la sección informativa sobre la huella ecológica', () => {
    renderLandingPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /qué es la huella ecológica/i })
    ).toBeInTheDocument();
  });

  test('muestra el dato estadístico de 3.1 hectáreas globales', () => {
    renderLandingPage();
    expect(screen.getByText(/3\.1 hectáreas globales/i)).toBeInTheDocument();
  });

  test('muestra el dato estadístico de 20.1 µg/m³', () => {
    renderLandingPage();
    expect(screen.getByText(/20\.1 µg\/m³/i)).toBeInTheDocument();
  });

  test('muestra el h2 de la sección de herramientas', () => {
    renderLandingPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /nuestras herramientas/i })
    ).toBeInTheDocument();
  });

  test('muestra el enlace a /mapa', () => {
    renderLandingPage();
    const enlaces = screen.getAllByRole('link');
    const enlaceMapa = enlaces.find(
      (el) => el.getAttribute('href') === '/mapa'
    );
    expect(enlaceMapa).toBeInTheDocument();
  });

  test('muestra el enlace a /comunidad', () => {
    renderLandingPage();
    const enlaces = screen.getAllByRole('link');
    const enlaceComunidad = enlaces.find(
      (el) => el.getAttribute('href') === '/comunidad'
    );
    expect(enlaceComunidad).toBeInTheDocument();
  });

  test('muestra el enlace a /guia-reciclaje', () => {
    renderLandingPage();
    const enlaces = screen.getAllByRole('link');
    const enlaceGuia = enlaces.find(
      (el) => el.getAttribute('href') === '/guia-reciclaje'
    );
    expect(enlaceGuia).toBeInTheDocument();
  });

  test('muestra el texto introductorio de la sección de herramientas', () => {
    renderLandingPage();
    expect(screen.getByText(/todo lo que necesitas/i)).toBeInTheDocument();
  });
});
