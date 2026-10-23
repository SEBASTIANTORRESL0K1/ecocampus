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

Hay dos patrones segun donde se usa el mock:

**Patron 1 — mockear el componente que usa react-leaflet** (cuando se prueba un componente padre que importa `Mapa` de forma transitiva):

```js
vi.mock('./features/mapa/Mapa', () => ({ default: () => null }));
```

Se usa en `App.test.jsx` porque `App` importa `Mapa` a traves del router.

**Patron 2 — mockear react-leaflet directamente** (cuando se prueba el propio componente `Mapa`):

```js
vi.mock("react-leaflet", () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
}));
```

Se usa en `Mapa.test.jsx` para que el componente pueda montarse sin intentar cargar el mapa real.

Reglas comunes a los dos patrones:
- La factory devuelve un objeto con las exportaciones — sintaxis de modulo ES, no una funcion directa.
- Colocar `vi.mock(...)` en el nivel superior del archivo de prueba, fuera de cualquier `describe` o `test`.

---

## `<dialog>` nativo en jsdom

jsdom no implementa `HTMLDialogElement.prototype.showModal()` ni `close()`. `src/setupTests.js` agrega un stub minimo, protegido con `if (!HTMLDialogElement.prototype.showModal)` para que no actue si una version futura de jsdom los implementa:

- `showModal()` / `show()` agregan el atributo `open`.
- `close()` quita `open` y emite el evento `close` (de forma sincrona).

El stub no simula la capa superior, el fondo inerte ni la tecla Escape. Un `<dialog>` cerrado tiene `display: none` en jsdom, por lo que `queryByRole('dialog')` devuelve `null`; abierto, se encuentra por su rol implicito `dialog`. Para probar Escape, disparar el evento `cancel` sobre el dialogo:

```js
fireEvent(dialogo, createEvent('cancel', dialogo, {}, { EventType: 'Event' }));
```

El clic en el fondo (`::backdrop`) se representa con `fireEvent.click(dialogo)`, porque en el navegador ese clic tiene como `target` el propio `<dialog>`.

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

### `frontend/src/features/calculadora/Calculadora.test.jsx`

Incluye pruebas de persistencia: respuestas que sobreviven a desmontar y montar, JSON corrupto, y los botones "Contestar de nuevo" y "Revisar mis respuestas". Limpia localStorage en `beforeEach`.

- Toast de progreso recuperado: usa `vi.useFakeTimers()` y `act(() => vi.advanceTimersByTime(...))` para comprobar el cierre automatico a los 5 s, la pausa con el cursor encima y el boton "Cerrar aviso". El avance se divide en dos llamadas (fin de los 5 s y luego los 300 ms de salida) porque el temporizador de salida se programa despues de que React procesa el cambio de estado. Restaurar con `vi.useRealTimers()` en `afterEach`.
- Toast: la pausa por cursor se prueba con `fireEvent.mouseEnter` sobre el contenedor flotante (`closest('.fixed')`), no sobre el `role="status"` interno; la pausa por foco enfocando "Cerrar aviso" dentro de `act`.
- Modal de confirmacion (`<dialog>` nativo, ver la seccion anterior): elemento `DIALOG` con atributo `open`, foco inicial en "Cancelar", bloqueo de scroll, Cancelar, Escape (evento `cancel`), clic en el fondo y clic en el contenido (no cierra), rotacion de foco con Tab / Shift+Tab (`keyDown` sobre el boton enfocado), retorno del foco y que el almacenamiento solo se borra al confirmar.

- Modo experimento (resultado primero): `config/experiment` se mockea con `vi.hoisted` y getters (`EXPERIMENTO_ACTIVO`, `API_URL`) para activarlo por prueba, y `CuestionarioExperimento` se envuelve para anadir un boton auxiliar "Simular envio". Cubre el boton "Continuar con el cuestionario", el rechazo del consentimiento, el agradecimiento tras un envio correcto o `duplicado` y que otros errores conserven el boton.

### `frontend/src/features/calculadora/progresoGuardado.test.js`

