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

## Entorno de pruebas (Jest + CRA)

El stack de testing tiene incompatibilidades conocidas entre CRA (`react-scripts` 5 / Jest 27 / jsdom 16) y dependencias modernas. Las siguientes soluciones ya están aplicadas en `setupTests.js` y `package.json`:

### React Router v7 + Jest 27

**Problema 1 — subpath exports:** Jest 27 no resuelve `react-router/dom` porque no soporta el campo `exports` de `package.json` con subpaths.
**Solucion:** `moduleNameMapper` en `package.json`:
```json
"jest": {
  "moduleNameMapper": {
    "^react-router/dom$": "<rootDir>/node_modules/react-router/dist/development/dom-export.js"
  }
}
```

**Problema 2 — TextEncoder/TextDecoder:** jsdom 16 no incluye estas APIs del navegador que React Router v7 usa internamente.
**Solucion:** polyfill en `setupTests.js` usando la implementacion real de Node.js:
```js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

### react-leaflet + Jest (ESM)

**Problema:** `react-leaflet` distribuye ESM puro (`export` syntax). Jest 27 no transpila `node_modules` por defecto.
**Solucion:** mockear el componente que lo importa directamente en el test (`jest.mock('./features/mapa/Mapa', () => () => null)`). No modificar `transformIgnorePatterns` porque CRA no lo expone sin eject.

### Deuda tecnica pendiente

CRA esta abandonado desde 2023. Migrar a **Vite + Vitest** elimina todos estos problemas de raiz (soporte nativo ESM, jsdom moderno, configuracion explicita). Considerar para cuando el proyecto escale.
