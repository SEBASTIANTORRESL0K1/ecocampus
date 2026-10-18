# EcoCampus

[![Run Tests](https://github.com/SEBASTIANTORRESL0K1/ecocampus/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/SEBASTIANTORRESL0K1/ecocampus/actions/workflows/test.yml)

Aplicación web para fomentar el reciclaje y la sostenibilidad en el campus de la Universidad de Colima. Permite calcular la huella ecológica personal, ubicar los puntos de reciclaje del campus en un mapa interactivo, consultar una guía de reciclaje y mantenerse informado sobre noticias y eventos ambientales de la comunidad universitaria.

Proyecto de tesis — Universidad de Colima.

## Tecnologías

**Frontend**
- [React](https://react.dev/) 19 con [Vite](https://vite.dev/) 8 (`@vitejs/plugin-react`)
- [React Router](https://reactrouter.com/) 7 (`BrowserRouter` con `basename="/ecocampus"`)
- [Tailwind CSS](https://tailwindcss.com/) 4 mediante el plugin `@tailwindcss/vite`
- [Leaflet](https://leafletjs.com/) 1.9 / [react-leaflet](https://react-leaflet.js.org/) 5 para el mapa de puntos de reciclaje
- Font Awesome cargado desde CDN en `index.html`

**Backend (modo experimento)**
- Node.js 22 con [Express](https://expressjs.com/) 4 y [TypeScript](https://www.typescriptlang.org/) estricto
- [Zod](https://zod.dev/) para validar la configuración y las respuestas del cuestionario
- [Passport](https://www.passportjs.org/) con `@node-saml/passport-saml`: login federado de la Universidad de Colima (SAML) o acceso con solo el correo (ver [Acceso al estudio](#acceso-al-estudio))
- `mysql2` y `express-session` con las sesiones guardadas en MySQL

**Datos e infraestructura**
- MySQL 8; Adminer y phpMyAdmin para consultar la base
- Docker Compose (un archivo base más uno por entorno), nginx para servir el frontend y Caddy como proxy de entrada en producción

**Pruebas**
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (frontend) y `node:test` con `tsx` (backend)
- [Playwright](https://playwright.dev/) para E2E y compatibilidad de navegadores, y [k6](https://k6.io/) para pruebas de carga

## Arquitectura

El proyecto funciona de dos maneras:

- **Sitio público (GitHub Pages):** SPA que corre solo en el cliente, sin backend ni API. Es lo que se publica en cada push a `main`.
- **Modo experimento (Docker):** la misma SPA más un backend, una base MySQL y el login institucional. Al terminar la calculadora, los participantes (solo estudiantes de la UCOL) responden un cuestionario que se guarda en MySQL. Se activa con `VITE_EXPERIMENTO_ACTIVO=true`; sin esa variable la calculadora funciona normal.

En el modo experimento:
- El acceso se elige con `REQUIERE_LOGIN`: login federado de la UCOL o solo el correo (ver [Acceso al estudio](#acceso-al-estudio)). No hay envíos anónimos.
- El navegador nunca recibe el correo, el nombre ni el número de cuenta: el backend los lee de la sesión y guarda un identificador pseudónimo y el correo en MySQL.
- Hay un solo registro por participante y por correo (índices `UNIQUE` en `db/schema.sql`).

Sobre el código:
- Cada página vive en su carpeta dentro de `frontend/src/features/`.
- El contenido (preguntas de la calculadora, puntos de reciclaje, noticias y eventos) vive en módulos JS estáticos dentro de cada feature.
- `Navbar`, `Footer` y `PageLayout` en `src/components/layout/` son compartidos por todas las páginas.
- El progreso de la calculadora se guarda en `localStorage` bajo la clave `ecocampus:calculadora:v1`.

## Estructura del proyecto

```
ecocampus/
├── README.md, CLAUDE.md, SECURITY.md
├── docker-compose.yml           # base común: MySQL, backend, frontend
├── docker-compose.dev.yml       # desarrollo
├── docker-compose.prod.yml      # producción
├── docker-compose.loadtest.yml  # pruebas de carga
├── .env.dev.example, .env.prod.example, .env.loadtest.example   # plantillas con TODAS las variables
├── .github/workflows/
│   ├── test.yml                 # CI: jobs unit, backend, contrast, e2e y compatibilidad
│   ├── deploy.yml               # despliegue a GitHub Pages
│   └── deploy-lightsail.yml     # despliegue por SSH a AWS Lightsail (con aprobación y regreso automático)
├── backend/                     # API en TypeScript (ver "Backend (TypeScript)")
│   ├── src/                     # server.ts, app.ts, config/, auth/, routes/, validacion/, db.ts, logger.ts
│   ├── cert/                    # certificados SAML de desarrollo
│   └── Dockerfile               # etapas dev, build y prod
├── db/schema.sql                # tabla de respuestas (se aplica al crear el volumen)
├── deploy/                      # Caddyfile (proxy), desplegar.sh y preparar-servidor.sh (despliegue en Lightsail)
├── loadtest/                    # k6.js y results/ (resultados medidos)
├── docs/
│   ├── README.md                # documentación general
│   ├── vista_1_inicio.md ... vista_5_guia_reciclaje.md   # una por vista
│   └── testing/                 # guías de pruebas y reportes del servidor de producción
└── frontend/
    ├── index.html               # entrada de Vite (carga /src/index.jsx)
    ├── vite.config.js           # plugins, base /ecocampus/ y configuración de Vitest
    ├── playwright.config.js     # 5 proyectos: Chromium, Firefox, WebKit, Pixel 7 e iPhone 14
    ├── Dockerfile, Dockerfile.dev, nginx.conf
    ├── e2e/                     # calculadora.spec.js y compatibilidad.spec.js
    ├── public/                  # assets estáticos: Depositos/, Logos/, favicons, manifest,
    │                            # infografia_guia.jpeg, 404.html (redirección SPA)
    └── src/
        ├── index.jsx, App.jsx (rutas), setupTests.js
        ├── components/layout/   # Navbar, Footer, PageLayout
        ├── config/              # experiment.js (modo experimento y cuestionario)
        ├── features/
        │   ├── auth/            # LoginGate (login institucional en el modo experimento)
        │   ├── landing/         # LandingPage
        │   ├── calculadora/     # Calculadora, CuestionarioExperimento, preguntas.js, ImagenTema,
        │   │                    # ModalConfirmacion, ToastAviso, pasoRespondido.js, progresoGuardado.js
        │   ├── mapa/            # Mapa, puntosReciclaje.js, customIcon.js
        │   ├── comunidad/       # Comunidad, noticiasEventos.js
        │   └── guiaReciclaje/   # GuiaReciclaje
        └── assets/              # background.jpg, markpointMap.svg
```

## Páginas

| Ruta               | Descripción                                                        |
|---------------------|---------------------------------------------------------------------|
| `/`                 | Landing page con información sobre la huella ecológica              |
| `/calculadora`      | Cuestionario para calcular la huella ecológica personal (en el modo experimento pide login y termina con el cuestionario de evaluación) |
| `/mapa`              | Mapa interactivo con los puntos de reciclaje del campus              |
| `/comunidad`         | Noticias y eventos ambientales                                       |
| `/guia-reciclaje`    | Guía con los principios y beneficios del reciclaje                   |

## Acceso al estudio

La variable `REQUIERE_LOGIN` del `.env` decide cómo entra el participante. El backend informa el modo en `GET /api/me` (`modoAcceso`), así que el frontend muestra la pantalla que corresponde sin recompilarse.

| `REQUIERE_LOGIN` | Modo | Qué ve el participante | Qué necesita el servidor |
| :--- | :--- | :--- | :--- |
| `true` | `saml`: login federado | Botón «Iniciar sesión con UCOL». Solo pasan cuentas con `uTipo = Estudiante` | EntityID, callbacks y certificados registrados con sistemas@ucol.mx (variables `SAML_*`) y HTTPS |
| `false` | `correo`: solo el correo | Un campo para escribir el correo institucional | Nada más: no usa certificados, el IdP ni HTTPS |

Acceso por correo (`REQUIERE_LOGIN=false`):

- `CORREO_DOMINIOS_PERMITIDOS` (por defecto `ucol.mx`) lista los dominios aceptados, separados por comas. Cada uno admite también sus subdominios: `ucol.mx` acepta `alumno@alumnos.ucol.mx`.
- Se normaliza el correo antes de guardarlo: minúsculas y sin `+alias`, así que `alumno+2@ucol.mx` y `alumno@ucol.mx` son la misma persona (índices `UNIQUE`).
- **No se verifica que el correo sea de quien lo escribe** (no se envía ningún código). Cualquiera que conozca un correo de la universidad podría participar a su nombre. Las defensas son el dominio, el índice `UNIQUE` y los logs; úsalo cuando ese riesgo sea aceptable para el estudio y documéntalo en la tesis.
- Tampoco distingue alumnos de docentes: solo mira el dominio.
- No existen envíos anónimos en ningún modo: siempre hay una sesión con un participante identificado. Una sesión abierta con el otro modo no sirve (por ejemplo, al cambiar `REQUIERE_LOGIN`, quien entró con SAML debe volver a entrar).
- Cada fila guarda cómo entró el participante en la columna `metodo_acceso` (`saml` o `correo`) para poder separar los datos al analizarlos.
- En modo `correo` el backend no carga la estrategia SAML ni exige los certificados, y no monta `/login`, `/logout` ni `/Metadata`. Las variables `SAML_*` (y `SAML_CERT_HOST_DIR` en producción) siguen siendo obligatorias en el `.env` porque los compose no tienen valores por defecto: puedes dejar las de desarrollo y, en producción, apuntar `SAML_CERT_HOST_DIR` a una carpeta vacía.

### Migrar una base de datos existente

`db/schema.sql` solo corre al crear el volumen. Si tu base ya existía, agrega la columna `metodo_acceso` **antes** de levantar esta versión (si no, los envíos fallarán):

```bash
docker compose exec -T db sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < db/migraciones/001_metodo_acceso.sql
```

Las filas anteriores quedan como `saml`. Si ya se había aplicado, MySQL responde `Duplicate check constraint name` y no cambia nada. Las bases nuevas ya la traen. En un servidor existente, agrega también `CORREO_DOMINIOS_PERMITIDOS=ucol.mx` a su `.env`: los compose no tienen valores por defecto y no arrancan sin ella.

## Entornos

| Entorno | Para qué sirve | Archivos de compose | Variables | Cómo se levanta |
| :--- | :--- | :--- | :--- | :--- |
| [Desarrollo](#desarrollo) | Trabajar con recarga en vivo, base de datos y herramientas a mano | `docker-compose.yml` + `docker-compose.dev.yml` | `.env.dev.example` | `docker compose up --build` |
| [Producción](#producción) | Servidor real (VM) con un solo punto de entrada | `docker-compose.yml` + `docker-compose.prod.yml` | `.env.prod.example` | `docker compose up -d --build` |
| [Pruebas de carga](#pruebas-de-carga) | Medir el rendimiento en un entorno aislado | `docker-compose.yml` + `docker-compose.loadtest.yml` | `.env.loadtest.example` | ver la sección |
| [Sitio público](#sitio-público-github-pages) | Publicar solo el frontend | no usa Docker | ninguna | automático al hacer push a `main` |

### Configuración común

- Se necesita Docker Desktop, o Docker Engine con el plugin de compose.
- **Los compose no tienen valores por defecto:** toda variable se carga del `.env` y, si falta o está vacía, `docker compose` se detiene con un mensaje como `required variable SAML_ISSUER is missing a value`. Al agregar una variable nueva, añádela a las tres plantillas. Lo único fijo en los compose es lo que no es configuración de entorno: imágenes, puertos internos, rutas de volúmenes, límites de memoria y healthchecks.
- El `.env` de la raíz **no se versiona**. La plantilla de cada entorno trae `COMPOSE_FILE`, que le dice a `docker compose` qué archivos combinar. Sin él se pasan con `-f`: `docker compose -f docker-compose.yml -f docker-compose.dev.yml ...`.
- `backend/cert/` contiene `cert.pem`, `idp.crt` y `key.pem`, las credenciales SAML de desarrollo tomadas de [login-federado-node](https://github.com/Universidad-de-Colima/login-federado-node). Están versionadas con autorización del asesor y no sirven para producción.
- El esquema de la base está en `db/schema.sql` y solo se aplica al crear el volumen por primera vez. Los datos viven en el volumen `db_data`: `docker compose down` los conserva y `docker compose down -v` los borra.

## Desarrollo

```bash
cp .env.dev.example .env
docker compose up --build        # el .env ya indica COMPOSE_FILE (base + dev)
```

| Servicio | URL |
| :--- | :--- |
| Frontend (Vite, recarga en vivo) | http://localhost:5173/ecocampus/ |
| Backend (TypeScript con nodemon, reinicia al guardar) | http://localhost:4006 (`/health`, `/Metadata`) |
| Documentación de la API (Swagger UI) | http://localhost:4006/docs (la especificación en JSON: `/openapi.json`) |
| Adminer (consulta y exporta a CSV) | http://localhost:8081, servidor `db`, usuario `ecocampus`, base `ecocampus` |
| phpMyAdmin | http://localhost:8082, usuario `ecocampus` y la `MYSQL_PASSWORD` de tu `.env` (`root` usa `MYSQL_ROOT_PASSWORD`) |
| MySQL desde tu equipo | 127.0.0.1:3307 |

- El código de `backend/` y `frontend/` se monta como volumen: guardar un archivo recarga el servicio. Se usa polling porque los volúmenes montados desde Windows no emiten eventos de archivos.
- Si cambias `package.json` o `package-lock.json`, recrea con `docker compose up -d --build -V`. El `-V` renueva el volumen anónimo de `node_modules`; sin él, el contenedor sigue con las dependencias anteriores.
- El login usa las credenciales de desarrollo, cuyo callback es `localhost:4006`: funciona en el navegador de la misma máquina que corre el backend.

### Frontend sin Docker

Para trabajar solo en las vistas, sin backend ni base de datos:

```bash
cd frontend
npm install
npm run dev
```

La app queda en [http://localhost:5173/ecocampus/](http://localhost:5173/ecocampus/). Sin `VITE_API_URL` y `VITE_EXPERIMENTO_ACTIVO=true` el modo experimento queda apagado. Scripts dentro de `frontend/`:

- `npm run build` — genera el build de producción en `frontend/dist/`
- `npm run preview` — sirve localmente el build de producción
- `npm test` — pruebas unitarias y de componentes una vez
- `npm run test:watch` — Vitest en modo observación
- `npm run test:e2e` — pruebas E2E con Playwright (levanta su propio servidor)

### Backend (TypeScript)

Está escrito en TypeScript estricto (`strict` y `noUncheckedIndexedAccess`) y se compila a `backend/dist/`.

```
backend/src/
  server.ts            punto de entrada: carga la configuración, espera a MySQL y escucha
  app.ts               arma la aplicación de Express (crearApp), sin escuchar; también la usan las pruebas
  config/              variables de entorno validadas con Zod (falla al arrancar con un mensaje claro)
  auth/                estrategia SAML, correo (normalización y dominios) y derivación del participante
  routes/              saml (login federado), acceso (por correo), sesion (/api/me), respuestas, salud y docs
  validacion/          esquema Zod de las respuestas: valida y genera el tipo de la fila a insertar
  openapi/             especificación OpenAPI de la API y el generador de docs/openapi.json
  db.ts, logger.ts
```

| Comando (desde `backend/`) | Para qué sirve |
| :--- | :--- |
| `npm run dev` | Recarga en vivo con nodemon y tsx (lo usa el contenedor de desarrollo) |
| `npm run typecheck` | Comprueba los tipos sin generar archivos |
| `npm test` | Pruebas unitarias y de rutas (no necesitan MySQL ni el IdP) |
| `npm run build` | Compila a `dist/` |
| `npm run openapi` | Regenera `docs/openapi.json` a partir de la especificación en el código |
| `npm start` | Ejecuta el JavaScript compilado (lo que corre producción) |

### API (OpenAPI)

La API está documentada con OpenAPI 3.1 (14 operaciones en cuatro grupos: respuestas, autenticación, acceso por correo y sistema; cada ruta indica con `x-modos` en qué modo existe).

| Dónde | Qué |
| :--- | :--- |
| `docs/openapi.json` | Copia versionada de la especificación; se puede abrir en [editor.swagger.io](https://editor.swagger.io/) sin ejecutar nada |
| `http://localhost:4006/docs` | Swagger UI interactiva (solo en desarrollo; permite probar las rutas) |
| `http://localhost:4006/openapi.json` | La especificación servida por el backend |

- La especificación vive en el código (`backend/src/openapi/especificacion.ts`) y reutiliza las opciones y límites de la validación, así que no duplica valores.
- Las pruebas fallan si la documentación se desalinea del código: cada ruta registrada en Express (en cada modo de acceso) debe estar documentada, los campos obligatorios deben coincidir con el esquema Zod, el ejemplo debe ser una petición válida y `docs/openapi.json` debe estar al día. Si cambias una ruta o una respuesta, actualiza la especificación y ejecuta `npm run openapi` en `backend/`.
- En producción la interfaz `/docs` no se monta (Swagger es una dependencia de desarrollo y no va en la imagen) y el proxy tampoco enruta `/openapi.json`; la especificación queda disponible en el repositorio.

## Producción

```bash
cp .env.prod.example .env        # completa TODAS las variables
docker compose up -d --build     # el .env ya indica COMPOSE_FILE (base + prod)
```

- **Un solo punto de entrada:** el contenedor `proxy` (Caddy) es el único que publica puertos (80 y 443). Reenvía `/api`, `/login`, `/logout` y `/Metadata` al backend y todo lo demás al frontend. MySQL, backend y frontend no se publican.
- **Sin dominio todavía:** deja `SITE_ADDRESS=:80` y usa `http://IP-DEL-SERVIDOR` en `API_URL`, en `FRONTEND_URL` (con `/ecocampus/calculadora`) y en los callbacks SAML; el sitio se sirve por HTTP.
- **Con dominio:** pon `SITE_ADDRESS=tu.dominio`, esas URLs con `https://tu.dominio` y `COOKIE_SECURE=true`. Caddy obtiene y renueva el certificado HTTPS solo (el dominio debe apuntar al servidor y los puertos 80 y 443 deben estar abiertos).
- **Modo de acceso:** `REQUIERE_LOGIN=true` usa el login SAML (siguiente punto); `REQUIERE_LOGIN=false` deja entrar con solo el correo y no necesita nada de SAML, útil mientras no estén tramitados los datos con sistemas o no haya dominio con HTTPS. Detalles y riesgos en [Acceso al estudio](#acceso-al-estudio).
- **Login SAML:** las credenciales de desarrollo solo funcionan con callback en `localhost:4006` y no sirven para usuarios remotos (el backend lo avisa en sus logs). Los valores propios se tramitan con sistemas@ucol.mx y se configuran con `SAML_ISSUER`, `SAML_CALLBACK_URL`, `SAML_LOGOUT_CALLBACK_URL` y `SAML_CERT_HOST_DIR` (carpeta del servidor, fuera del repositorio, con `cert.pem`, `idp.crt` y `key.pem`). Todas las variables `SAML_*` son obligatorias en el `.env`.
- **Secretos obligatorios:** con `NODE_ENV=production` el backend exige `SESSION_SECRET` (mínimo 16 caracteres), `ID_SALT` y `DB_PASSWORD`, y no arranca sin ellos. Genéralos con `openssl rand -hex 32`.
- **Imagen:** la del backend contiene solo `dist/` y las dependencias de ejecución (sin TypeScript, tsx ni nodemon) y corre como usuario `node`.
- **Operación:** `restart: unless-stopped`, límites de memoria (MySQL 1 GB, backend 512 MB, el resto 128 MB) y rotación de logs (3 archivos de 10 MB por servicio).
- **Herramientas de base de datos:** no arrancan por defecto. Para usarlas: `docker compose --profile tools up -d` y entra por un túnel SSH a `127.0.0.1:8081` (Adminer) o `127.0.0.1:8082` (phpMyAdmin).

### Despliegue en una máquina virtual (EC2, Azure u otra)

1. Instancia Linux con Docker y el plugin de compose. En el grupo de seguridad abre solo los puertos 22 (limitado a tu IP), 80 y 443.
2. `git clone` del repositorio, la rama a desplegar, y `cp .env.prod.example .env` con todos los valores.
3. `docker compose up -d --build`. Para actualizar: `git pull` y el mismo comando.
4. Prueba `http://IP/ecocampus/` y `http://IP/api/me`. Con `REQUIERE_LOGIN=false` entra con un correo `@ucol.mx` y registra una respuesta de prueba antes de abrir el estudio; borra esa fila después.

### Despliegue automático en AWS Lightsail

El workflow `.github/workflows/deploy-lightsail.yml` despliega por SSH cada push a `experiment/survey-questions`: corre las pruebas del backend, espera tu aprobación (Environment `production`), actualiza el servidor con `docker compose up -d --build` y verifica que quede sano; si falla, **vuelve solo a la versión anterior**. Necesita una instancia preparada con `deploy/preparar-servidor.sh` y cuatro secrets en GitHub. Guía paso a paso, avisos y solución de problemas: [docs/despliegue-lightsail.md](docs/despliegue-lightsail.md).

### Respaldo y restauración de MySQL (manual)

```bash
# respaldo (guárdalo fuera del servidor)
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction ecocampus' > respaldo_$(date +%F).sql

# restauración
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecocampus' < respaldo_AAAA-MM-DD.sql
```

Haz un respaldo antes de iniciar el estudio y de forma periódica durante él. Si se pierde el volumen `db_data`, se pierden las respuestas.

## Pruebas de carga

Las pruebas sobre el servidor desplegado (Lighthouse, red del navegador, compatibilidad, carga de lectura y escritura, recursos del servidor y georreferenciación) están en [`docs/testing/produccion/`](docs/testing/produccion/README.md), con sus reportes. Lo que sigue describe el entorno aislado.

Se miden en un entorno aislado: un proyecto de compose aparte (`ecocampus-loadtest`) con su propio volumen de MySQL y sin puertos publicados, así que no toca los datos del estudio. El backend corre con `REQUIERE_LOGIN=false`: como no hay envíos anónimos, k6 abre una sesión con un correo único (`POST /api/acceso/correo`) antes de cada envío, sin necesitar SAML.

```bash
cp .env.loadtest.example .env.loadtest      # solo la primera vez
docker compose stop                         # libera memoria si el desarrollo está corriendo

docker compose --env-file .env.loadtest -p ecocampus-loadtest \
  -f docker-compose.yml -f docker-compose.loadtest.yml up -d --build

# perfil de carga (PERFIL=estres para el de estrés)
MSYS_NO_PATHCONV=1 docker run --rm --network ecocampus-loadtest_default \
  -e PERFIL=carga -v "$(pwd -W)/loadtest:/scripts" grafana/k6 run \
  --summary-export=/scripts/results/resumen.json /scripts/k6.js

docker compose --env-file .env.loadtest -p ecocampus-loadtest \
  -f docker-compose.yml -f docker-compose.loadtest.yml down -v
docker compose start
```

- En Linux o macOS se usa `$(pwd)` en lugar de `$(pwd -W)` y no hace falta `MSYS_NO_PATHCONV`.
- Perfiles: `carga` (hasta 100 usuarios virtuales, 3 min 21 s) y `estres` (hasta 300).
- El script es `loadtest/k6.js`. Sirve para repetir pruebas sin tocar el servidor real. Los resultados medidos y su análisis son los del servidor de producción, en [docs/testing/rendimiento.md](docs/testing/rendimiento.md) y [docs/testing/produccion/](docs/testing/produccion/README.md).
- `.env.loadtest` no se versiona. Las pruebas de carga corren contra el backend compilado (etapa `prod` del Dockerfile).

## Sitio público (GitHub Pages)

El despliegue es automático mediante `.github/workflows/deploy.yml` en cada push a `main`: usa Node 20, ejecuta `npm ci --ignore-scripts` y `npm run build`, y publica `frontend/dist`. No define variables de entorno, así que el modo experimento queda apagado y el sitio es solo el frontend.

La ruta base es `/ecocampus/`, definida en `base` de `vite.config.js` y en el `basename` del Router. Para que las rutas de la SPA funcionen en GitHub Pages se usa la técnica de [spa-github-pages](https://github.com/rafgraph/spa-github-pages): `public/404.html` redirige a la raíz y un script en `frontend/index.html` restaura la ruta original.

## Pruebas

| Qué | Dónde y cómo |
| :--- | :--- |
| Frontend: componentes y unitarias | Vitest (jsdom, globals, setup en `src/setupTests.js`), junto al código (`*.test.jsx` / `*.test.js`). `npm test` en `frontend/` |
| Backend: validación, configuración y rutas | `node:test` con `tsx` en `backend/src/**/*.test.ts`. `npm test` en `backend/` (no necesita MySQL ni el IdP) |
| E2E de la calculadora | Playwright en Chromium: `frontend/e2e/calculadora.spec.js` |
| Compatibilidad | Playwright en Chromium, Firefox, WebKit, Pixel 7 e iPhone 14: `frontend/e2e/compatibilidad.spec.js` (resultados contra el servidor de producción en [docs/testing/produccion/](docs/testing/produccion/README.md#compatibilidad)) |
| Carga | k6, ver [Pruebas de carga](#pruebas-de-carga) |

- Antes de la primera ejecución de Playwright hay que instalar los navegadores: `npx playwright install chromium firefox webkit`.
- Playwright levanta su propio servidor de desarrollo en el puerto 5174 con el modo experimento apagado, para que la calculadora muestre su resultado al finalizar.
- `react-leaflet` es ESM puro, por lo que las pruebas que renderizan `App` mockean el mapa con `vi.mock('./features/mapa/Mapa', () => ({ default: () => null }))`.
- El workflow `.github/workflows/test.yml` corre en cada push o pull request a `main` y `dev`, con cinco jobs: `unit` (frontend), `backend` (typecheck, pruebas y build), `contrast` (contraste WCAG de la landing), `e2e` (la calculadora en Chromium; sube el reporte y los traces si falla) y `compatibilidad` (los 5 perfiles de navegador y dispositivo; instala Chromium, Firefox y WebKit y sube `compatibilidad.json` con las versiones probadas).

## Documentación

- [docs/README.md](docs/README.md) — documentación general del proyecto
- Una guía por vista: [Inicio](docs/vista_1_inicio.md), [Calculadora](docs/vista_2_calculadora.md), [Mapa](docs/vista_3_mapa.md), [Comunidad](docs/vista_4_comunidad.md), [Guía de reciclaje](docs/vista_5_guia_reciclaje.md)
- [Despliegue automático en AWS Lightsail](docs/despliegue-lightsail.md)
- Pruebas: [docs/testing/](docs/testing/README.md), con [rendimiento](docs/testing/rendimiento.md) y el [reporte del servidor de producción](docs/testing/produccion/README.md)
