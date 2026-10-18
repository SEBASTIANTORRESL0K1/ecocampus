# Pruebas sobre el servidor de produccion (AWS Lightsail)

Reporte de las pruebas aplicadas al sitio desplegado en Lightsail, donde si hay una API propia, un servidor y una base de datos que medir. Sustituye a las pruebas "que no aplican" del esquema de GitHub Pages: ahora se mide la API, el servidor y la carga.

- URL probada: `http://3.143.203.113/ecocampus/` (HTTP; todavia no hay dominio ni HTTPS).
- Version desplegada: rama `experiment/survey-questions`, despues del PR #66 (acceso por correo y `LoginGate` restaurado).
- Modo de acceso del servidor: `correo` (`REQUIERE_LOGIN=false`).
- Fecha de las pruebas: 18 de octubre de 2026.
- Las mediciones se hicieron desde un equipo en Colima, Mexico, hacia Lightsail en `us-east-2` (Ohio). Los tiempos incluyen ese viaje de red: la latencia minima observada de cualquier peticion es de unos 60 ms y no es tiempo del servidor.

## Que se midio y donde esta

| Prueba | Herramienta | Resultado | Seccion |
| :--- | :--- | :--- | :--- |
| Rendimiento del cliente | Lighthouse 13.5.0 (3 corridas por pagina, movil y escritorio) | `resultados/lighthouse-resumen.md` y los JSON en `resultados/lighthouse/` | [Lighthouse](#rendimiento-del-cliente-lighthouse) |
| Peticiones de red del navegador | Playwright (5 corridas en frio por pagina) | `resultados/red-resumen.md`, datos en `resultados/red.json` | [Red](#peticiones-de-red-del-navegador) |
| Compatibilidad en navegadores y dispositivos | Playwright (5 perfiles) | `resultados/compatibilidad.json` | [Compatibilidad](#compatibilidad) |
| Carga concurrente sobre el servidor | k6 | `resultados/produccion-ligero.json`, `resultados/produccion-medio.json` | [Carga](#carga-concurrente) |
| Endpoints de la API evaluados | k6 y Playwright | esta seccion | [Endpoints](#endpoints-evaluados) |
| Hardware, uso de recursos y logs del servidor | `recolectar-servidor.sh` (se ejecuta en el servidor) | pendiente de ejecutar | [Servidor](#servidor-hardware-logs-y-tiempos-del-backend) |
| Georreferenciacion de los contenedores | `validar-georreferencia.mjs` | `resultados/georreferencia-validacion.md` | [Georreferenciacion](#georreferenciacion-de-los-contenedores) |

No se uso WebPageTest: es un servicio externo que no se ejecuto desde este equipo. Lighthouse cubre el rendimiento del cliente; si el asesor pide WebPageTest, se corre sobre la misma URL y se agrega aqui.

## Como repetirlas

Desde la raiz del repositorio (Docker y Node 22 instalados):

```bash
# Compatibilidad + registro de red (Playwright contra produccion; escribe en resultados/)
cd frontend
npx playwright test -c playwright.produccion.config.js
cd .. && node docs/testing/produccion/resumir-red.mjs > docs/testing/produccion/resultados/red-resumen.md

# Carga (solo GET; perfiles ligero, medio y alto)
docker run --rm -v "$(pwd -W)/loadtest:/scripts" -e BASE=http://3.143.203.113 -e PERFIL=ligero \
  grafana/k6 run --summary-export=/scripts/results/produccion-ligero.json /scripts/k6-produccion.js

# Georreferenciacion
node docs/testing/produccion/validar-georreferencia.mjs

# Servidor (se ejecuta en el servidor, por SSH)
cd /opt/ecocampus && bash docs/testing/produccion/recolectar-servidor.sh > /tmp/servidor.txt
```

Lighthouse se ejecuto con `lighthouse@13.5.0` y Chrome 155 sin interfaz, perfil movil (emulacion y limitacion de red por defecto) y perfil de escritorio (`--preset=desktop`), tres corridas por pagina; la tabla muestra la mediana. El script `resumir-lighthouse.mjs` genera la tabla desde los JSON.

Para evitar escrituras en la base de datos de produccion, ninguna prueba envia el cuestionario. Las de compatibilidad solo abren una sesion con el correo `prueba-playwright@ucol.mx` (queda una fila temporal en la tabla de sesiones, sin datos del estudio).

## Rendimiento del cliente (Lighthouse)

Mediana de 3 corridas por combinacion. Detalle completo en `resultados/lighthouse-resumen.md`.

| Perfil | Pagina | Rendimiento | Accesibilidad | Buenas practicas | SEO | FCP (s) | LCP (s) | TBT (ms) | CLS | Peso (KB) | Peticiones |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| escritorio | inicio | 85 | 100 | 56 | 100 | 1.21 | 1.50 | 0 | 0.000 | 4118 | 29 |
| escritorio | calculadora | 87 | 94 | 78 | 100 | 1.20 | 1.38 | 0 | 0.016 | 491 | 19 |
| escritorio | mapa | 70 | 96 | 56 | 100 | 1.29 | 3.48 | 0 | 0.000 | 3122 | 38 |
| movil | inicio | 67 | 100 | 56 | 100 | 4.00 | 4.77 | 127 | 0.000 | 4118 | 29 |
| movil | calculadora | 60 | 98 | 78 | 100 | 3.48 | 5.07 | 0 | 0.176 | 491 | 19 |
| movil | mapa | 57 | 96 | 52 | 100 | 3.39 | 16.78 | 229 | 0.000 | 3050 | 32 |

Hallazgos (datos de los reportes de Lighthouse):

- **Peso de las imagenes.** Inicio transfiere unos 4 MB y el mapa unos 3 MB; Lighthouse estima ahorros de hasta 3.5 MB en entrega de imagenes. Las fotografias de los contenedores pesan alrededor de 1.5 MB cada una. Es la causa principal del LCP de 16.8 s en el mapa en movil.
- **Sin HTTPS.** "Buenas practicas" baja (52 a 78) por 15 a 17 peticiones inseguras y por no redirigir HTTP a HTTPS. Se resuelve con un dominio y `SITE_ADDRESS` en Caddy (ver README, seccion Produccion).
- **Cache.** Lighthouse marca ahorros de 170 a 250 KB con politica de cache: el servidor no envia `Cache-Control` en los archivos estaticos.
- **Redireccion.** Lighthouse detecta una redireccion en la carga que cuesta unos 1.1 s en movil (no se identifico cual; probablemente la de `/ecocampus` a `/ecocampus/`).
- **Cookies de terceros.** Lighthouse detecta 2 o 3 en las paginas (no se identifico su origen).
- Accesibilidad y SEO son altas (94 a 100 y 100).
- Desplazamiento de diseno (CLS) de 0.176 en la calculadora en movil, por encima del umbral recomendado de 0.1.

## Peticiones de red del navegador

Playwright (Chromium 153), 5 cargas en frio por pagina, sin cache. Resumen completo en `resultados/red-resumen.md`.

| Pagina | Peticiones | Propias | Externas | Fallidas | HTTP 4xx/5xx | Transferido (KB) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/ecocampus/` | 25 | 15 | 10 | 2 | 0 | 4099 |
| `/ecocampus/calculadora` | 15 | 11 | 4 | 0 | 0 | 473 |
| `/ecocampus/mapa` | 33 | 13 | 20 | 0 | 0 | 3104 |
| `/ecocampus/comunidad` | 19 | 14 | 5 | 0 | 0 | 749 |
| `/ecocampus/guia-reciclaje` | 21 | 16 | 5 | 0 | 0 | 1532 |

Por origen: las 345 peticiones al servidor propio tienen media de 158 ms y p95 de 286 ms, sin fallos. Las 220 externas (OpenStreetMap, fuentes y el sitio de la universidad) tienen media de 230 ms y p95 de 1038 ms. Los 75 mosaicos de OpenStreetMap tuvieron media de 281 ms y ninguno fallo.

Porcentaje de fallos: 10 de 565 peticiones (1.8 %), todas la misma imagen externa: `https://www.ucol.mx/content/portal/banner_733551615849.jpg` en la pagina de inicio, bloqueada por el navegador (`net::ERR_BLOCKED_BY_ORB`) en las 5 corridas (se pide dos veces por carga). El servidor de la universidad no la entrega como imagen a un sitio ajeno; conviene copiar esa imagen al proyecto o quitarla. No hay ningun fallo en recursos propios.

## Compatibilidad

Playwright 1.63, mismas pruebas de las vistas publicas que `docs/testing/compatibilidad.md`, ahora contra el servidor. Resultado: **41 de 41 correctas** (40 de compatibilidad y 1 de registro de red), 2 min 53 s.

| Proyecto | Motor y version | Sistema (agente de usuario) | Ventana | Tactil |
| :--- | :--- | :--- | :--- | :--- |
| `chromium` | Chromium 153.0.8010.12 | Windows 10/11 (maquina real: Windows 11) | 1280x720 | No |
| `firefox` | Firefox 155.0 | Windows 10/11 (maquina real: Windows 11) | 1280x720 | No |
| `webkit` | WebKit 26.6 (motor de Safari) | macOS 10.15.7 (emulado) | 1280x720 | No |
| `movil-android-chrome` | Chromium 153.0.8010.12, perfil Pixel 7 | Android 14 (emulado) | 412x839 | Si |
| `movil-ios-safari` | WebKit 26.6, perfil iPhone 14 | iOS 16.0 (emulado) | 390x664 | Emulado |

Cada perfil comprueba: inicio, acceso por correo (rechaza `@gmail.com` y pide correo `@ucol.mx`), calculadora tras entrar (pregunta 1 y avance a la 2), mapa (21 marcadores, mosaicos y popup), comunidad, guia de reciclaje, ausencia de desbordamiento horizontal y la API (`/api/me` responde el modo de acceso y `POST /api/respuestas` sin sesion devuelve 401).

Limitaciones: los perfiles de Safari y de movil son emulados en un equipo Windows; no se probaron dispositivos fisicos ni Edge. Una prueba en un iPhone o Mac real queda pendiente si se necesita cubrir Safari de verdad.

Durante esta ejecucion se detecto que el titulo del mapa cambio a "Mapa de Reciclaje" tras el rediseno y las pruebas de `e2e/compatibilidad.spec.js` seguian esperando el anterior; se actualizaron ambas.

## Carga concurrente

k6 desde el mismo equipo, `loadtest/k6-produccion.js`, **solo lecturas** (`GET`), para no escribir en la base de datos ni gastar la cuota de transferencia. No pide las fotos de los contenedores. Cada usuario virtual repite: inicio, calculadora, mapa, JS, CSS y `/api/me`, con 1 s de pausa.

| Perfil | Usuarios virtuales (maximo) | Duracion | Peticiones | Por segundo | Fallos | Media (ms) | p95 (ms) | p99 (ms) | Maximo (ms) | Datos recibidos |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ligero | 10 | 1 min 20 s | 1741 | 21.5 | 0.00 % | 89 | 205 | 222 | 334 | 23 MB |
| medio | 30 | 1 min 50 s | 7363 | 66.7 | 0.00 % | 87 | 197 | 210 | 845 | 97 MB |

Mediana por endpoint en el perfil medio: inicio 64 ms, calculadora 64 ms, mapa 64 ms, CSS 68 ms, `/api/me` 65 ms y el JS principal 192 ms (el unico mayor porque pesa mas). El p95 de todos queda por debajo de 215 ms y todos los umbrales de k6 se cumplieron (fallos por debajo de 1 %, p95 por debajo de 1.5 s).

Con 3 veces mas usuarios el tiempo de respuesta no aumento: el servidor no llego a su limite en estos perfiles. No se probo el perfil `alto` (60 usuarios) ni se midio la escritura (`POST /api/respuestas`): la escritura necesitaria abrir sesiones y guardar filas en la base de produccion, asi que conviene hacerla en el entorno aislado de pruebas de carga (`docs/testing/rendimiento.md`) y no sobre el servidor real. Esas mediciones locales siguen vigentes, pero hay que repetirlas con el acceso por correo (ver la nota en ese documento).

## Endpoints evaluados

La API de produccion se expone solo a traves del proxy; `/health` y `/docs` no son publicos (devuelven 404, es intencional).

| Endpoint | Metodo | Se evaluo con | Resultado |
| :--- | :--- | :--- | :--- |
| `/api/me` | GET | k6 (carga) y Playwright | 200 en todas las peticiones; media 65 ms |
| `/api/acceso/correo` | POST | Playwright | 403 con dominio ajeno; 200 con `@ucol.mx` |
| `/api/respuestas` | POST | Playwright (sin sesion) | 401 sin sesion; no se envio ninguna respuesta |
| `/ecocampus/`, `/calculadora`, `/mapa` | GET | k6 y Lighthouse | 200; media 64 ms |
| Archivos JS y CSS | GET | k6 | 200; JS 192 ms, CSS 68 ms |

Numero de peticiones del experimento de carga: 1741 (ligero) y 7363 (medio), todas con codigo 2xx.

## Servidor: hardware, logs y tiempos del backend

Estos datos no se pueden obtener desde fuera: hay que ejecutar `recolectar-servidor.sh` en el servidor (el asistente no tiene SSH a produccion). El script solo lee y no imprime secretos; entrega:

- Hardware: sistema operativo, vCPU, memoria, disco, version de Docker.
- Uso de recursos de cada contenedor (CPU y memoria) y reinicios.
- Distribucion de tiempos de respuesta del backend (media, p50, p95, p99 y maximo) y codigos de estado por endpoint, a partir de los logs del backend en la ventana indicada.
- Errores y advertencias distintos del backend.
- Conteo de respuestas guardadas por metodo de acceso y de sesiones (sin correos).

Ejecutalo justo despues de una prueba de carga para ver el efecto en CPU y memoria, y guarda la salida en `resultados/servidor.txt`. Hasta entonces este apartado queda pendiente; no se asumio ningun dato de hardware.

## Georreferenciacion de los contenedores

Los 21 contenedores estan en `frontend/src/features/mapa/puntosReciclaje.js` como pares `[latitud, longitud]` en WGS84 y se dibujan sobre mosaicos de OpenStreetMap (Leaflet, centro `[19.249437, -103.698893]`, zoom 17).

Validacion automatica (`validar-georreferencia.mjs`, tabla completa en `resultados/georreferencia-validacion.md`):

- 21 puntos, todos con latitud y longitud validas y con fotografia en `frontend/public/Depositos/`.
- Caja envolvente de 463 m (este-oeste) por 356 m (norte-sur): consistente con el tamano del Campus Central.
- Todos a 306 m o menos del centro del mapa.
- Distancia minima entre dos puntos: 13.9 m; ningun punto duplicado (menos de 1 m de otro).
- La precision de los decimales (hasta 15) excede la del GPS de un telefono (unos 3 a 5 m); no implica esa exactitud en campo.

**Pendiente de confirmar por quien capturo los datos:** el procedimiento con que se obtuvieron las coordenadas (por ejemplo, tomarlas en sitio con un telefono o desde el mapa en linea), la fecha de captura y el margen de error. Los decimales largos de la mayoria de los puntos sugieren que se copiaron de un visor de mapas, pero no hay un registro en el repositorio; no se documenta como hecho. Con esa informacion se completa el procedimiento que pide la revision. Tambien conviene una verificacion visual en campo de una muestra de puntos.

## Hallazgos y acciones recomendadas

| Prioridad | Hallazgo | Accion |
| :--- | :--- | :--- |
| Alta | Fotos de 1.5 MB cada una; inicio y mapa pesan 3 a 4 MB y el mapa en movil tiene LCP de 16.8 s | Redimensionar y comprimir (WebP, ancho maximo 800 px) y cargar las imagenes con `loading="lazy"` |
| Alta | Sin HTTPS | Dominio y HTTPS con Caddy; mejora "buenas practicas" y es requisito del login federado |
| Media | Sin `Cache-Control` en los archivos estaticos | Agregar cabeceras de cache largas a `/assets/` (tienen hash en el nombre) |
| Media | Imagen de `ucol.mx` bloqueada en inicio (10 de 565 peticiones) | Copiarla al proyecto o quitarla |
| Media | Una redireccion de unos 1.1 s en movil | Identificar cual es (probablemente `/ecocampus` a `/ecocampus/`) y evitarla |
| Baja | CLS de 0.176 en la calculadora en movil | Reservar el tamano de la imagen de cada pregunta |
| Baja | Datos del servidor y procedimiento de georreferenciacion incompletos | Ejecutar `recolectar-servidor.sh` y completar la seccion de georreferenciacion |

## Archivos de esta carpeta

| Archivo | Para que sirve |
| :--- | :--- |
| `README.md` | Este reporte |
| `resumir-lighthouse.mjs` | Convierte los JSON de Lighthouse en la tabla de resumen |
| `resumir-red.mjs` | Convierte `red.json` en tablas de peticiones, tiempos y fallos |
| `validar-georreferencia.mjs` | Valida las coordenadas de los contenedores |
| `recolectar-servidor.sh` | Recolecta hardware, recursos y logs en el servidor |
| `resultados/` | Datos crudos y resumenes de cada prueba |

El codigo de las pruebas vive fuera de esta carpeta: `frontend/playwright.produccion.config.js`, `frontend/e2e-produccion/` y `loadtest/k6-produccion.js`.
