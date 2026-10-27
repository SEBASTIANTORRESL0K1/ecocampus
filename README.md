# EcoCampus

[![Run Tests](https://github.com/SEBASTIANTORRESL0K1/ecocampus/actions/workflows/test.yml/badge.svg?branch=pages)](https://github.com/SEBASTIANTORRESL0K1/ecocampus/actions/workflows/test.yml)

Aplicación web para fomentar el reciclaje y la sostenibilidad en el campus de la Universidad de Colima. Permite calcular la huella ecológica personal, ubicar los puntos de reciclaje del campus en un mapa interactivo, consultar una guía de reciclaje y mantenerse informado sobre noticias y eventos ambientales de la comunidad universitaria.

Proyecto de tesis — Universidad de Colima.

## Tecnologías

- [React](https://react.dev/) 19 con [Vite](https://vite.dev/) 8 (`@vitejs/plugin-react`)
- [React Router](https://reactrouter.com/) 7 (`BrowserRouter` con `basename="/ecocampus"`)
- [Tailwind CSS](https://tailwindcss.com/) 4 mediante el plugin `@tailwindcss/vite`
- [Leaflet](https://leafletjs.com/) 1.9 / [react-leaflet](https://react-leaflet.js.org/) 5 para el mapa de puntos de reciclaje
- Font Awesome cargado desde CDN en `index.html`
- Pruebas: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) y [Playwright](https://playwright.dev/) para E2E

## Arquitectura

- SPA que corre solo en el cliente; no hay backend ni API.
- El código se organiza por funcionalidad: cada página vive en su carpeta dentro de `src/features/`.
- El contenido (preguntas de la calculadora, puntos de reciclaje, noticias y eventos) vive en módulos JS estáticos dentro de cada feature.
- `Navbar`, `Footer` y `PageLayout` en `src/components/layout/` son compartidos por todas las páginas.
- El único estado persistente es el progreso de la calculadora, guardado en `localStorage` bajo la clave `ecocampus:calculadora:v1`.

## Estructura del proyecto

```
ecocampus/
├── README.md, CLAUDE.md, SECURITY.md
├── .github/workflows/
│   ├── test.yml                 # CI: pruebas unitarias + E2E
│   └── deploy.yml               # despliegue a GitHub Pages
├── docs/
│   ├── README.md                # documentación general
│   ├── vista_1_inicio.md ... vista_5_guia_reciclaje.md   # una por vista
│   └── testing/                 # README.md, vitest-guidelines.md, playwright-e2e.md
└── frontend/
    ├── index.html               # entrada de Vite (carga /src/index.jsx)
    ├── vite.config.js           # plugins de Vite y Tailwind, base /ecocampus/, config de Vitest
    ├── playwright.config.js
    ├── e2e/                     # specs de Playwright (calculadora.spec.js)
    ├── public/                  # assets estáticos: Depositos/, Logos/, favicons, manifest,
    │                            # infografia_guia.jpeg, 404.html (redirección SPA)
    └── src/
        ├── index.jsx, App.jsx (rutas), setupTests.js
        ├── components/layout/   # Navbar, Footer, PageLayout
        ├── features/
        │   ├── landing/         # LandingPage
        │   ├── calculadora/     # Calculadora, preguntas.js, ImagenTema, ModalConfirmacion (<dialog> nativo),
        │   │                    # ToastAviso, pasoRespondido.js, progresoGuardado.js (localStorage)
        │   ├── mapa/            # Mapa, puntosReciclaje.js, customIcon.js
        │   ├── comunidad/       # Comunidad, noticiasEventos.js
        │   └── guiaReciclaje/   # GuiaReciclaje
        └── assets/              # background.jpg, markpointMap.svg
```

## Páginas

| Ruta               | Descripción                                                        |
|---------------------|---------------------------------------------------------------------|
| `/`                 | Landing page con información sobre la huella ecológica              |
| `/calculadora`      | Cuestionario para calcular la huella ecológica personal              |
| `/mapa`              | Mapa interactivo con los puntos de reciclaje del campus              |
| `/comunidad`         | Noticias y eventos ambientales                                       |
| `/guia-reciclaje`    | Guía con los principios y beneficios del reciclaje                   |

## Cómo correr el proyecto localmente

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en [http://localhost:5173/ecocampus/](http://localhost:5173/ecocampus/).

Otros scripts disponibles dentro de `frontend/`:

- `npm run build` — genera el build de producción en `frontend/dist/`
- `npm run preview` — sirve localmente el build de producción
- `npm test` — corre las pruebas unitarias y de componentes una vez
- `npm run test:watch` — corre Vitest en modo observación
- `npm run test:e2e` — corre las pruebas E2E con Playwright (levanta el servidor de desarrollo automáticamente)

## Pruebas

- Las pruebas de componentes y unitarias usan Vitest (jsdom, globals, setup en `src/setupTests.js`) y se ubican junto al código que prueban (`*.test.jsx` / `*.test.js`).
- Las pruebas E2E están en `frontend/e2e/` y corren en Chromium. Antes de la primera ejecución hay que instalar el navegador:

  ```bash
  npx playwright install chromium
  ```

- `react-leaflet` es ESM puro, por lo que las pruebas que renderizan `App` mockean el mapa con `vi.mock('./features/mapa/Mapa', () => ({ default: () => null }))`.
- Guías: [docs/testing/README.md](docs/testing/README.md), [docs/testing/vitest-guidelines.md](docs/testing/vitest-guidelines.md) y [docs/testing/playwright-e2e.md](docs/testing/playwright-e2e.md).

El workflow `.github/workflows/test.yml` corre en cada push o pull request a `pages` y `dev`, con dos jobs: `unit` (`npm test`) y `e2e` (Playwright en Chromium; sube el reporte y los traces si falla).

## Despliegue

El despliegue a GitHub Pages es automático mediante `.github/workflows/deploy.yml` en cada push a `pages`: usa Node 20, ejecuta `npm ci` y `npm run build`, y publica `frontend/dist`.

La ruta base es `/ecocampus/`, definida en `base` de `vite.config.js` y en el `basename` del Router. Para que las rutas de la SPA funcionen en GitHub Pages se usa la técnica de [spa-github-pages](https://github.com/rafgraph/spa-github-pages): `public/404.html` redirige a la raíz y un script en `frontend/index.html` restaura la ruta original.

## Documentación

- [docs/README.md](docs/README.md) — documentación general del proyecto
- Una guía por vista: [Inicio](docs/vista_1_inicio.md), [Calculadora](docs/vista_2_calculadora.md), [Mapa](docs/vista_3_mapa.md), [Comunidad](docs/vista_4_comunidad.md), [Guía de reciclaje](docs/vista_5_guia_reciclaje.md)
- Pruebas: [docs/testing/](docs/testing/README.md)
