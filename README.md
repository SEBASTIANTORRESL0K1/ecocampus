# EcoCampus

[![Run Tests](https://github.com/SEBASTIANTORRESL0K1/ecocampus/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/SEBASTIANTORRESL0K1/ecocampus/actions/workflows/test.yml)

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

El workflow `.github/workflows/test.yml` corre en cada push o pull request a `main` y `dev`, con dos jobs: `unit` (`npm test`) y `e2e` (Playwright en Chromium; sube el reporte y los traces si falla).

## Despliegue

El despliegue a GitHub Pages es automático mediante `.github/workflows/deploy.yml` en cada push a `main`: usa Node 20, ejecuta `npm ci` y `npm run build`, y publica `frontend/dist`.

La ruta base es `/ecocampus/`, definida en `base` de `vite.config.js` y en el `basename` del Router. Para que las rutas de la SPA funcionen en GitHub Pages se usa la técnica de [spa-github-pages](https://github.com/rafgraph/spa-github-pages): `public/404.html` redirige a la raíz y un script en `frontend/index.html` restaura la ruta original.

## Documentación

- [docs/README.md](docs/README.md) — documentación general del proyecto
- Una guía por vista: [Inicio](docs/vista_1_inicio.md), [Calculadora](docs/vista_2_calculadora.md), [Mapa](docs/vista_3_mapa.md), [Comunidad](docs/vista_4_comunidad.md), [Guía de reciclaje](docs/vista_5_guia_reciclaje.md)
- Pruebas: [docs/testing/](docs/testing/README.md)

## Ejecucion con Docker (experimento)

Requiere Docker Desktop (o Docker Engine con el plugin compose). La configuracion esta dividida en un archivo base y un archivo por entorno:

| Archivo | Para que sirve |
| :--- | :--- |
| `docker-compose.yml` | Base comun: MySQL 8, backend y frontend (sin puertos ni build del frontend) |
| `docker-compose.dev.yml` | Desarrollo: recarga en vivo, puertos abiertos, Adminer y phpMyAdmin |
| `docker-compose.prod.yml` | Produccion: imagenes construidas, solo el proxy publica puertos, limites, rotacion de logs |
| `docker-compose.loadtest.yml` | Entorno aislado para pruebas de carga (ver `docs/testing/rendimiento.md`) |
| `.env.dev.example` / `.env.prod.example` | Plantillas de variables para cada entorno |

### Desarrollo

```
cp .env.dev.example .env
docker compose up --build        # .env ya indica COMPOSE_FILE (base + dev)
```

| Servicio | URL |
| :--- | :--- |
| Frontend (Vite, recarga en vivo) | http://localhost:5173/ecocampus/ |
| Backend (nodemon, reinicia al guardar) | http://localhost:4006 (`/health`, `/Metadata`) |
| Adminer (consulta y exporta a CSV) | http://localhost:8081, servidor `db`, usuario `ecocampus`, base `ecocampus` |
| phpMyAdmin | http://localhost:8082, usuario `ecocampus` y la contrasena `MYSQL_PASSWORD` de tu `.env` (el usuario `root` usa `MYSQL_ROOT_PASSWORD`) |
| MySQL desde tu equipo | 127.0.0.1:3307 |

- El codigo de `backend/` y `frontend/` se monta como volumen: editar un archivo recarga el servicio (se usa polling porque los volumenes montados desde Windows no emiten eventos de archivos).
- `backend/cert/` contiene `cert.pem`, `idp.crt` y `key.pem` (de desarrollo, tomados de https://github.com/Universidad-de-Colima/login-federado-node); estan versionados en el repo con autorizacion del asesor (son credenciales de desarrollo, no de produccion).
- Los datos viven en el volumen `db_data`; `docker compose down` los conserva y `docker compose down -v` los borra.
- El esquema esta en `db/schema.sql` y solo se aplica al crear el volumen por primera vez.
- Pruebas del backend: `cd backend && npm test`.

### Produccion

```
cp .env.prod.example .env        # completa TODAS las variables
docker compose up -d --build     # .env ya indica COMPOSE_FILE (base + prod)
```

Sin un `.env` con `COMPOSE_FILE`, usa los archivos de forma explicita: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`.

- **Un solo punto de entrada:** el contenedor `proxy` (Caddy) es el unico que publica puertos (80 y 443). Reenvia `/api`, `/login`, `/logout` y `/Metadata` al backend y todo lo demas al frontend. MySQL, backend y frontend no se publican.
- **Sin dominio todavia:** deja `SITE_ADDRESS=:80` y `PUBLIC_URL=http://IP-DEL-SERVIDOR`; el sitio se sirve por HTTP. Con dominio, pon `SITE_ADDRESS=tu.dominio`, `PUBLIC_URL=https://tu.dominio` y `COOKIE_SECURE=true`: Caddy obtiene y renueva el certificado HTTPS solo (el dominio debe apuntar al servidor y los puertos 80 y 443 deben estar abiertos).
- **Login SAML:** sin `SAML_ISSUER` ni certificados propios se usan los de desarrollo, que solo funcionan con callback en `localhost:4006` y no sirven para usuarios remotos (el backend lo avisa en sus logs). Los valores propios los tramita sistemas@ucol.mx; se configuran con `SAML_ISSUER`, `SAML_CALLBACK_URL`, `SAML_LOGOUT_CALLBACK_URL` y `SAML_CERT_HOST_DIR` (carpeta del servidor, fuera del repositorio, con `cert.pem`, `idp.crt` y `key.pem`). Los callbacks se derivan de `PUBLIC_URL` si no los defines.
- **Herramientas de base de datos:** no arrancan por defecto. Para usarlas: `docker compose --profile tools up -d` y entra por un tunel SSH a `127.0.0.1:8081` (Adminer) o `127.0.0.1:8082` (phpMyAdmin).
- **Operacion:** `restart: unless-stopped`, limites de memoria (MySQL 1 GB, backend 512 MB, el resto 128 MB) y rotacion de logs (3 archivos de 10 MB por servicio).

### Despliegue en una maquina virtual (EC2, Azure u otra)

1. Instancia Linux con Docker y el plugin compose; en el grupo de seguridad abre solo los puertos 22 (limitado a tu IP), 80 y 443.
2. `git clone` del repositorio, rama a desplegar, y `cp .env.prod.example .env` con todos los valores (genera secretos con `openssl rand -hex 32`).
3. `docker compose up -d --build`. Para actualizar: `git pull` y el mismo comando.
4. Prueba `http://IP/ecocampus/`, `http://IP/api/me` y registra una respuesta de prueba (con `REQUIERE_LOGIN=false` temporal) antes de abrir el estudio; borra esa fila despues.

### Respaldo y restauracion de MySQL (manual)

```
# respaldo (guardalo fuera del servidor)
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction ecocampus' > respaldo_$(date +%F).sql

# restauracion
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecocampus' < respaldo_AAAA-MM-DD.sql
```

Haz un respaldo antes de iniciar el estudio y de forma periodica durante el; si se pierde el volumen `db_data`, se pierden las respuestas.
