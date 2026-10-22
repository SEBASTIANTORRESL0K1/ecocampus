# Backend (TypeScript)

El backend solo se usa en el **modo experimento** (Docker). Esta escrito en TypeScript estricto (`strict` y `noUncheckedIndexedAccess`) y se compila a `backend/dist/`.

## Estructura

```
backend/src/
  server.ts            punto de entrada: carga la configuracion, espera a MySQL y escucha
  app.ts               arma la aplicacion de Express (crearApp), sin escuchar; tambien la usan las pruebas
  config/              variables de entorno validadas con Zod (falla al arrancar con un mensaje claro)
  auth/                estrategia SAML, correo (normalizacion y dominios) y derivacion del participante
  routes/              saml (login federado), acceso (por correo), sesion (/api/me), respuestas, salud y docs
  validacion/          esquema Zod de las respuestas: valida y genera el tipo de la fila a insertar
  openapi/             especificacion OpenAPI de la API y el generador de docs/openapi.json
  db.ts, logger.ts
```

## Comandos

Ejecutar desde `backend/`:

| Comando | Para que sirve |
| :--- | :--- |
| `npm run dev` | Recarga en vivo con nodemon y tsx (lo usa el contenedor de desarrollo) |
| `npm run typecheck` | Comprueba los tipos sin generar archivos |
| `npm test` | Pruebas unitarias y de rutas (no necesitan MySQL ni el IdP) |
| `npm run build` | Compila a `dist/` |
| `npm run openapi` | Regenera `docs/openapi.json` a partir de la especificacion en el codigo |
| `npm start` | Ejecuta el JavaScript compilado (lo que corre produccion) |

## API (OpenAPI)

La API esta documentada con OpenAPI 3.1 (14 operaciones en cuatro grupos: respuestas, autenticacion, acceso por correo y sistema; cada ruta indica con `x-modos` en que modo existe).

| Donde | Que |
| :--- | :--- |
| `docs/openapi.json` | Copia versionada de la especificacion; se puede abrir en [editor.swagger.io](https://editor.swagger.io/) sin ejecutar nada |
| `http://localhost:4006/docs` | Swagger UI interactiva (solo en desarrollo; permite probar las rutas) |
| `http://localhost:4006/openapi.json` | La especificacion servida por el backend |

- La especificacion vive en el codigo (`backend/src/openapi/especificacion.ts`) y reutiliza las opciones y limites de la validacion, asi que no duplica valores.
- Las pruebas fallan si la documentacion se desalinea del codigo: cada ruta registrada en Express (en cada modo de acceso) debe estar documentada, los campos obligatorios deben coincidir con el esquema Zod, el ejemplo debe ser una peticion valida y `docs/openapi.json` debe estar al dia. Si cambias una ruta o una respuesta, actualiza la especificacion y ejecuta `npm run openapi` en `backend/`.
- En produccion la interfaz `/docs` no se monta (Swagger es una dependencia de desarrollo y no va en la imagen) y el proxy tampoco enruta `/openapi.json`; la especificacion queda disponible en el repositorio.

## Acceso al estudio

La variable `REQUIERE_LOGIN` del `.env` decide como entra el participante. El backend informa el modo en `GET /api/me` (`modoAcceso`), asi que el frontend muestra la pantalla que corresponde sin recompilarse.

| `REQUIERE_LOGIN` | Modo | Que ve el participante | Que necesita el servidor |
| :--- | :--- | :--- | :--- |
| `true` | `saml`: login federado | Boton "Iniciar sesion con UCOL". Solo pasan cuentas con `uTipo = Estudiante` | EntityID, callbacks y certificados registrados con sistemas@ucol.mx (variables `SAML_*`) y HTTPS |
| `false` | `correo`: solo el correo | Un campo para escribir el correo institucional | Nada mas: no usa certificados, el IdP ni HTTPS |

### Acceso por correo (`REQUIERE_LOGIN=false`)

- `CORREO_DOMINIOS_PERMITIDOS` (por defecto `ucol.mx`) lista los dominios aceptados, separados por comas. Cada uno admite tambien sus subdominios: `ucol.mx` acepta `alumno@alumnos.ucol.mx`.
- Se normaliza el correo antes de guardarlo: minusculas y sin `+alias`, asi que `alumno+2@ucol.mx` y `alumno@ucol.mx` son la misma persona (indices `UNIQUE`).
- **No se verifica que el correo sea de quien lo escribe** (no se envia ningun codigo). Cualquiera que conozca un correo de la universidad podria participar a su nombre. Las defensas son el dominio, el indice `UNIQUE` y los logs; usalo cuando ese riesgo sea aceptable para el estudio y documentalo en la tesis.
- Tampoco distingue alumnos de docentes: solo mira el dominio.
- No existen envios anonimos en ningun modo: siempre hay una sesion con un participante identificado. Una sesion abierta con el otro modo no sirve (por ejemplo, al cambiar `REQUIERE_LOGIN`, quien entro con SAML debe volver a entrar).
- Cada fila guarda como entro el participante en la columna `metodo_acceso` (`saml` o `correo`) para poder separar los datos al analizarlos.
- En modo `correo` el backend no carga la estrategia SAML ni exige los certificados, y no monta `/login`, `/logout` ni `/Metadata`. Las variables `SAML_*` (y `SAML_CERT_HOST_DIR` en produccion) siguen siendo obligatorias en el `.env` porque los compose no tienen valores por defecto: puedes dejar las de desarrollo y, en produccion, apuntar `SAML_CERT_HOST_DIR` a una carpeta vacia.

### Migrar una base de datos existente

`db/schema.sql` solo corre al crear el volumen. Si tu base ya existia, agrega la columna `metodo_acceso` **antes** de levantar esta version (si no, los envios fallaran):

```bash
docker compose exec -T db sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < db/migraciones/001_metodo_acceso.sql
```

Las filas anteriores quedan como `saml`. Si ya se habia aplicado, MySQL responde `Duplicate check constraint name` y no cambia nada. Las bases nuevas ya la traen. En un servidor existente, agrega tambien `CORREO_DOMINIOS_PERMITIDOS=ucol.mx` a su `.env`: los compose no tienen valores por defecto y no arrancan sin ella.

## Respaldo y restauracion de MySQL

```bash
# respaldo (guardalo fuera del servidor)
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction ecocampus' > respaldo_$(date +%F).sql

# restauracion
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecocampus' < respaldo_AAAA-MM-DD.sql
```

Haz un respaldo antes de iniciar el estudio y de forma periodica durante el. Si se pierde el volumen `db_data`, se pierden las respuestas.
