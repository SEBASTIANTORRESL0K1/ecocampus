import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import useScrollReveal from './useScrollReveal';

// IntersectionObserver simulado: guarda los observadores para dispararlos a mano.
let observadores = [];
beforeEach(() => {
  observadores = [];
  global.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.elementos = new Set();
      observadores.push(this);
    }
    observe(el) { this.elementos.add(el); }
    unobserve(el) { this.elementos.delete(el); }
    disconnect() { this.elementos.clear(); }
  };
});

function Prueba() {
  const [mostrar, setMostrar] = useState(false);
  const { ref, isVisible } = useScrollReveal();
  return (
    <div>
      <button onClick={() => setMostrar(true)}>mostrar</button>
      {mostrar && <p ref={ref} data-testid="tarjeta" className={isVisible ? 'is-visible' : ''}>hola</p>}
    </div>
  );
}

const verTarjeta = (visible) =>
  act(() => observadores.forEach((o) => o.elementos.size && o.callback([{ isIntersecting: visible }])));

test('revela un elemento que se monta despues del primer render (resultado de la calculadora)', async () => {
  render(<Prueba />);
  expect(observadores.every((o) => o.elementos.size === 0)).toBe(true);

  await act(async () => screen.getByText('mostrar').click());
  expect(observadores.some((o) => o.elementos.size === 1)).toBe(true);

  verTarjeta(true);
  expect(screen.getByTestId('tarjeta')).toHaveClass('is-visible');
});

test('sin IntersectionObserver el contenido se muestra', async () => {
  delete global.IntersectionObserver;
  render(<Prueba />);
  await act(async () => screen.getByText('mostrar').click());
  expect(screen.getByTestId('tarjeta')).toHaveClass('is-visible');
});
