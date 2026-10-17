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
    expect(screen.getByRole('heading', { level: 1, name: /guía de reciclaje/i })).toBeInTheDocument();
  });

  test('muestra los tres principios de las 3 R\'s', () => {
    renderGuiaReciclaje();
    expect(screen.getByRole('heading', { name: /reciclar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reutilizar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reducir/i })).toBeInTheDocument();
  });

  test('muestra las tres categorías de beneficios', () => {
    renderGuiaReciclaje();
    expect(screen.getByRole('heading', { name: /ambientales/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /económicos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sociales/i })).toBeInTheDocument();
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
