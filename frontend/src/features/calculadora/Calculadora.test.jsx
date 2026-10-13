import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Calculadora from './Calculadora';
import { pasoRespondido } from './pasoRespondido';

const renderCalculadora = () =>
  render(
    <MemoryRouter>
      <Calculadora />
    </MemoryRouter>
  );

describe('Calculadora', () => {
  test('renderiza sin errores', () => {
    expect(() => renderCalculadora()).not.toThrow();
  });

  test('Siguiente esta deshabilitado hasta seleccionar una opcion', () => {
    renderCalculadora();
    const siguiente = screen.getByRole('button', { name: 'Siguiente' });
    expect(siguiente).toBeDisabled();
    expect(screen.getByText('Selecciona una opción para continuar.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '1 a 2 raciones a la semana' }));

    expect(siguiente).toBeEnabled();
    expect(screen.queryByText('Selecciona una opción para continuar.')).not.toBeInTheDocument();
  });

  test('la opcion nula (valor 0) habilita Siguiente', () => {
    renderCalculadora();
    // Paso 1 -> paso 2 -> paso 3 (pan), que tiene la opcion nula agregada
    fireEvent.click(screen.getByRole('button', { name: '1 a 2 raciones a la semana' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: '1 a 2 raciones a la semana' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByText(/Pregunta 3 de 31/)).toBeInTheDocument();
    const siguiente = screen.getByRole('button', { name: 'Siguiente' });
    expect(siguiente).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'No consumo pan' }));
    expect(siguiente).toBeEnabled();
  });

  test('muestra la imagen ilustrativa del tema con src y alt esperados', () => {
    renderCalculadora();
    const imagen = screen.getByRole('img', {
      name: 'Imagen ilustrativa: ¿Cuántas raciones de fruta consumes a la semana?',
    });
    expect(imagen).toHaveAttribute('src', 'https://loremflickr.com/640/320/fruit?lock=1');
    expect(imagen).toHaveAttribute('loading', 'lazy');
  });

  test('muestra el respaldo si la imagen no carga', () => {
    renderCalculadora();
    const imagen = screen.getByRole('img', { name: /Imagen ilustrativa/ });
    fireEvent.error(imagen);

    expect(screen.queryByRole('img', { name: /Imagen ilustrativa/ })).not.toBeInTheDocument();
    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument();
  });
});

describe('pasoRespondido', () => {
  const pasoUnica = { tipo: 'unica', pregunta: { id: 3 } };
  const pasoQ21 = { tipo: 'multipleCheckbox', pregunta: { id: 21 } };

  test('unica: sin respuesta es falso y valor 0 es valido', () => {
    expect(pasoRespondido(pasoUnica, {})).toBe(false);
    expect(pasoRespondido(pasoUnica, { 3: 0 })).toBe(true);
    expect(pasoRespondido(pasoUnica, { 3: 27 })).toBe(true);
  });

  test('multipleCheckbox: requiere un electrodomestico o "Ninguno de estos"', () => {
    expect(pasoRespondido(pasoQ21, {})).toBe(false);
    expect(pasoRespondido(pasoQ21, { detalle21: [false, false] })).toBe(false);
    expect(pasoRespondido(pasoQ21, { detalle21: [false, true] })).toBe(true);
    expect(pasoRespondido(pasoQ21, { ninguno21: true, 21: 0 })).toBe(true);
  });

  test('pasos con valores por defecto cuentan como respondidos', () => {
    ['multipleCantidad', 'cantidadDispositivo', 'multiGrupo', 'habitantesHogar'].forEach((tipo) => {
      expect(pasoRespondido({ tipo }, {})).toBe(true);
    });
  });
});
