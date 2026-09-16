import { render } from '@testing-library/react';
import App from './App';

jest.mock('./features/mapa/Mapa', () => () => null);

test('renderiza sin errores', () => {
  expect(() => render(<App />)).not.toThrow();
});
