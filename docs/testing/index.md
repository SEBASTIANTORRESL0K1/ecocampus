# Indice de pruebas

Punto de entrada a toda la documentacion de pruebas de EcoCampus y respuesta punto por punto a la revision sobre las pruebas de rendimiento, red, compatibilidad y georreferenciacion.

## Documentos

| Documento | Contenido |
| :--- | :--- |
| [README.md](./README.md) | Filosofia, comandos rapidos y suites de prueba |
| [vitest-guidelines.md](./vitest-guidelines.md) | Pruebas de componentes con Vitest |
| [playwright-e2e.md](./playwright-e2e.md) | Pruebas E2E con Playwright |
| [compatibilidad.md](./compatibilidad.md) | Compatibilidad en entorno local (5 perfiles) |
| [rendimiento.md](./rendimiento.md) | Carga con k6 en el entorno aislado y resumen de produccion |
| [performance.md](./performance.md) | Notas de la herramienta de rendimiento (k6) |
| [produccion/README.md](./produccion/README.md) | **Reporte completo de las pruebas sobre el servidor de produccion (Lightsail)** |

## La revision

El texto de la revision, tal como se recibio:

> **Pruebas que no aplican en este entorno:**
> Número de solicitudes al servidor y endpoints evaluados, ya que no existe API propia.
> Logs del servidor y distribución de tiempos de respuesta del backend.
> Hardware y red del servidor, pues la infraestructura es administrada por GitHub y no tenemos acceso a ella.
> Pruebas de carga concurrente, que no son representativas en un hosting estático y van contra el uso justo de GitHub Pages.
>
> **Pruebas que sí aplican y planeo realizar este fin de semana:**
> Rendimiento del lado del cliente con Lighthouse y WebPageTest sobre la URL pública, documentando dispositivo, red simulada y número de corridas.
> Registro de peticiones de red del navegador (HTML, JS, CSS y tiles de OpenStreetMap), con tiempos de respuesta y porcentaje de fallos, si los hubiera.
> Pruebas de compatibilidad en navegadores (Chrome, Firefox, Edge y Safari) en escritorio y móvil, registrando versión, sistema operativo y dispositivo.
> Documentación del procedimiento de georreferenciación de los contenedores de reciclaje.

## Por que ahora si aplican las primeras cuatro

Esas pruebas se descartaron cuando el sitio solo estaba en GitHub Pages (hosting estatico, sin API ni servidor propio). El sitio del estudio ya corre en un servidor propio de AWS Lightsail (`http://3.143.203.113/ecocampus/`), con una API (Express), una base de datos (MySQL) y un proxy (Caddy). Ahi si hay solicitudes, endpoints, logs, hardware y carga que medir, y es un servidor propio, no un servicio compartido con politica de uso justo. Las pruebas se hicieron el 18 de octubre de 2026 y el detalle esta en [produccion/README.md](./produccion/README.md).

Nota: el sitio publico de GitHub Pages sigue siendo solo estatico y para el no cambia lo dicho en la revision; estas pruebas son del servidor del estudio.

### Respuestas a lo que antes no aplicaba

