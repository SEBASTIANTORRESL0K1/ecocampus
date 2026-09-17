# Guia de pruebas E2E — Playwright

## Stack y configuracion

- **Playwright** con proyecto `chromium` unicamente.
- **1 worker** (ejecucion secuencial).
- **0 retries** — los fallos no se reintentan automaticamente.
- Configuracion en `frontend/playwright.config.js`.
- Comando: `npm run test:e2e` desde `frontend/`.

### Servidor de desarrollo

Playwright inicia `npm run dev` automaticamente antes de los tests. Espera a que `http://localhost:5173/ecocampus/` responda antes de correr cualquier prueba. Fuera de CI, si ya hay un servidor corriendo en ese puerto, lo reutiliza (no lo mata ni reinicia).

---

## El problema de la ruta base

La aplicacion esta montada bajo el base path `/ecocampus/`. La `baseURL` configurada es `http://localhost:5173`, por lo que navegar a `/` no lleva a la aplicacion.

**Regla:** nunca usar `page.goto('/')` ni rutas sin el prefijo `/ecocampus/`. Usar siempre los helpers de navegacion definidos en el archivo de prueba.

---

## Artefactos en caso de fallo

Playwright guarda automaticamente los siguientes artefactos cuando una prueba falla:

- **Trace** (`retain-on-failure`): archivo `.zip` con timeline de acciones, capturas de pantalla y network. Se abre con `npx playwright show-trace <archivo>`.
- **Screenshot** (`only-on-failure`): captura del estado final de la pagina al momento del fallo.

Los artefactos se guardan en `frontend/test-results/`.

---

## Helpers disponibles

Todos los helpers estan definidos en `frontend/e2e/calculadora.spec.js`.

### `gotoCalculadora(page)`

Navega a `/ecocampus/calculadora` y espera a que el texto "Pregunta 1 de 31" sea visible. Es el punto de entrada obligatorio para cualquier prueba de la calculadora.

### `clickSiguiente(page, expectedStep)`

Hace clic en el boton "Siguiente" y verifica que el contador de progreso muestre `Pregunta ${expectedStep} de 31`. Lanza error si el paso esperado no aparece.

### `clickFinalizar(page)`

Hace clic en el boton "Finalizar" y espera a que el texto "Tu resultado" sea visible en pantalla.

### `answerAlimentos(page, pick)`

Responde las preguntas Q1-Q15 (seccion Alimentos, pasos 1-15). Cada pregunta presenta botones de opcion; `pick` determina cual boton seleccionar:

- `'first'` — selecciona el primer boton (puntuacion minima).
- `'last'` — selecciona el ultimo boton (puntuacion maxima).

Despues de cada seleccion llama a `clickSiguiente` con el paso siguiente esperado.

### `answerTransporte(page, pick)`

Responde las preguntas Q16-Q20 (seccion Transporte, pasos 16-20). El parametro `pick` funciona igual que en `answerAlimentos`, con una excepcion documentada para Q19 (ver seccion "Inversion de Q19" mas abajo).

### `answerHabitantesHogar(page, value)`

Responde el paso 21 (campo numerico `habitantesHogar`). Limpia el input, escribe el valor numerico recibido y llama a `clickSiguiente` para avanzar al paso 22.

### `answerEnergia(page, pick)`

Responde las preguntas Q21-Q29 (seccion Energia, pasos 22-30). Maneja los distintos tipos de pregunta de esta seccion, incluyendo el input numerico de `cantidadDispositivo` en Q24. El parametro `pick` aplica el mismo convenio de `'first'`/`'last'`.

### `answerForestal(page, pick)`

Responde la pregunta Q30 (seccion Forestal, paso 31) y a continuacion llama a `clickFinalizar` para completar el flujo y esperar el resultado.

---

## Estructura de la calculadora (31 pasos)

| Rango de pasos | Seccion | Preguntas |
|----------------|---------|-----------|
| 1-15 | Alimentos | Q1-Q15 |
| 16-20 | Transporte | Q16-Q20 |
| 21 | Hogar | habitantesHogar (input numerico especial) |
| 22-30 | Energia | Q21-Q29 |
| 31 | Forestal | Q30 |

