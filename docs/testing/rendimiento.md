# Pruebas de rendimiento

Este documento reune dos mediciones de carga con k6, en dos ambientes distintos que no deben confundirse:

| | Entorno aislado local | Servidor de produccion |
| :--- | :--- | :--- |
| Donde corre el sistema | Docker Desktop en el equipo de la tesista (Windows 11, 15.3 GB de RAM) | VM de AWS Lightsail (2 vCPU, 1.9 GB de RAM) |
| Donde corre k6 | En el mismo equipo y la misma red Docker que el sistema | En el equipo de la tesista, por internet |
| Fecha | 16 de octubre de 2026 | 18 de octubre de 2026 |
| Usuarios maximos | 100 (carga) y 300 (estres) | 100 |
| Seccion | [Resumen](#resumen-entorno-aislado-local) y siguientes | [Resultados en el servidor de produccion](#resultados-en-el-servidor-de-produccion-lightsail) |

Las secciones desde "Resumen" hasta "Lectura de los resultados" describen el entorno aislado local (stack Docker con frontend nginx, backend Node.js y MySQL 8) y sus cifras valen solo para ese ambiente. La CPU y la memoria del servidor real se midieron en la VM y estan en la seccion de produccion.

## Resumen (entorno aislado local)

| | Carga | Estres |
| :--- | :--- | :--- |
| Usuarios virtuales (maximo) | 100 | 300 |
| Duracion | 3 min 21 s | 2 min 52 s |
| Solicitudes totales | 33,388 | 106,416 |
| Solicitudes por segundo (promedio) | 165.7 | 619.3 |
| Iteraciones completas | 5,376 | 17,168 |
| Solicitudes fallidas | 0 (0.00 %) | 0 (0.00 %) |
| Verificaciones (checks) correctas | 33,387 de 33,387 | 106,415 de 106,415 |
| Datos recibidos / enviados | 2.6 GB / 3.2 MB | 8.3 GB / 10 MB |

Umbrales definidos (todos cumplidos): tasa de fallos menor a 1 % y p95 menor a 1000 ms, global y por endpoint.

## Herramienta y metodologia

- **Herramienta:** k6 (imagen oficial `grafana/k6`), ejecutada en un contenedor dentro de la red del entorno de prueba.
- **Script:** `loadtest/k6.js`. El perfil se elige con la variable `PERFIL` (`carga` por defecto, `estres`).
- **Flujo de cada usuario virtual (cada iteracion dura unos 2 s):**
  1. `GET /ecocampus/` (inicio)
  2. `GET /ecocampus/calculadora`
  3. `GET` del archivo JS y del CSS compilados (los nombres con hash se descubren desde `index.html`)
  4. `GET /health` y `GET /api/me` (API)
  5. Pausa de 1 s
  6. En el 20 % de las iteraciones, `POST /api/respuestas` con un cuestionario completo y valido (validacion e `INSERT` en MySQL)
  7. Pausa de 1 s
- **Perfil de carga:** rampa a 25 usuarios (30 s), a 50 (30 s), 50 sostenidos (60 s), rampa a 100 (30 s), 100 sostenidos (30 s) y descenso (20 s).
- **Perfil de estres:** rampa a 100 (30 s), a 200 (30 s), a 300 (30 s), 300 sostenidos (60 s) y descenso (20 s).

## Ambiente de hardware y red (entorno aislado local)

Este es el equipo donde se corrio el sistema y k6 en la medicion local; no es el servidor de produccion (ver su ambiente mas abajo).

| Elemento | Valor |
| :--- | :--- |
| CPU | AMD Ryzen 5 5500U, 6 nucleos / 12 hilos |
| RAM | 15.3 GB (Docker dispone de 7.4 GiB y 12 CPU) |
| Sistema operativo | Windows 11 Home 10.0.26200 |
| Contenedores | Docker 28.3.2 (Docker Desktop); `node:20-alpine`, `mysql:8.0`, `nginx:alpine` |
| Red | Red interna (bridge) de Docker en la misma maquina: sin latencia ni limites de red reales |
| Generador de carga | k6 en la misma maquina que el servidor (comparten CPU) |

## Endpoints evaluados

| Endpoint | Tipo | Notas |
| :--- | :--- | :--- |
| `GET /ecocampus/` | Estatico (nginx) | `home` |
| `GET /ecocampus/calculadora` | Estatico (nginx) | `calculadora` |
| `GET /ecocampus/assets/*.js` | Estatico (nginx) | `asset_js`, unos 435 KB |
| `GET /ecocampus/assets/*.css` | Estatico (nginx) | `asset_css` |
| `GET /health` | API | Consulta `SELECT 1` a MySQL |
| `GET /api/me` | API | Sin cookie de sesion, por lo que no consulta la tabla de sesiones |
| `POST /api/respuestas` | API | Validacion y `INSERT` en MySQL |

No se evaluo el inicio de sesion SAML (`/login`, callbacks): depende del servicio de identidad de la UCOL, que es de un tercero y no debe recibir carga.

## Distribucion de tiempos de respuesta

### Global

| Perfil | Minimo | Mediana | Promedio | p90 | p95 | p99 | Maximo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Carga (100 VU) | n/d (*) | 1.08 ms | 1.98 ms | 3.23 ms | 5.69 ms | 14.83 ms | 464.61 ms |
| Estres (300 VU) | n/d (*) | 1.14 ms | 3.82 ms | 8.35 ms | 16.63 ms | 51.22 ms | 168.13 ms |

(*) k6 reporto un minimo negativo (-0.75 ms y -1.36 ms) por un artefacto de medicion de reloj en el contenedor; se ignora.

### Por endpoint, perfil de estres (300 VU)

| Endpoint | Minimo | Mediana | Promedio | p90 | p95 | p99 | Maximo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `home` | n/d (*) | 0.69 ms | 0.78 ms | 0.95 ms | 1.15 ms | 3.02 ms | 19.91 ms |
| `calculadora` | 0.18 ms | 0.67 ms | 0.75 ms | 0.92 ms | 1.11 ms | 2.80 ms | 19.63 ms |
| `asset_js` | 0.65 ms | 1.46 ms | 1.61 ms | 1.99 ms | 2.46 ms | 5.58 ms | 32.50 ms |
| `asset_css` | 0.31 ms | 0.74 ms | 0.84 ms | 1.01 ms | 1.25 ms | 3.76 ms | 13.49 ms |
| `health` | 1.36 ms | 3.62 ms | 9.31 ms | 22.48 ms | 40.05 ms | 78.33 ms | 159.28 ms |
| `api_me` | 0.09 ms | 2.08 ms | 5.82 ms | 14.16 ms | 25.78 ms | 55.25 ms | 92.61 ms |
| `post_respuestas` | 6.75 ms | 15.19 ms | 23.16 ms | 46.98 ms | 62.17 ms | 107.78 ms | 168.13 ms |

### `POST /api/respuestas`, perfil de carga (100 VU)

Minimo 7.45 ms, mediana 12.11 ms, promedio 14.92 ms, p90 19.24 ms, p95 25.97 ms, p99 72.10 ms, maximo 464.61 ms. En esa corrida se insertaron 1,131 filas en MySQL, consistentes con el 20 % de las 5,376 iteraciones.

El perfil de carga se corrio con una version previa del script que solo desglosaba el endpoint `post_respuestas`; el desglose por endpoint completo corresponde al perfil de estres.

## Uso de recursos (pico en muestras cada 15 s)

| Contenedor | Carga: CPU / RAM | Estres: CPU / RAM |
| :--- | :--- | :--- |
| backend (Node.js) | 34.7 % / 69.7 MiB | 92.7 % / 112.6 MiB |
| db (MySQL 8) | 18.4 % / 389.7 MiB | 21.5 % / 393.6 MiB |
| frontend (nginx) | 11.1 % / 12.1 MiB | 30.0 % / 12.0 MiB |

## Comparacion tras migrar el backend a TypeScript

El 18 de octubre de 2026 se repitio el perfil de carga (100 usuarios virtuales, 3 min 21 s) contra el backend compilado de TypeScript (Node.js 22 y validacion con Zod), en el mismo equipo y con el mismo entorno aislado.

| Metrica | Antes (JavaScript, Node 20) | Despues (TypeScript, Node 22) |
| :--- | :--- | :--- |
| Solicitudes totales / fallidas | 33,388 / 0 | 33,303 / 0 |
| Global: mediana / p95 / p99 | 1.08 / 5.69 / 14.83 ms | 1.30 / 6.22 / 18.36 ms |
| Global: maximo | 464.61 ms | 259.53 ms |
| `POST /api/respuestas`: mediana / p95 / p99 | 12.11 / 25.97 / 72.10 ms | 14.00 / 34.36 / 52.80 ms |

Sin solicitudes fallidas en ninguna de las dos. Los tiempos quedaron algo mas altos en mediana y p95 (menos de 1 ms en el global y unos 8 ms en el p95 del `POST`), mientras que el p99 del `POST` y el maximo fueron mejores. Es una sola corrida en una laptop con poca memoria libre, asi que la diferencia esta dentro del margen de variacion entre corridas y no permite concluir que haya una regresion. El unico costo de ejecucion que agrega la migracion es la validacion con Zod, de microsegundos por solicitud.

## Causa de las solicitudes fallidas

No hubo solicitudes fallidas en ninguno de los dos perfiles (0 de 33,388 y 0 de 106,416), por lo que no hay causas de error que reportar. El backend registro solo tres avisos, todos del arranque mientras MySQL terminaba de iniciar (reintentos de conexion), no de la carga.

Si en una repeticion aparecen fallos, el script cuenta cada error por endpoint y codigo de estado (metrica `errores_por_estado`) y el backend registra cada error con su causa en los logs (`docker compose logs backend`).

## Lectura de los resultados

- Los estaticos responden en milisegundos incluso con 300 usuarios: nginx casi no se esfuerza (30 % de CPU).
- El cuello de botella es el proceso Node.js del backend: llego a 92.7 % de CPU, es decir, casi un nucleo completo (Node ejecuta JavaScript en un solo hilo). Por eso `health` (p95 40 ms) y `api_me` (p95 26 ms), que hacen casi nada, son mas lentos que los estaticos: esperan turno en el ciclo de eventos.
- Escribir una respuesta tarda 15 ms de mediana y 62 ms en p95 con 300 usuarios simultaneos. El estudio no espera esa concurrencia: aun asi, el sistema la absorbio sin errores.

## Resultados en el servidor de produccion (Lightsail)

Ademas del entorno aislado, la carga se midio sobre el servidor real, con el acceso por correo activo. Reporte completo, metodo y datos crudos en [produccion/README.md](./produccion/README.md).

### Ambiente de hardware y red (produccion)

| Elemento | Valor |
| :--- | :--- |
| Servidor (donde se miden CPU y memoria) | VM de AWS Lightsail en `us-east-2` (Ohio): Ubuntu 24.04, 2 vCPU Intel Xeon Platinum 8259CL a 2.5 GHz, 1906 MB de RAM sin swap, disco de 58 GB |
| Contenedores | Docker 29.9.1 y Compose v5.6.0: MySQL 8.0 (limite 1 GiB), backend (512 MiB), proxy Caddy y frontend nginx (128 MiB cada uno) |
| Generador de carga | k6 en Docker Desktop en el equipo de la tesista (AMD Ryzen 5 5500U, Windows 11, 15.3 GB de RAM); no comparte maquina con el servidor |
| Red | Internet real: de Colima, Mexico, a Ohio; latencia minima de unos 60 ms por peticion; HTTP sin cifrar, sin dominio |
| Medicion de CPU y memoria | `muestrear-recursos.sh` ejecutado dentro de la VM, cada ~3 s |

Los 15.3 GB de RAM y los 12 CPU del equipo local no son del servidor de produccion; el generador de carga los usa, pero no se registro su consumo. Las cifras de CPU y memoria de esta seccion son todas de la VM de 1.9 GB.

| Prueba | Perfil | Usuarios (max) | Peticiones | Por segundo | Fallos | p95 (ms) | Maximo (ms) |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Lectura (inicio, calculadora, mapa, JS, CSS, `/api/me`) | ligero | 10 | 1741 | 21.5 | 0.00 % | 205 | 334 |
| Lectura | medio | 30 | 7363 | 66.7 | 0.00 % | 197 | 845 |
| Escritura (acceso por correo y `POST /api/respuestas`) | ligero | 10 | 732 (366 respuestas) | 9.1 | 0.00 % | 153 / 117 | 201 / 140 |
| Escritura | medio | 30 | 3222 (1611 respuestas) | 29.2 | 0.00 % | 125 / 102 | 230 / 183 |
| Lectura | cien | 100 | 51 499 | 300.6 | 0.00 % | 195 | 638 |
| Escritura | cien | 100 | 21 978 (10 989 respuestas) | 128.8 | 0.00 % | 212 / 193 | 479 / 236 |

- En escritura el p95 se da como acceso / envio. Todas las respuestas se guardaron (201) y el backend no registro errores 5xx.
- Con 100 usuarios la CPU del servidor (2 vCPU) llego como maximo a 48.1 %, la CPU robada fue de 0.8 % o menos y la memoria usada subio unos 46 MB (maximo de 1150 MB, siempre con al menos 756 MB disponibles); graficas en [produccion/README.md](./produccion/README.md#cpu-y-memoria-durante-100-usuarios-simultaneos).
- Desde un cliente remoto la latencia minima de cualquier peticion es de unos 60 ms (red hasta Ohio); el backend atiende las lecturas en 1 a 2 ms.
- Las cifras del entorno aislado de arriba (mediciones anteriores al acceso por correo) siguen siendo una referencia de capacidad maxima; las de produccion reflejan el sistema actual con red real.

## Limitaciones

- Entorno aislado local: servidor y generador de carga comparten maquina, por lo que los resultados son conservadores en CPU y optimistas en red.
- Produccion: el generador de carga es un solo equipo domestico y no se midio su consumo ni el de su conexion; como la CPU de la VM quedo en 48 % como maximo y los tiempos no crecieron, no parece haber sido el limite, pero no esta comprobado.
- En el entorno aislado la red es el bridge de Docker (sin latencia ni limite de ancho de banda); en produccion se midio con red real.
- `/api/me` se midio sin sesion; con sesion consulta MySQL y seria algo mas lento.
- Las mediciones del entorno aislado son anteriores al acceso por correo: el `POST` se midio sin sesion. Desde entonces `loadtest/k6.js` abre una sesion con `POST /api/acceso/correo` (endpoint `acceso_correo`, un correo unico por envio) antes de cada `POST /api/respuestas`; repite esa prueba para actualizar las cifras locales. Las cifras con sesion ya estan en la seccion de produccion.
- Pruebas de pocos minutos: no miden degradacion a largo plazo.

## Como reproducir

El entorno de prueba usa un proyecto de compose aparte (volumen y base propios, sin puertos publicados), asi que no toca los datos del estudio. Conviene detener antes el stack principal para liberar memoria.

```bash
cp .env.loadtest.example .env.loadtest      # solo la primera vez
docker compose stop
docker compose --env-file .env.loadtest -p ecocampus-loadtest -f docker-compose.yml -f docker-compose.loadtest.yml up -d --build

# perfil de carga (cambiar PERFIL=estres para el de estres)
MSYS_NO_PATHCONV=1 docker run --rm --network ecocampus-loadtest_default \
  -e PERFIL=carga -v "$(pwd -W)/loadtest:/scripts" grafana/k6 run \
  --summary-export=/scripts/results/resumen.json /scripts/k6.js

docker compose --env-file .env.loadtest -p ecocampus-loadtest -f docker-compose.yml -f docker-compose.loadtest.yml down -v
docker compose start
```

En Linux o macOS se usa `$(pwd)` en lugar de `$(pwd -W)` y no hace falta `MSYS_NO_PATHCONV`. Los resultados de esta medicion estan en `loadtest/results/`.

## Pendiente

- La repeticion en la VM ya se hizo (ver la seccion de produccion). Falta repetir en el entorno aislado local el perfil de carga con el acceso por correo, para actualizar las cifras locales.
- Medir en produccion una carga sostenida durante mas tiempo y registrar el consumo del equipo generador de carga.