| Punto de la revision | Respuesta | Donde esta |
| :--- | :--- | :--- |
| Numero de solicitudes al servidor y endpoints evaluados | Lectura: 1741 peticiones (10 usuarios) y 7363 (30 usuarios). Escritura: 732 (10 usuarios) y 3222 (30 usuarios). Endpoints evaluados: `/api/me`, `/api/acceso/correo`, `/api/respuestas`, las paginas y los archivos JS y CSS. Todos respondieron con el codigo esperado | [Endpoints evaluados](./produccion/README.md#endpoints-evaluados) |
| Logs del servidor y distribucion de tiempos de respuesta del backend | 2103 peticiones en el log del backend (24 h): lecturas en 1 a 2 ms (p95 de `/api/me` 1 ms), `POST /api/acceso/correo` con p95 de 29 ms y `POST /api/respuestas` con p95 de 28 ms. Cero errores 5xx y cero reinicios. Tabla completa con media, p50, p95, p99 y maximo | [Servidor](./produccion/README.md#servidor-hardware-logs-y-tiempos-del-backend) y `produccion/resultados/servidor.txt` |
| Hardware y red del servidor | Ubuntu 24.04, 2 vCPU (Intel Xeon Platinum 8259CL, 2.5 GHz), 1.9 GB de RAM sin swap, disco de 58 GB (11 % usado), AWS Lightsail `us-east-2`. En reposo: MySQL 375 MiB, backend 43 MiB, proxy 20 MiB. Red: unos 60 ms de latencia minima desde Colima hasta Ohio | [Servidor](./produccion/README.md#servidor-hardware-logs-y-tiempos-del-backend) |
| Pruebas de carga concurrente | Con k6: hasta 30 usuarios virtuales simultaneos, en lectura (66.7 peticiones por segundo, 0 % de fallos, p95 de 197 ms) y en escritura (1611 respuestas guardadas, 14.6 por segundo, 0 % de fallos, p95 de 125 ms). Es un servidor propio, sin restricciones de uso justo | [Carga concurrente](./produccion/README.md#carga-concurrente) |

## Respuestas a las pruebas planeadas

| Prueba planeada | Que se hizo | Resultado | Donde esta |
| :--- | :--- | :--- | :--- |
| Rendimiento del cliente con Lighthouse y WebPageTest, documentando dispositivo, red simulada y numero de corridas | **Lighthouse 13.5.0** con Chrome 155 sin interfaz, 3 corridas por combinacion (mediana) en 3 paginas (inicio, calculadora, mapa) y 2 perfiles. Movil: emulacion de telefono con la limitacion de red y de CPU por defecto de Lighthouse (4G lenta simulada). Escritorio: preset `desktop`. **WebPageTest no se ejecuto**: es un servicio externo; queda pendiente si se exige | Rendimiento 57 a 67 en movil y 70 a 87 en escritorio; accesibilidad 94 a 100; SEO 100; mayor problema: el LCP de 16.8 s del mapa en movil por imagenes de 1.5 MB | [Lighthouse](./produccion/README.md#rendimiento-del-cliente-lighthouse) |
| Registro de peticiones de red del navegador (HTML, JS, CSS y tiles de OpenStreetMap), con tiempos y porcentaje de fallos | Playwright con Chromium 153, 5 cargas en frio por pagina (sin cache), 5 paginas, 565 peticiones registradas con tipo, estado, tamano y duracion | Peticiones propias: media de 158 ms y p95 de 286 ms, sin fallos. 75 tiles de OpenStreetMap: media de 281 ms y 0 fallos. Fallos: 10 de 565 (1.8 %), todos la misma imagen externa de `ucol.mx` bloqueada por el navegador | [Peticiones de red](./produccion/README.md#peticiones-de-red-del-navegador) |
| Compatibilidad en Chrome, Firefox, Edge y Safari, escritorio y movil, con version, sistema operativo y dispositivo | Playwright 1.63, 5 perfiles, 8 pruebas en cada uno (41 en total con el registro de red) contra el servidor | **41 de 41 correctas.** Chromium 153.0.8010.12 (Windows 11), Firefox 155.0 (Windows 11), WebKit 26.6 como Safari de escritorio (agente macOS 10.15.7, emulado), Pixel 7 (Android 14, emulado) e iPhone 14 (iOS 16.0, emulado). **Edge no se probo** por separado (usa el mismo motor Chromium que Chrome); Safari y los moviles son emulados, no fisicos | [Compatibilidad](./produccion/README.md#compatibilidad) |
| Documentacion del procedimiento de georreferenciacion de los contenedores | Validacion automatica de las 21 coordenadas (`validar-georreferencia.mjs`): rango, distancias, duplicados y fotografia | 21 puntos validos, caja envolvente de 463 m por 356 m, distancia minima entre puntos de 13.9 m, ninguno duplicado y todos con foto. **Origen:** las coordenadas las tomo el primer equipo que desarrollo el proyecto; no dejo registrado como (en sitio o desde un mapa en linea), cuando ni con que margen de error, por lo que no se afirma un metodo. Se puede preguntar a ese equipo o verificar una muestra en campo con GPS | [Georreferenciacion](./produccion/README.md#georreferenciacion-de-los-contenedores) |

## Limitaciones declaradas

- Las mediciones se hicieron desde un solo equipo (Windows 11, AMD Ryzen 5 5500U) en Colima, hacia el servidor en Ohio; los tiempos incluyen la red.
- WebPageTest, Edge y dispositivos fisicos (iPhone, Mac, telefonos Android) no se probaron.
- Los datos del servidor son de un instante en reposo y de los logs de las ultimas 24 horas; no se vigilo el consumo de CPU y memoria durante la carga.
- La escritura se probo sobre la base de produccion con datos de prueba que se borran despues (correos `k6-carga-...@ucol.mx`).
- El sitio se sirve por HTTP, sin dominio ni HTTPS; esto afecta la puntuacion de "buenas practicas" de Lighthouse.
- Las pruebas de carga son de pocos minutos y no miden degradacion a largo plazo.

## Como repetirlo

Los comandos estan en [produccion/README.md](./produccion/README.md#como-repetirlas).
