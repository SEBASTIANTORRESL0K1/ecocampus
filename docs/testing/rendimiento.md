# Pruebas de rendimiento y carga

Resultados de carga con k6 sobre el **servidor de produccion (VM de AWS Lightsail)**, medidos el 18 de octubre de 2026 con el acceso por correo activo. El reporte completo, con Lighthouse, WebPageTest, red del navegador, compatibilidad, CPU y memoria del servidor y tiempos del backend, esta en [produccion/README.md](./produccion/README.md); aqui se resume la carga.

## Ambiente de hardware y red

| Elemento | Valor |
| :--- | :--- |
| Servidor (donde se miden CPU y memoria) | VM de AWS Lightsail en `us-east-2` (Ohio): Ubuntu 24.04, 2 vCPU Intel Xeon Platinum 8259CL a 2.5 GHz, 1906 MB de RAM sin swap, disco de 58 GB |
| Contenedores | Docker 29.9.1 y Compose v5.6.0: MySQL 8.0 (limite 1 GiB), backend (512 MiB), proxy Caddy y frontend nginx (128 MiB cada uno) |
| Generador de carga | k6 en Docker Desktop en un equipo aparte (AMD Ryzen 5 5500U, Windows 11, 15.3 GB de RAM); no comparte maquina con el servidor |
| Red | Internet real: de Colima, Mexico, a Ohio; latencia minima de unos 60 ms por peticion; HTTP sin cifrar, sin dominio |
| Medicion de CPU y memoria | `muestrear-recursos.sh` ejecutado dentro de la VM, cada ~3 s |

El equipo que genera la carga no es el servidor: sus 15.3 GB de RAM y 12 CPU no intervienen en las cifras de CPU y memoria, que son todas de la VM de 1.9 GB.

## Metodologia

- **Herramienta:** k6 (imagen oficial `grafana/k6`), contra `http://3.143.203.113`.
- **Lectura** (`loadtest/k6-produccion.js`): solo `GET` (inicio, calculadora, mapa, JavaScript, CSS y `/api/me`), con 1 s de pausa. No pide las fotos de los contenedores (1.5 MB cada una) para no gastar la cuota de transferencia.
- **Escritura** (`loadtest/k6-produccion-escritura.js`): cada iteracion abre sesion con un correo unico (`k6-carga-<usuario>-<iteracion>-<marca>@ucol.mx`, con `POST /api/acceso/correo`) y envia un cuestionario valido a `POST /api/respuestas`, con 1 s de pausa. Escribe una fila en `respuestas` y una sesion en `sessions` por iteracion; los datos de prueba se borran despues.
- **Perfiles** (variable `PERFIL`): `ligero` (hasta 10 usuarios virtuales), `medio` (30), `alto` (60, solo lectura) y `cien` (100: 30 s de subida a 50, 30 s a 100, 90 s sostenidos y 20 s de bajada).
- **Umbrales:** fallos por debajo de 1 % y p95 por debajo de 1.5 s, global y por endpoint; se cumplieron en todas las pruebas.

## Resultados

| Prueba | Perfil | Usuarios (max) | Peticiones | Por segundo | Fallos | p95 (ms) | Maximo (ms) |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Lectura (inicio, calculadora, mapa, JS, CSS, `/api/me`) | ligero | 10 | 1741 | 21.5 | 0.00 % | 205 | 334 |
| Lectura | medio | 30 | 7363 | 66.7 | 0.00 % | 197 | 845 |
| Lectura | cien | 100 | 51 499 | 300.6 | 0.00 % | 195 | 638 |
| Escritura (acceso por correo y `POST /api/respuestas`) | ligero | 10 | 732 (366 respuestas) | 9.1 | 0.00 % | 153 / 117 | 201 / 140 |
| Escritura | medio | 30 | 3222 (1611 respuestas) | 29.2 | 0.00 % | 125 / 102 | 230 / 183 |
| Escritura | cien | 100 | 21 978 (10 989 respuestas) | 128.8 | 0.00 % | 212 / 193 | 479 / 236 |

- En escritura el p95 se da como acceso / envio. Todas las respuestas se guardaron (201) y el backend no registro errores 5xx.
- Con 100 usuarios la CPU del servidor (2 vCPU) llego como maximo a 48.1 %, la CPU robada por el hipervisor fue de 0.8 % o menos y la memoria usada subio unos 46 MB (maximo de 1150 MB, siempre con al menos 756 MB disponibles). Graficas y tabla por fase en [produccion/README.md](./produccion/README.md#cpu-y-memoria-durante-100-usuarios-simultaneos).
- La latencia minima de cualquier peticion es de unos 60 ms (red hasta Ohio); el backend atiende las lecturas en 1 a 2 ms (ver los tiempos del backend en el reporte de produccion).
- Los tiempos no crecieron al triplicar los usuarios de 30 a 100: el servidor no llego a su limite en estos perfiles.

## Limitaciones

- El generador de carga es un solo equipo domestico y no se midio su consumo ni el de su conexion; como la CPU de la VM quedo en 48 % como maximo y los tiempos no crecieron, no parece haber sido el limite, pero no esta comprobado.
- Pruebas de pocos minutos: no miden degradacion a largo plazo ni el comportamiento de la capacidad de rafaga de Lightsail en horas de carga.
- El muestreo de CPU y memoria no guarda la hora (las fases se identifican por el patron de CPU) y termino antes de los ultimos ~30 s de la escritura.
- El sitio se sirve por HTTP, sin dominio ni HTTPS; con HTTPS el costo de cifrado agregaria algo de CPU.

## Como repetirlas

Los comandos de k6 y del muestreo en el servidor estan en [produccion/README.md](./produccion/README.md#como-repetirlas). La prueba de escritura deja filas y sesiones de prueba en produccion; se borran con `DELETE FROM respuestas WHERE correo LIKE 'k6-carga-%'` y `DELETE FROM sessions`.

## Pendiente

- Medir una carga sostenida durante mas tiempo y registrar el consumo del equipo generador de carga.