**Infraestructura**: se suman 6,400 puntos automaticamente al calcular el resultado; no hay paso de pregunta para esta categoria.

---

## Convenio `pick`

El parametro `pick` controla que opcion se elige en las preguntas de botones:

- `'first'` — primer boton de la lista — corresponde a la opcion de menor impacto (puntuacion minima).
- `'last'` — ultimo boton de la lista — corresponde a la opcion de mayor impacto (puntuacion maxima).

Este convenio aplica a `answerAlimentos`, `answerTransporte`, `answerEnergia` y `answerForestal`.

---

## Inversion de Q19

La pregunta Q19 ("¿Cuentas con auto propio?") tiene el orden de botones invertido respecto al resto: "Si" aparece primero y "No" aparece ultimo.

Consecuencia para el convenio `pick`:
- Para obtener la respuesta de minimo impacto ("No"), `answerTransporte` hace clic en `buttons.last()` cuando `pick === 'first'`.
- Para obtener la respuesta de maximo impacto ("Si"), hace clic en `buttons.first()` cuando `pick === 'last'`.

Esta logica esta encapsulada dentro de `answerTransporte`; quien llama al helper no necesita conocer el detalle.

---

## Descripcion de los tests existentes

### Test 1 — Navegacion basica

**Que verifica:** el paso 1 de la calculadora se renderiza correctamente al entrar.

**Aserciones:**
- El contador de progreso muestra "Pregunta 1 de 31".
- La barra de progreso visual esta presente.
- Los botones de navegacion ("Siguiente") estan visibles.
- La seccion "Alimentos" aparece como seccion activa.

### Test 2 — Avanzar y retroceder entre pasos

**Que verifica:** la navegacion hacia adelante y hacia atras funciona correctamente.

**Aserciones:**
- Despues de avanzar al paso 2, el contador muestra "Pregunta 2 de 31".
- Despues de retroceder, el contador vuelve a mostrar "Pregunta 1 de 31".

### Test 3 — Flujo completo con respuestas minimas

**Que verifica:** completar los 31 pasos eligiendo siempre la opcion de menor impacto produce un resultado sustentable.

**Como:** usa `pick='first'` en todos los helpers.

**Aserciones:**
- La pantalla de resultado ("Tu resultado") aparece al finalizar.
- El resultado obtenido corresponde a una huella sustentable.

### Test 4 — Flujo completo con respuestas maximas

**Que verifica:** completar los 31 pasos eligiendo siempre la opcion de mayor impacto produce un resultado insostenible.

**Como:** usa `pick='last'` en todos los helpers.

**Aserciones:**
- La pantalla de resultado ("Tu resultado") aparece al finalizar.
- El puntaje total supera 32,000 puntos.
- El resultado se clasifica como insostenible.

### Test 5 — Input cantidadDispositivo (Q24)

**Que verifica:** el campo numerico de dispositivos en Q24 acepta un valor valido y permite avanzar.

**Aserciones:**
- El input acepta el valor `3`.
- El boton "Siguiente" esta habilitado y permite avanzar al paso siguiente.

### Test 6 — Paso habitantesHogar acepta valor 4

**Que verifica:** el campo numerico del paso 21 acepta el valor `4` y avanza correctamente al paso 22.

**Aserciones:**
- El input acepta el valor `4`.
- Despues de hacer clic en "Siguiente", el contador muestra "Pregunta 22 de 31".

---

## Ubicacion de nuevos archivos E2E

Colocar los nuevos archivos en `frontend/e2e/` con el sufijo `.spec.js`:

```
frontend/e2e/
  calculadora.spec.js       <-- existente
  comunidad.spec.js         <-- ejemplo de nuevo archivo
```

Los archivos en esta carpeta estan excluidos de Vitest automaticamente y solo los ejecuta Playwright con `npm run test:e2e`.
