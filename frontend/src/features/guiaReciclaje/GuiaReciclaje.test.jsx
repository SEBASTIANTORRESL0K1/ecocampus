import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuiaReciclaje from './GuiaReciclaje';

vi.mock('lucide-react', () => ({
  RefreshCw: () => null,
  Repeat: () => null,
  TrendingDown: () => null,
  Leaf: () => null,
  DollarSign: () => null,
  Users: () => null,
}));

const renderGuiaReciclaje = () =>
  render(
    <MemoryRouter>
      <GuiaReciclaje />
    </MemoryRouter>
  );

describe('GuiaReciclaje', () => {
  test('renderiza sin errores', () => {
    expect(() => renderGuiaReciclaje()).not.toThrow();
  });

  test('muestra el título principal', () => {
    renderGuiaReciclaje();
    screen.getByRole('heading', { level: 1, name: /guía de reciclaje/i });
  });

  test('muestra los tres principios de las 3 R\'s', () => {
    renderGuiaReciclaje();
    screen.getByRole('heading', { name: /reciclar/i });
    screen.getByRole('heading', { name: /reutilizar/i });
    screen.getByRole('heading', { name: /reducir/i });
  });

  test('muestra las tres categorías de beneficios', () => {
    renderGuiaReciclaje();
    screen.getByRole('heading', { name: /ambientales/i });
    screen.getByRole('heading', { name: /económicos/i });
    screen.getByRole('heading', { name: /sociales/i });
  });

  test('el enlace "Conoce más" apunta a la URL correcta', () => {
    renderGuiaReciclaje();
    const link = screen.getByRole('link', { name: /conoce más/i });
    expect(link).toHaveAttribute('href', 'https://portal.ucol.mx/siga/reforestaccion/');
  });

  test('el enlace "Conoce más" tiene rel="noopener noreferrer"', () => {
    renderGuiaReciclaje();
    const link = screen.getByRole('link', { name: /conoce más/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
