# Guia de pruebas de componentes — Vitest

## Stack

- **Vitest** como runner de pruebas
- **React Testing Library** para renderizar componentes e interactuar con el DOM
- **jest-dom** para matchers declarativos (`toHaveAttribute`, `toHaveTextContent`, etc.)

La configuracion vive en `frontend/vite.config.js` bajo el campo `test`.

---

## Globals

`globals: true` esta habilitado. No se necesitan importaciones para las APIs de Vitest:

```js
// Correcto — disponibles globalmente
describe('Mi componente', () => {
  test('hace algo', () => {
    expect(valor).toBe(true);
  });
});

vi.mock('./ruta/Componente', () => ({ default: () => null }));
```

Solo se importan explicitamente las utilidades de React Testing Library y los componentes bajo prueba.

---

## El problema de react-leaflet (ESM puro)

`react-leaflet` es un paquete ESM puro. Vitest no puede transformarlo en el entorno jsdom y lanzara un error si algun componente lo importa directamente o de forma transitiva.

**Solucion:** mockear el componente que importa `react-leaflet` antes de renderizarlo.

```js
vi.mock('./features/mapa/Mapa', () => ({ default: () => null }));
```

Reglas del mock:
- La factory devuelve `{ default: () => null }` — sintaxis de modulo ES, no una funcion directa.
- Colocar `vi.mock(...)` en el nivel superior del archivo de prueba, fuera de cualquier `describe` o `test`.
- En `App.test.jsx` se mockea `Mapa` porque `App` lo importa de forma transitiva a traves del router.

---

## Componentes con React Router

Los componentes que usan hooks de React Router (`useNavigate`, `Link`, `NavLink`, etc.) deben envolverse en `MemoryRouter` al renderizarlos en pruebas:

```js
import { MemoryRouter } from 'react-router-dom';

const renderLandingPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
```

No usar `BrowserRouter` en pruebas: depende del historial del navegador real y produce comportamiento inconsistente en jsdom.

---

## Patron renderX()

Encapsular el render con sus wrappers en una funcion auxiliar local. Esto evita repeticion y facilita agregar props o contexto en el futuro:

```js
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
    screen.getByRole('heading', { level: 1, name: /calcula tu huella ecológica/i });
  });
});
```

La funcion no necesita devolver nada; `screen` siempre apunta al ultimo arbol renderizado.

---

## Queries preferidas

Usar queries en este orden de preferencia:

1. `getByRole` — refleja la semantica ARIA, es la opcion mas cercana a como un usuario accede al contenido.
2. `getByText` — util para texto libre sin rol especifico.
3. `getByTestId` — ultimo recurso cuando no hay semantica accesible disponible.

Ejemplos concretos:

```js
// Encabezado de nivel 1 con texto especifico
screen.getByRole('heading', { level: 1, name: /calcula tu huella ecológica/i });

// Boton por nombre accesible
screen.getByRole('button', { name: /comenzar cálculo/i });

// Enlace por nombre accesible
screen.getByRole('link', { name: /comenzar cálculo/i });

// Encabezado de nivel 2 (verificar texto con matcher)
screen.getByRole('heading', { level: 2 }).toHaveTextContent('¿Qué es la huella ecológica?');
```

---

## Archivos de prueba existentes

### `frontend/src/App.test.jsx`

Pruebas:
- `renderiza sin errores` — smoke test: monta `<App />` completo sin excepciones.

Nota: incluye `vi.mock('./features/mapa/Mapa', ...)` para evitar el error de ESM de react-leaflet.

### `frontend/src/features/landing/LandingPage.test.jsx`

Pruebas:
- `renderiza sin errores` — smoke test de la pagina de inicio.
- `muestra el titulo principal` — verifica el `<h1>` con el texto de la calculadora.
- `muestra el boton Comenzar cálculo` — verifica el boton por rol y nombre accesible.
- `el enlace del boton apunta a /calculadora` — verifica el atributo `href` del enlace.
- `muestra la sección informativa sobre la huella ecológica` — verifica el `<h2>` de la seccion informativa.
- `muestra el dato estadístico de 3.1 hectáreas globales` — verifica el dato estadistico.
- `muestra el dato estadístico de 20.1 µg/m³` — verifica el dato estadistico de calidad del aire.

---

## Ubicacion de nuevos archivos de prueba

Colocar los archivos de prueba junto al componente que prueban, con el sufijo `.test.jsx`:

```
frontend/src/features/comunidad/
  Comunidad.jsx
  Comunidad.test.jsx       <-- nuevo archivo de prueba
```

Los archivos en `**/e2e/**` estan excluidos de Vitest automaticamente; no colocar pruebas de componentes en esa carpeta.
