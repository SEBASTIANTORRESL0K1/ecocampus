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

## Documentacion de pruebas

Antes de realizar cualquier cambio en pruebas (componentes o E2E), leer el archivo de documentacion correspondiente en `docs/testing/`:

| Tipo de cambio | Archivo |
|----------------|---------|
| Inicio rapido, filosofia, cuando agregar pruebas | `docs/testing/README.md` |
| Pruebas de componentes con Vitest | `docs/testing/vitest-guidelines.md` |
| Pruebas E2E con Playwright | `docs/testing/playwright-e2e.md` |

Esta regla aplica a nuevas pruebas, modificacion de tests existentes y cambios en la configuracion de Vitest o Playwright.

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

## Login federado UCOL (SAML) y experimento

El login usa la configuracion y los certificados de desarrollo que proporciono el asesor de tesis (tomados de https://github.com/Universidad-de-Colima/login-federado-node). Se mantienen tal cual; no cambiarlos sin que el usuario lo pida.

### Valores fijos (no modificar)

| Parametro | Valor |
| :--- | :--- |
| Puerto del backend | `4006` |
| `issuer` / EntityID | `http://localhost/20166932` |
| `callbackUrl` | `http://localhost:4006/login/callback` |
| `logoutCallbackUrl` | `http://localhost:4006/logout/callback` |
| `entryPoint` | `https://wayf.ucol.mx/saml2/idp/SSOService.php` |
| Certificados | `backend/cert/cert.pem` y `idp.crt` (versionados); `key.pem` esta en `.gitignore` y se monta por volumen |

- El IdP de la UCOL hace el POST de vuelta a `/api/auth/login/callback`, no a `/login/callback`; el backend registra ambas rutas y deben conservarse las dos.
- `acceptedClockSkewMs: -1` viene de la demo de la UCOL por el desfase de reloj del IdP.
- Con estas credenciales de desarrollo el callback apunta a `localhost:4006`, asi que el login solo funciona en el navegador de la maquina que corre el backend. Para otros equipos o para EC2 haria falta EntityID, certificados y callback propios (sistemas@ucol.mx); no inventarlos.

### Reglas del experimento

- El modo experimento se activa con `EXPERIMENTO_ACTIVO` en `frontend/src/config/experiment.js`; el login y el guardado requieren ademas `VITE_API_URL`.
- Solo participan estudiantes: el backend exige `uTipo = Estudiante`.
- El navegador nunca recibe correo, nombre ni numero de cuenta. El backend lee la identidad de la sesion SAML y guarda un id pseudonimo (hash con `ID_SALT`) y el correo en MySQL.
- Una respuesta por participante y por correo (indices `UNIQUE` en `db/schema.sql`).
- Las listas de opciones (sexo, carrera, semestre, planetas) deben coincidir entre `frontend/src/config/experiment.js` y `backend/validacion.js`.
- Los secretos (`.env`, `key.pem`) no se versionan ni se muestran en respuestas.

### Stack con Docker

`docker compose up --build` levanta MySQL 8, backend, frontend (nginx) y Adminer. Se necesita un `.env` en la raiz copiado de `.env.example`.

| Servicio | URL / puerto |
| :--- | :--- |
| Frontend | `http://localhost:8080/ecocampus/` |
| Backend | `http://localhost:4006` |
| Adminer | `http://127.0.0.1:8081` (servidor `db`) |
| MySQL en el host | `127.0.0.1:3307` (el 3306 esta reservado en la maquina del usuario) |

- Pruebas del backend: `cd backend && npm test`. Pruebas del frontend: `cd frontend && npx vitest run`.
- Dos pruebas de imagen de `Calculadora.test.jsx` fallan tambien en `main`; no son regresiones.
