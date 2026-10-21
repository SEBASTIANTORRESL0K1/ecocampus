# Pruebas de rendimiento — EcoCampus

## Herramienta empleada

**k6 v2.2.0** (Grafana Labs, Apache 2.0)

k6 fue seleccionado por las siguientes razones:

- Scripting en JavaScript/ES6 con API ergonomica para definir escenarios, umbrales y metricas personalizadas.
- Modelo de usuarios virtuales (VUs) que simula carga concurrente de forma determinista.
- Salida JSON estructurada (`--out json`) que permite analisis posterior por ruta.
- Disponible en Windows via `winget install k6` sin dependencias adicionales.
- Referente de la industria para pruebas de carga de APIs y servidores HTTP estaticos.

---

## Ambiente de ejecucion

| Componente        | Detalle                                      |
|-------------------|----------------------------------------------|
| Sistema operativo | Windows 11 Pro 10.0.26300                    |
| Procesador        | AMD Ryzen 5 5600X 6-Core Processor           |
| Memoria RAM       | 15.91 GB                                     |
| Red               | Loopback (localhost / 127.0.0.1), sin trafico externo |
| Servidor          | Vite Preview v8.3.0 (`npx vite preview --host 0.0.0.0`) |
| Puerto            | 4173                                         |
| Base path         | `/ecocampus/`                                |

---

## Configuracion de la prueba

Script: [`frontend/src/performance/load-test.js`](../../frontend/src/performance/load-test.js)

### Perfil de carga (stages)

| Etapa        | Duracion | Usuarios virtuales (VUs) |
|--------------|----------|--------------------------|
| Rampa subida | 10 s     | 0 → 10                   |
| Carga plena  | 30 s     | 50 (sostenido)           |
| Rampa bajada | 10 s     | 10 → 0                   |
| **Total**    | **50 s** |                          |

Cada VU ejecuta iteraciones en bucle: selecciona una ruta al azar entre las 5 disponibles, emite una solicitud GET y espera 1 segundo antes de la siguiente.

### Umbrales definidos

| Metrica           | Umbral         | Resultado |
|-------------------|----------------|-----------|
| `http_req_duration` p(95) | < 500 ms | CUMPLIDO |
| `http_req_failed`  | < 5 %          | CUMPLIDO |

---

## Endpoints evaluados

Las cinco rutas de la SPA fueron etiquetadas con `tags: { route: <nombre> }` para obtener metricas individuales.

| Ruta                                          | Nombre de tag    |
|-----------------------------------------------|------------------|
| `http://localhost:4173/ecocampus/`            | `inicio`         |
| `http://localhost:4173/ecocampus/calculadora` | `calculadora`    |
| `http://localhost:4173/ecocampus/mapa`        | `mapa`           |
| `http://localhost:4173/ecocampus/comunidad`   | `comunidad`      |
| `http://localhost:4173/ecocampus/guia-reciclaje` | `guia-reciclaje` |

---

## Resultados globales

| Metrica                    | Valor         |
|----------------------------|---------------|
| Duracion total de la prueba | 50.3 s        |
| Total de solicitudes HTTP   | 1 213         |
| Tasa de solicitudes         | 24.1 req/s    |
| Solicitudes fallidas        | 0 (0.00 %)    |
| Datos recibidos             | 2.2 MB        |
| Datos enviados              | 107 kB        |
| Iteraciones completadas     | 1 213         |
| VUs maximos alcanzados      | 50            |

---

## Distribucion de tiempos de respuesta (global)

Todos los tiempos estan en milisegundos (ms). Fuente: salida de k6 al finalizar la ejecucion.

| Percentil | Tiempo (ms) |
|-----------|-------------|
| min       | 0.00        |
| p50       | 1.09        |
| p75       | 1.35 (est.) |
| p90       | 1.79        |
| p95       | 2.23        |
| p99       | 3.13 (est.) |
| max       | 7.49        |
| media     | 1.15        |

