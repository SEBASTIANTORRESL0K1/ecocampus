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
| Pruebas de rendimiento (k6) | `docs/testing/rendimiento.md` |
| Pruebas de compatibilidad (navegadores y dispositivos) | `docs/testing/compatibilidad.md` |

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
| Certificados | `backend/cert/cert.pem`, `idp.crt` y `key.pem` (llave de desarrollo, versionados con permiso del asesor); se montan por volumen en Docker |

- El IdP de la UCOL hace el POST de vuelta a `/api/auth/login/callback`, no a `/login/callback`; el backend registra ambas rutas y deben conservarse las dos.
- `acceptedClockSkewMs: -1` viene de la demo de la UCOL por el desfase de reloj del IdP.
- Con estas credenciales de desarrollo el callback apunta a `localhost:4006`, asi que el login solo funciona en el navegador de la maquina que corre el backend. Para otros equipos o para EC2 haria falta EntityID, certificados y callback propios (sistemas@ucol.mx); no inventarlos.

### Reglas del experimento

- El modo experimento es opt-in: solo se activa con `VITE_EXPERIMENTO_ACTIVO=true` (leida en `frontend/src/config/experiment.js`); el login y el guardado requieren ademas `VITE_API_URL`. Sin la variable, como en el despliegue publico de GitHub Pages (`deploy.yml` compila sin variables de entorno), la calculadora funciona normal.
- El acceso depende de `REQUIERE_LOGIN`: `true` = login federado SAML (solo `uTipo = Estudiante`); `false` = acceso con solo el correo (`POST /api/acceso/correo`), limitado a `CORREO_DOMINIOS_PERMITIDOS` (por defecto `ucol.mx` y subdominios, sin verificar la identidad, `+alias` descartado). Nunca hay envios anonimos. `GET /api/me` devuelve `modoAcceso` para que el frontend (`LoginGate`) elija la pantalla; en modo `correo` no se carga la estrategia SAML.
- El navegador nunca recibe correo, nombre ni numero de cuenta. El backend lee la identidad de la sesion y guarda un id pseudonimo (hash con `ID_SALT`), el correo y `metodo_acceso` (`saml`|`correo`) en MySQL. Una base existente se migra con `db/migraciones/001_metodo_acceso.sql`.
- Una respuesta por participante y por correo (indices `UNIQUE` en `db/schema.sql`).
- Las listas de opciones (sexo, carrera, semestre, planetas) deben coincidir entre `frontend/src/config/experiment.js` y `backend/src/validacion/respuestas.ts`.
- Los secretos de `.env` no se versionan ni se muestran en respuestas. La llave `key.pem` de desarrollo si se versiona (autorizado por el asesor); una llave propia de produccion no debe versionarse.

### Backend en TypeScript

- El backend esta en `backend/src/` (TypeScript estricto, Zod) y se compila a `dist/`; no hay JavaScript en la raiz de `backend/`. Estructura y comandos en la seccion "Backend (TypeScript)" del `README.md`.
- Comandos desde `backend/`: `npm run typecheck`, `npm test` (28+ pruebas, sin MySQL ni IdP), `npm run build`, `npm run dev`. El CI tiene un job `backend` con typecheck, pruebas y build.
- La configuracion se valida en `src/config/cargar.ts`; una variable nueva se agrega ahi y tambien al compose y a las tres plantillas `.env.*.example`. La identidad del participante se deriva en el servidor (`src/auth/participante.ts`); el correo nunca sale hacia el navegador.
- El esquema de las respuestas (`src/validacion/respuestas.ts`) define a la vez la validacion y el tipo de la fila de MySQL; si cambia `db/schema.sql`, cambian ambos y la lista `COLUMNAS`.
- La API esta documentada con OpenAPI en `backend/src/openapi/especificacion.ts` (copia en `docs/openapi.json`; `npm run openapi` la regenera; Swagger UI en `/docs` solo fuera de produccion). Toda ruta nueva o cambio en una respuesta se refleja ahi: las pruebas fallan si la especificacion se desalinea de las rutas de Express o del esquema Zod, o si `docs/openapi.json` esta desactualizado.
- Tras cambiar dependencias, recrear el contenedor de desarrollo con `docker compose up -d --build -V` (renueva el volumen de `node_modules`).
- Node 22 en las imagenes y en el CI.

### Stack con Docker

Esta dividido en `docker-compose.yml` (base comun), `docker-compose.dev.yml` y `docker-compose.prod.yml`; se eligen con `COMPOSE_FILE` en el `.env` (plantillas `.env.dev.example` y `.env.prod.example`) o con `-f`. `docker compose up --build` en desarrollo levanta MySQL 8, backend (nodemon), frontend (Vite) y las herramientas de base de datos. El `.env` de la raiz no se versiona.

| Servicio (desarrollo) | URL / puerto |
| :--- | :--- |
| Frontend (Vite) | `http://localhost:5173/ecocampus/` |
| Backend | `http://localhost:4006` |
| Adminer | `http://127.0.0.1:8081` (servidor `db`) |
| phpMyAdmin | `http://127.0.0.1:8082` (usuario `ecocampus`, contrasena `MYSQL_PASSWORD` del `.env`) |
| MySQL en el host | `127.0.0.1:3307` (el 3306 esta reservado en la maquina del usuario) |

- Los compose NO tienen valores por defecto ni literales de entorno: toda variable sale del `.env` con `${VAR:?mensaje}` y, si falta o esta vacia, `docker compose` falla. Al agregar una variable, ponerla en `.env.dev.example`, `.env.prod.example` y `.env.loadtest.example`. Las pruebas de carga usan `--env-file .env.loadtest`.
- Produccion: solo el contenedor `proxy` (Caddy) publica puertos; MySQL, backend y frontend quedan internos; Adminer y phpMyAdmin solo con `--profile tools`. Sin dominio se sirve por HTTP (`SITE_ADDRESS=:80`).
- Los valores SAML de arriba son los de **desarrollo** (viven en `.env.dev.example`); `backend/src/config/cargar.ts` los lee de `SAML_ISSUER`, `SAML_CALLBACK_URL`, `SAML_LOGOUT_CALLBACK_URL`, `SAML_ENTRY_POINT`, `SAML_LOGOUT_URL`, `SAML_CERT_DIR` y `SAML_CLOCK_SKEW_MS` para poder usar credenciales propias en produccion sin tocar el codigo.
- El flujo de ramas es `main -> experiment/survey-questions` (traer cambios de main a la rama del experimento). No fusionar `survey` en `main` hasta publicar el experimento; ver el historial de `49a704e`.
- Pruebas del backend: `cd backend && npm test`. Pruebas del frontend: `cd frontend && npx vitest run`.
- Dos pruebas de imagen de `Calculadora.test.jsx` fallan tambien en `main`; no son regresiones.
- E2E y compatibilidad (Playwright): `cd frontend && npx playwright test`. Usa su propio servidor en el puerto 5174 con `VITE_API_URL` vacia y `VITE_EXPERIMENTO_ACTIVO=false`.
- Carga (k6): `loadtest/k6.js` con `docker-compose.loadtest.yml`; el procedimiento esta en `docs/testing/rendimiento.md`. El equipo del usuario tiene poca RAM libre: detener el stack de desarrollo (`docker compose stop`) antes y no ejecutar a la vez pruebas pesadas.
