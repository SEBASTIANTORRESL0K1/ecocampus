# Despliegue y entornos

## Entornos disponibles

| Entorno | Para que sirve | Archivos de compose | Variables | Como se levanta |
| :--- | :--- | :--- | :--- | :--- |
| [Desarrollo](#desarrollo) | Trabajar con recarga en vivo, base de datos y herramientas a mano | `docker-compose.yml` + `docker-compose.dev.yml` | `.env.dev.example` | `docker compose up --build` |
| [Produccion](#produccion) | Servidor real (VM) con un solo punto de entrada | `docker-compose.yml` + `docker-compose.prod.yml` | `.env.prod.example` | `docker compose up -d --build` |
| [Pruebas de carga](#pruebas-de-carga) | Medir el rendimiento en un entorno aislado | `docker-compose.yml` + `docker-compose.loadtest.yml` | `.env.loadtest.example` | ver la seccion |
| [Sitio publico](#sitio-publico-github-pages) | Publicar solo el frontend | no usa Docker | ninguna | automatico al hacer push a `main` |

## Configuracion comun

- Se necesita Docker Desktop, o Docker Engine con el plugin de compose.
- **Los compose no tienen valores por defecto:** toda variable se carga del `.env` y, si falta o esta vacia, `docker compose` se detiene con un mensaje como `required variable SAML_ISSUER is missing a value`. Al agregar una variable nueva, anadela a las tres plantillas. Lo unico fijo en los compose es lo que no es configuracion de entorno: imagenes, puertos internos, rutas de volumenes, limites de memoria y healthchecks.
- El `.env` de la raiz **no se versiona**. La plantilla de cada entorno trae `COMPOSE_FILE`, que le dice a `docker compose` que archivos combinar. Sin el se pasan con `-f`: `docker compose -f docker-compose.yml -f docker-compose.dev.yml ...`.
- `backend/cert/` contiene `cert.pem`, `idp.crt` y `key.pem`, las credenciales SAML de desarrollo tomadas de [login-federado-node](https://github.com/Universidad-de-Colima/login-federado-node). Estan versionadas con autorizacion del asesor y no sirven para produccion.
- El esquema de la base esta en `db/schema.sql` y solo se aplica al crear el volumen por primera vez. Los datos viven en el volumen `db_data`: `docker compose down` los conserva y `docker compose down -v` los borra.

## Desarrollo

```bash
cp .env.dev.example .env
docker compose up --build        # el .env ya indica COMPOSE_FILE (base + dev)
```

| Servicio | URL |
| :--- | :--- |
| Frontend (Vite, recarga en vivo) | http://localhost:5173/ecocampus/ |
| Backend (TypeScript con nodemon, reinicia al guardar) | http://localhost:4006 (`/health`, `/Metadata`) |
| Documentacion de la API (Swagger UI) | http://localhost:4006/docs (la especificacion en JSON: `/openapi.json`) |
| Adminer (consulta y exporta a CSV) | http://localhost:8081, servidor `db`, usuario `ecocampus`, base `ecocampus` |
| phpMyAdmin | http://localhost:8082, usuario `ecocampus` y la `MYSQL_PASSWORD` de tu `.env` (`root` usa `MYSQL_ROOT_PASSWORD`) |
| MySQL desde tu equipo | 127.0.0.1:3307 |

- El codigo de `backend/` y `frontend/` se monta como volumen: guardar un archivo recarga el servicio. Se usa polling porque los volumenes montados desde Windows no emiten eventos de archivos.
- Si cambias `package.json` o `package-lock.json`, recrea con `docker compose up -d --build -V`. El `-V` renueva el volumen anonimo de `node_modules`; sin el, el contenedor sigue con las dependencias anteriores.
- El login usa las credenciales de desarrollo, cuyo callback es `localhost:4006`: funciona en el navegador de la misma maquina que corre el backend.

### Frontend sin Docker

Para trabajar solo en las vistas, sin backend ni base de datos:

```bash
cd frontend
npm install
npm run dev
```

La app queda en [http://localhost:5173/ecocampus/](http://localhost:5173/ecocampus/). Sin `VITE_API_URL` y `VITE_EXPERIMENTO_ACTIVO=true` el modo experimento queda apagado. Scripts dentro de `frontend/`:

- `npm run build` -- genera el build de produccion en `frontend/dist/`
- `npm run preview` -- sirve localmente el build de produccion
- `npm test` -- pruebas unitarias y de componentes una vez
- `npm run test:watch` -- Vitest en modo observacion
- `npm run test:e2e` -- pruebas E2E con Playwright (levanta su propio servidor)

## Produccion

```bash
cp .env.prod.example .env        # completa TODAS las variables
docker compose up -d --build     # el .env ya indica COMPOSE_FILE (base + prod)
```

- **Un solo punto de entrada:** el contenedor `proxy` (Caddy) es el unico que publica puertos (80 y 443). Reenvia `/api`, `/login`, `/logout` y `/Metadata` al backend y todo lo demas al frontend. MySQL, backend y frontend no se publican.
- **Sin dominio todavia:** deja `SITE_ADDRESS=:80` y usa `http://IP-DEL-SERVIDOR` en `API_URL`, en `FRONTEND_URL` (con `/ecocampus/calculadora`) y en los callbacks SAML; el sitio se sirve por HTTP.
- **Con dominio:** pon `SITE_ADDRESS=tu.dominio`, esas URLs con `https://tu.dominio` y `COOKIE_SECURE=true`. Caddy obtiene y renueva el certificado HTTPS solo (el dominio debe apuntar al servidor y los puertos 80 y 443 deben estar abiertos).
- **Modo de acceso:** `REQUIERE_LOGIN=true` usa el login SAML; `REQUIERE_LOGIN=false` deja entrar con solo el correo y no necesita nada de SAML, util mientras no esten tramitados los datos con sistemas o no haya dominio con HTTPS. Detalles y riesgos en [Backend: Acceso al estudio](../backend/README.md#acceso-al-estudio).
- **Login SAML:** las credenciales de desarrollo solo funcionan con callback en `localhost:4006` y no sirven para usuarios remotos (el backend lo avisa en sus logs). Los valores propios se tramitan con sistemas@ucol.mx y se configuran con `SAML_ISSUER`, `SAML_CALLBACK_URL`, `SAML_LOGOUT_CALLBACK_URL` y `SAML_CERT_HOST_DIR` (carpeta del servidor, fuera del repositorio, con `cert.pem`, `idp.crt` y `key.pem`). Todas las variables `SAML_*` son obligatorias en el `.env`.
- **Secretos obligatorios:** con `NODE_ENV=production` el backend exige `SESSION_SECRET` (minimo 16 caracteres), `ID_SALT` y `DB_PASSWORD`, y no arranca sin ellos. Generalos con `openssl rand -hex 32`.
- **Imagen:** la del backend contiene solo `dist/` y las dependencias de ejecucion (sin TypeScript, tsx ni nodemon) y corre como usuario `node`.
- **Operacion:** `restart: unless-stopped`, limites de memoria (MySQL 1 GB, backend 512 MB, el resto 128 MB) y rotacion de logs (3 archivos de 10 MB por servicio).
- **Herramientas de base de datos:** no arrancan por defecto. Para usarlas: `docker compose --profile tools up -d` y entra por un tunel SSH a `127.0.0.1:8081` (Adminer) o `127.0.0.1:8082` (phpMyAdmin).

### Despliegue en una maquina virtual (EC2, Azure u otra)

1. Instancia Linux con Docker y el plugin de compose. En el grupo de seguridad abre solo los puertos 22 (limitado a tu IP), 80 y 443.
2. `git clone` del repositorio, la rama a desplegar, y `cp .env.prod.example .env` con todos los valores.
3. `docker compose up -d --build`. Para actualizar: `git pull` y el mismo comando.
4. Prueba `http://IP/ecocampus/` y `http://IP/api/me`. Con `REQUIERE_LOGIN=false` entra con un correo `@ucol.mx` y registra una respuesta de prueba antes de abrir el estudio; borra esa fila despues.

### Despliegue automatico en AWS Lightsail

Guia paso a paso en [lightsail.md](lightsail.md).

## Pruebas de carga

Las pruebas sobre el servidor desplegado (Lighthouse, red del navegador, compatibilidad, carga de lectura y escritura, recursos del servidor y georreferenciacion) estan en [`docs/testing/produccion/`](../testing/produccion/README.md), con sus reportes. Lo que sigue describe el entorno aislado.

Se miden en un entorno aislado: un proyecto de compose aparte (`ecocampus-loadtest`) con su propio volumen de MySQL y sin puertos publicados, asi que no toca los datos del estudio. El backend corre con `REQUIERE_LOGIN=false`: como no hay envios anonimos, k6 abre una sesion con un correo unico (`POST /api/acceso/correo`) antes de cada envio, sin necesitar SAML.

```bash
cp .env.loadtest.example .env.loadtest      # solo la primera vez
docker compose stop                         # libera memoria si el desarrollo esta corriendo

docker compose --env-file .env.loadtest -p ecocampus-loadtest \
  -f docker-compose.yml -f docker-compose.loadtest.yml up -d --build

# perfil de carga (PERFIL=estres para el de estres)
MSYS_NO_PATHCONV=1 docker run --rm --network ecocampus-loadtest_default \
  -e PERFIL=carga -v "$(pwd -W)/loadtest:/scripts" grafana/k6 run \
  --summary-export=/scripts/results/resumen.json /scripts/k6.js

docker compose --env-file .env.loadtest -p ecocampus-loadtest \
  -f docker-compose.yml -f docker-compose.loadtest.yml down -v
docker compose start
```

- En Linux o macOS se usa `$(pwd)` en lugar de `$(pwd -W)` y no hace falta `MSYS_NO_PATHCONV`.
- Perfiles: `carga` (hasta 100 usuarios virtuales, 3 min 21 s) y `estres` (hasta 300).
- El script es `loadtest/k6.js`. Sirve para repetir pruebas sin tocar el servidor real. Los resultados medidos y su analisis son los del servidor de produccion, en [docs/testing/rendimiento.md](../testing/rendimiento.md) y [docs/testing/produccion/](../testing/produccion/README.md).
- `.env.loadtest` no se versiona. Las pruebas de carga corren contra el backend compilado (etapa `prod` del Dockerfile).

## Sitio publico (GitHub Pages)

El despliegue es automatico mediante `.github/workflows/deploy.yml` en cada push a `main`: usa Node 20, ejecuta `npm ci --ignore-scripts` y `npm run build`, y publica `frontend/dist`. No define variables de entorno, asi que el modo experimento queda apagado y el sitio es solo el frontend.

La ruta base es `/ecocampus/`, definida en `base` de `vite.config.js` y en el `basename` del Router. Para que las rutas de la SPA funcionen en GitHub Pages se usa la tecnica de [spa-github-pages](https://github.com/rafgraph/spa-github-pages): `public/404.html` redirige a la raiz y un script en `frontend/index.html` restaura la ruta original.
