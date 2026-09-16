import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

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
      screen.getByRole('heading', { level: 2 })
    ).toHaveTextContent('¿Qué es la huella ecológica?');
  });

  test('muestra el dato estadístico de 3.1 hectáreas globales', () => {
    renderLandingPage();
    expect(screen.getByText(/3\.1 hectáreas globales/i)).toBeInTheDocument();
  });

  test('muestra el dato estadístico de 20.1 µg/m³', () => {
    renderLandingPage();
    expect(screen.getByText(/20\.1 µg\/m³/i)).toBeInTheDocument();
  });
});