Pruebas unitarias del modulo de persistencia: ida y vuelta guardar/cargar, JSON corrupto o con forma invalida, limites de `pasoActual`, localStorage que lanza errores (con `vi.spyOn(Storage.prototype, ...)`) y equivalencia del calculo con claves numericas convertidas a texto.

### `frontend/src/features/auth/LoginGate.test.jsx`

Mockea `../../config/experiment` para controlar `API_URL` y `LOGIN_REQUERIDO`, y simula `fetch` con una funcion auxiliar que devuelve respuestas configurables para `/api/me` y `/api/acceso/correo`.

- Modo `saml`: sin sesion muestra el enlace de login con la UCOL; cuenta no permitida muestra el aviso; sesion valida muestra el contenido protegido.
- Modo `correo`: sin sesion muestra el campo de correo; envio valido llama a la API con `credentials: "include"` y muestra el contenido; dominio no permitido o correo invalido muestran un `role="alert"`; boton deshabilitado sin texto.
- Error de red: ofrece el boton "Reintentar".

### `frontend/src/features/comunidad/Comunidad.test.jsx`

Mockea `useScrollReveal` y los iconos de `lucide-react` para aislar el componente.

- Smoke test: monta sin errores.
- Titulo `<h1>` con el texto "Comunidad EcoCampus".
- Subtitulo descriptivo del hero.
- Tres `<h2>` con los titulos de las publicaciones (limpieza de playa, nueva estacion de reciclaje, taller de compostaje).
- Badges de tipo: al menos tres elementos con el texto "Evento" o "Noticia".
- Fechas de las tres publicaciones.

### `frontend/src/features/guiaReciclaje/GuiaReciclaje.test.jsx`

Mockea `useScrollReveal` y los iconos de `lucide-react`.

- Smoke test y titulo `<h1>` "Guia de Reciclaje".
- Los tres encabezados de las 3 R (Reciclar, Reutilizar, Reducir).
- Las tres categorias de beneficios (Ambientales, Economicos, Sociales).
- El enlace "Conoce mas" apunta a `https://portal.ucol.mx/siga/reforestaccion/` y tiene `rel="noopener noreferrer"`.

### `frontend/src/features/mapa/Mapa.test.jsx`

Mockea `react-leaflet` directamente (patron 2), `useScrollReveal`, `lucide-react` y el CSS de Leaflet.

- Smoke test: monta sin errores.
- `<h1>` con el texto "Mapa de Reciclaje".
- Texto "21 puntos de reciclaje".
- Subtitulo con "Campus Central".

### `frontend/src/features/landing/LandingPage.contrast.test.js`

Prueba puramente computacional: no renderiza componentes ni importa React. Implementa la formula de contraste WCAG 2.1 (luminancia relativa, alpha compositing) y verifica los pares texto/fondo de `LandingPage.jsx`.

- Suite `getContrastRatio`: negro sobre blanco = 21:1; color sobre si mismo = 1:1; simetria; hex corto y rgba; semitransparente mezclado sobre blanco.
- Suite `LandingPage — contraste WCAG AA`: hero (H1, subtitulo, descripcion, boton y hover del boton), seccion About (subtitulo, H2, parrafos, `strong`, numeros estadisticos, etiquetas), seccion Services y tarjetas de herramientas.

Si los colores del componente cambian, actualizar las constantes de color al inicio del archivo de prueba.

### `frontend/src/hooks/useScrollReveal.test.jsx`

Sustituye `IntersectionObserver` con una implementacion simulada que permite disparar intersecciones a mano con `act()`.

- Un elemento que se monta despues del primer render (como la pantalla de resultado de la calculadora) queda observado y recibe la clase `is-visible` al intersectar.
- Sin `IntersectionObserver` disponible el contenido se muestra directamente (fallback).

---

## Ubicacion de nuevos archivos de prueba

Colocar los archivos de prueba junto al componente que prueban, con el sufijo `.test.jsx`:

```
frontend/src/features/comunidad/
  Comunidad.jsx
  Comunidad.test.jsx       <-- nuevo archivo de prueba
```

Los archivos en `**/e2e/**` estan excluidos de Vitest automaticamente; no colocar pruebas de componentes en esa carpeta.
