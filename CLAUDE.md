# EcoCampus — Instrucciones para Claude Code

## Subagentes

Siempre que se asigne una actividad de escritura (código, pruebas, UI, backend, etc.), usar el subagente disponible que corresponda a la categoría de esa actividad. Ejemplos de mapeo:

- Frontend / componentes React → `voltagent-core-dev:frontend-developer`
- Backend / APIs / servicios → `voltagent-core-dev:backend-developer`
- Feature completa (DB + API + UI) → `voltagent-core-dev:fullstack-developer`
- Pruebas unitarias / integración → agente general `claude` con foco en testing
- Diseño de API / OpenAPI → `voltagent-core-dev:api-designer`
- UI / sistema de diseño → `voltagent-core-dev:ui-designer`
- WebSockets / tiempo real → `voltagent-core-dev:websocket-engineer`
- Aplicación Electron → `voltagent-core-dev:electron-pro`
- Mobile → `voltagent-core-dev:mobile-developer`
- Sin categoría especializada → agente general `claude`

## Documentacion de vistas

Antes de realizar cualquier cambio en una vista, leer el archivo de documentacion correspondiente en `docs/`:

| Vista | Archivo |
|-------|---------|
| Inicio / LandingPage | `docs/vista_1_inicio.md` |
| Calculadora | `docs/vista_2_calculadora.md` |
| Mapa | `docs/vista_3_mapa.md` |
| Comunidad | `docs/vista_4_comunidad.md` |
| Guia de reciclaje | `docs/vista_5_guia_reciclaje.md` |

Esta regla aplica a cambios de codigo, pruebas, estilos y cualquier modificacion funcional relacionada con la vista.

## Estilo

- No usar emojis en archivos de documentacion (.md).

## Entorno de pruebas (Vite + Vitest)

El proyecto usa **Vite 8** como bundler y **Vitest** como runner de pruebas con jsdom moderno. No hay workarounds de compatibilidad: ESM, subpath exports y TextEncoder/TextDecoder funcionan de forma nativa.

### Configuracion

La configuracion de Vitest vive en `vite.config.js` (campo `test`):
- `environment: 'jsdom'` — DOM moderno, sin polyfills manuales
- `globals: true` — `describe`, `test`, `expect`, `vi` disponibles globalmente en los tests
- `setupFiles: './src/setupTests.js'` — solo importa `@testing-library/jest-dom`

### react-leaflet (ESM)

`react-leaflet` es ESM puro. Mockear el componente que lo importa directamente en cada test:
```js
vi.mock('./features/mapa/Mapa', () => ({ default: () => null }));
```

Nota: la factory debe devolver `{ default: ... }` (sintaxis de modulo ES) en lugar de una funcion directamente.