> Nota: k6 reporta p50, p90, p95 directamente en la salida de consola. Los valores de p75 y p99
> globales marcados como `(est.)` son estimaciones interpoladas a partir de los percentiles por ruta
> del archivo `k6-results.json`; no son emitidos directamente en el resumen de k6.

---

## Metricas por ruta

Calculadas a partir del archivo `frontend/results/k6-results.json` parseando los eventos
`http_req_duration` filtrados por tag de ruta.

| Ruta            | Solicitudes | min (ms) | p50 (ms) | p75 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | max (ms) | media (ms) | Fallidas |
|-----------------|-------------|----------|----------|----------|----------|----------|----------|----------|------------|----------|
| inicio          | 201         | 0.41     | 1.08     | 1.32     | 1.67     | 1.87     | 3.07     | 3.64     | 1.10       | 0 %      |
| calculadora     | 258         | 0.51     | 1.11     | 1.37     | 2.00     | 2.36     | 3.59     | 7.49     | 1.21       | 0 %      |
| mapa            | 239         | 0.00     | 1.11     | 1.33     | 1.81     | 2.11     | 3.16     | 4.52     | 1.15       | 0 %      |
| comunidad       | 254         | 0.48     | 1.11     | 1.38     | 1.76     | 2.25     | 2.62     | 3.64     | 1.13       | 0 %      |
| guia-reciclaje  | 261         | 0.00     | 1.11     | 1.35     | 1.70     | 2.31     | 3.19     | 7.49     | 1.16       | 0 %      |

La distribucion de solicitudes entre rutas fue aproximadamente uniforme (entre 201 y 261 por ruta),
confirmando que la seleccion aleatoria del script funciono correctamente.

---

## Analisis de errores

**Solicitudes fallidas: 0 (0.00 %)**

No se registraron errores HTTP, timeouts ni rechazos de conexion durante la prueba. El umbral
`http_req_failed < 5 %` se cumplio con margen absoluto.

Durante una ejecucion previa de diagnostico, cuando el servidor estaba escuchando unicamente en
`[::1]:4173` (IPv6) y k6 intentaba conectar a `127.0.0.1:4173` (IPv4), se obtuvo una tasa de
error del 100 % con el mensaje `connectex: No connection could be made because the target machine
actively refused it.`. Este problema se resolvio reiniciando Vite Preview con
`--host 0.0.0.0` para aceptar conexiones en todas las interfaces.

---

## Interpretacion de resultados

La SPA EcoCampus, servida como activos estaticos por Vite Preview, mantuvo tiempos de respuesta
muy bajos bajo una carga de 50 usuarios virtuales concurrentes:

- El percentil p95 global fue **2.23 ms**, muy por debajo del umbral de 500 ms.
- El tiempo maximo observado fue **7.49 ms**, correspondiente a la primera solicitud de algunas
  iteraciones (coste de apertura del socket TCP).
- Todas las rutas respondieron con HTTP 200 y cuerpo no vacio en el 100 % de los casos.
- El rendimiento es homogeneo entre rutas: no hay ninguna ruta con latencia notablemente mayor,
  lo que es esperado dado que Vite sirve el mismo `index.html` para todas las rutas de la SPA.

Estos resultados indican que el servidor de activos estaticos no es un cuello de botella bajo
la carga simulada. El factor limitante en un entorno de produccion seria la red y el tiempo de
carga del bundle JavaScript en el navegador del cliente (no medido en esta prueba de carga HTTP).

---

## Reproduccion de la prueba

```bash
# 1. Construir la aplicacion
cd frontend
npm run build

# 2. Levantar el servidor de preview (IPv4 + IPv6)
npx vite preview --host 0.0.0.0

# 3. En otra terminal, ejecutar la prueba k6
k6 run --out json=results/k6-results.json src/performance/load-test.js
```

Requiere k6 instalado: `winget install k6 --source winget`
