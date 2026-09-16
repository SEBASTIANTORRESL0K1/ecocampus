import { render } from '@testing-library/react';
import App from './App';

vi.mock('./features/mapa/Mapa', () => ({ default: () => null }));

test('renderiza sin errores', () => {
  expect(() => render(<App />)).not.toThrow();
});
