# Pruebas de rendimiento

Resultados medidos el 16 de octubre de 2026 sobre el stack Docker (frontend nginx, backend Node.js, MySQL 8). Las cifras son validas para el ambiente descrito abajo; deben repetirse en el servidor definitivo.

## Resumen

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

## Ambiente de hardware y red

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

## Causa de las solicitudes fallidas

No hubo solicitudes fallidas en ninguno de los dos perfiles (0 de 33,388 y 0 de 106,416), por lo que no hay causas de error que reportar. El backend registro solo tres avisos, todos del arranque mientras MySQL terminaba de iniciar (reintentos de conexion), no de la carga.

Si en una repeticion aparecen fallos, el script cuenta cada error por endpoint y codigo de estado (metrica `errores_por_estado`) y el backend registra cada error con su causa en los logs (`docker compose logs backend`).

## Lectura de los resultados

- Los estaticos responden en milisegundos incluso con 300 usuarios: nginx casi no se esfuerza (30 % de CPU).
- El cuello de botella es el proceso Node.js del backend: llego a 92.7 % de CPU, es decir, casi un nucleo completo (Node ejecuta JavaScript en un solo hilo). Por eso `health` (p95 40 ms) y `api_me` (p95 26 ms), que hacen casi nada, son mas lentos que los estaticos: esperan turno en el ciclo de eventos.
- Escribir una respuesta tarda 15 ms de mediana y 62 ms en p95 con 300 usuarios simultaneos. El estudio no espera esa concurrencia: aun asi, el sistema la absorbio sin errores.

## Limitaciones

- Servidor y generador de carga comparten maquina, por lo que los resultados son conservadores en CPU y optimistas en red.
- La red es el bridge de Docker (sin latencia ni limite de ancho de banda). En un servidor real el ancho de banda pesara mas: cada visita descarga unos 435 KB de JavaScript.
- `/api/me` se midio sin sesion; con sesion consulta MySQL y seria algo mas lento.
- El `POST` se midio con `REQUIERE_LOGIN=false`; el costo extra de autenticar es una lectura de sesion en MySQL.
- Pruebas de pocos minutos: no miden degradacion a largo plazo.

## Como reproducir

El entorno de prueba usa un proyecto de compose aparte (volumen y base propios, sin puertos publicados), asi que no toca los datos del estudio. Conviene detener antes el stack principal para liberar memoria.

```bash
docker compose stop
docker compose -p ecocampus-loadtest -f docker-compose.yml -f docker-compose.loadtest.yml up -d --build

# perfil de carga (cambiar PERFIL=estres para el de estres)
MSYS_NO_PATHCONV=1 docker run --rm --network ecocampus-loadtest_default \
  -e PERFIL=carga -v "$(pwd -W)/loadtest:/scripts" grafana/k6 run \
  --summary-export=/scripts/results/resumen.json /scripts/k6.js

docker compose -p ecocampus-loadtest -f docker-compose.yml -f docker-compose.loadtest.yml down -v
docker compose start
```

En Linux o macOS se usa `$(pwd)` en lugar de `$(pwd -W)` y no hace falta `MSYS_NO_PATHCONV`. Los resultados de esta medicion estan en `loadtest/results/`.

## Pendiente

Repetir ambos perfiles en el servidor de despliegue (la VM) y registrar su hardware y la red real entre el generador de carga y el servidor.
