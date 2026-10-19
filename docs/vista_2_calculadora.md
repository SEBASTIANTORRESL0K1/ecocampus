# Vista 2: Calculadora de Huella Ecologica

- Ruta: `/calculadora`
- Componente: `src/features/calculadora/Calculadora.jsx`
- Datos de preguntas: `src/features/calculadora/preguntas.js`
- Validacion de pasos: `src/features/calculadora/pasoRespondido.js`
- Imagen ilustrativa: `src/features/calculadora/ImagenTema.jsx`
- Persistencia del progreso: `src/features/calculadora/progresoGuardado.js`
- Aviso flotante (toast): `src/features/calculadora/ToastAviso.jsx`
- Modal de confirmacion: `src/features/calculadora/ModalConfirmacion.jsx`

---

## Proposito

Cuestionario interactivo de 30 preguntas que evalua el impacto ecologico personal del usuario. Al finalizar, muestra un resultado desglosado por secciones con su equivalente en hectareas globales (hag) y numero de planetas.

La metodologia esta basada en: **Ibarra-Cisneros, J.M. & Monroy-Ata, A. (2014)**, adaptada al contexto mexicano.

---

## Secciones del Cuestionario

| Seccion | Preguntas | Temas evaluados |
| :--- | :--- | :--- |
| A - Alimentos | Q1 a Q15 | Frutas, verduras, pan, tortillas, carnes, mariscos, lacteos, bebidas, tabaco |
| B - Transporte | Q16 a Q20 | Metro, transporte colectivo, vuelos, automovil particular |
| C - Energia | Q21 a Q29 | Electrodomesticos, focos, telefonos moviles, dispositivos electronicos, tipo de calentador, duracion de regadera, habitos de agua |
| D - Forestal | Q30 | Cuadernos consumidos por semestre |

Ademas existe un **paso especial de infraestructura** previo a la seccion C donde se solicita el numero de habitantes del hogar. Este dato se usa para dividir el consumo compartido de electrodomesticos y focos entre todos los habitantes.

---

## Tipos de Preguntas

| Tipo interno | Descripcion | Preguntas afectadas |
| :--- | :--- | :--- |
| `unica` | Seleccion de una sola opcion (botones tipo toggle) | La mayoria de preguntas |
| `multipleCantidad` | Lista de alimentos con input numerico de frecuencia semanal | Q11 |
| `multipleCheckbox` | Seleccion multiple de electrodomesticos presentes en el hogar | Q21 |
| `cantidadDispositivo` | Input numerico para cantidad de telefonos moviles | Q24 |
| `multiGrupo` | Dropdown por tipo de dispositivo (Televisor, Computadora, DVD, Estereo) con horas semanales de uso | Q25 |
| `habitantesHogar` | Input numerico para numero de personas en el hogar | Paso especial antes de Q21 |

### Opcion nula

Las preguntas `unica` que no tenian una opcion con `valor: 0` incluyen ahora una **opcion nula** como primera opcion, para quien no consume o no usa ese tema. Su valor es 0 y no altera los puntajes del resto de opciones.

| Pregunta | Opcion nula |
| :--- | :--- |
| Q3 | No consumo pan |
| Q4 | No consumo tortilla |
| Q5 | No como carne de res |
| Q6 | No como carne de pollo |
| Q7 | No como carne de cerdo |
| Q8 | No como pescado ni mariscos |
| Q9 | No consumo yoghurt |
| Q10 | No tomo leche |
| Q15 | No consumo agua embotellada |
| Q16 | No uso el Metro |
| Q17 | No uso transporte colectivo |
| Q22 | No hay focos convencionales en mi casa |
| Q23 | No hay focos ahorradores en mi casa |
| Q26 | No tengo calentador / boiler |
| Q30 | No uso libretas |

Q1, Q2, Q12, Q13, Q14, Q18, Q19 y Q20 ya tenian una opcion con valor 0. Q27 (bano), Q28 (lavado de dientes) y Q29 (WC) no tienen opcion nula porque son habitos que siempre aplican. Las notas de Q12, Q13, Q14, Q18 y Q20 ya no indican omitir la pregunta, sino elegir su opcion nula.

### Seleccion obligatoria

El boton "Siguiente" / "Finalizar" permanece deshabilitado (`disabled:opacity-50 disabled:cursor-not-allowed`) hasta que el paso actual tenga respuesta, y bajo las opciones se muestra el texto "Selecciona una opcion para continuar.". La regla vive en la funcion pura `pasoRespondido(paso, respuestas)`:

| Tipo de paso | Condicion para avanzar |
| :--- | :--- |
| `unica` | `respuestas[id] !== undefined` (la opcion nula con valor 0 es una respuesta valida) |
| `multipleCheckbox` (Q21) | Al menos un electrodomestico marcado, o el boton "Ninguno de estos" activo (`ninguno21`) |
| `multipleCantidad`, `cantidadDispositivo`, `multiGrupo`, `habitantesHogar` | Siempre respondido: sus valores por defecto (0, "No tengo / no lo uso", 1 habitante) ya son una respuesta valida |

En Q21, "Ninguno de estos" desmarca todos los electrodomesticos y deja `respuestas[21] = 0`; marcar cualquier electrodomestico desactiva "Ninguno de estos".

### Imagen ilustrativa

Cada pregunta en `preguntas.js` tiene un campo `imagen`. Puede ser una ruta local como `/img/q1.webp` (archivo ubicado en `public/img/`) o una palabra clave en ingles del tema; el paso `habitantesHogar` usa `/img/QFAM.webp`. Las rutas locales se muestran directamente y las palabras clave se convierten en una imagen de **LoremFlickr** (gratuito, sin API key):

```
https://loremflickr.com/640/320/{palabraClave}?lock={id}
```

- Para palabras clave, `lock` usa el id de la pregunta (0 para `habitantesHogar`), de modo que cada pregunta muestra siempre la misma imagen.
- La URL se construye en `urlImagenTema()` (en `ImagenTema.jsx`); para cambiar de proveedor basta con modificar esa funcion.
- El contenedor gris (`bg-gray-100`, `h-40`) reserva el espacio mientras la imagen carga (`loading="lazy"`).
- El texto `alt` es `Imagen ilustrativa: {texto de la pregunta}`.
- Si la imagen falla (`onError`), se oculta y el contenedor muestra "Imagen no disponible". El componente recibe `key={pasoActual}` para reiniciar ese estado al cambiar de paso.

---

## Flujo de Navegacion

1. La vista construye una lista ordenada de pasos al montarse (`construirPasos()`).
2. Si hay progreso guardado en localStorage, el estado se inicializa con el (paso, respuestas y, si aplica, pantalla de resultados) y se muestra el toast "Recuperamos tus respuestas guardadas.", que se cierra solo a los 5 segundos. Si no, empieza en la pregunta 1.
3. Se muestra un paso a la vez con barra de progreso en la parte superior.
4. El usuario puede avanzar ("Siguiente") o retroceder ("Anterior") entre preguntas. Cada cambio se guarda automaticamente.
5. Mientras haya alguna respuesta, el boton "Borrar respuestas" abre un modal de confirmacion para reiniciar el cuestionario.
6. En el ultimo paso, el boton cambia a "Finalizar" y ejecuta `calcularHuellaEcologica(respuestas)`.
7. Se presenta la pantalla de resultados, desde la que se puede:
   - "Volver al Inicio" (el progreso queda guardado).
   - "Contestar de nuevo": borra el progreso y vuelve a la pregunta 1 directamente (sin modal, porque el usuario ya termino).
   - "Revisar mis respuestas": vuelve al ultimo paso conservando las respuestas para cambiarlas.

---

## Persistencia en localStorage

El progreso del cuestionario se guarda en el navegador para que no se pierda al recargar la pagina o al perder la conexion. La logica vive en `progresoGuardado.js` (funciones `cargarProgreso(totalPasos)`, `guardarProgreso(estado)`, `borrarProgreso()` y `tieneRespuestas(respuestas)`).

### Clave y formato

- Clave: `ecocampus:calculadora:v1` (constante `CLAVE_PROGRESO`).
- Valor: JSON `{ version: 1, respuestas, pasoActual, verResultado }`.
- `resultado` no se guarda: al restaurar con `verResultado: true` se recalcula con `calcularHuellaEcologica(respuestas)`.
- Se guarda con un `useEffect` cada vez que cambian `respuestas`, `pasoActual` o `verResultado`. Si el estado vuelve a ser el inicial (pregunta 1, sin respuestas, sin resultado), la clave se elimina en lugar de guardarse.
- Todo acceso a localStorage esta envuelto en `try/catch`: en modo privado, con la cuota llena o con el almacenamiento deshabilitado, la calculadora funciona igual pero sin persistencia.

### Validacion al cargar

El estado se inicializa de forma perezosa (`useState(() => cargarProgreso(...))`), por lo que no hay parpadeo de la primera pregunta. Los datos leidos se descartan (y se empieza de cero) si:

- El JSON esta corrupto o no es un objeto.
- `version` no es `1`.
- `respuestas` no es un objeto.
- `pasoActual` no es un entero.

Ademas se normalizan:

- `pasoActual` se limita al rango `[0, pasos.length - 1]`.
- `habitantesHogar` toma el valor 1 si falta o no es un numero mayor o igual a 1.
- `verResultado` solo es verdadero si el valor guardado es exactamente `true`.

JSON convierte las claves numericas de `respuestas` en texto (`"1"` en lugar de `1`). Como en JavaScript `respuestas[1]` y `respuestas["1"]` son equivalentes, `calcularHuellaEcologica` y `pasoRespondido` se comportan igual con datos restaurados (cubierto por pruebas).

### Toast de progreso recuperado

Si al cargar la pagina habia progreso guardado con al menos una respuesta real (cualquier clave distinta de `habitantesHogar`, o `habitantesHogar` distinto de 1), se muestra una sola vez el toast `ToastAviso` con el texto "Recuperamos tus respuestas guardadas.":

- Posicion fija arriba a la derecha, debajo del navbar para no taparlo: `top-24` (96 px). El navbar mide 80 px en movil y 68 px en escritorio, no es fijo y no tiene `z-index`; el toast usa `z-40`.
- En escritorio (`sm` en adelante): esquina superior derecha con ancho fijo (`sm:right-6 sm:w-96`). En movil: arriba, casi a todo el ancho con margenes laterales de 16 px (`inset-x-4`).
- Tarjeta blanca con borde izquierdo lima (`border-l-4 border-lime-500`) y sombra (`shadow-xl`).
- `role="status"` y `aria-live="polite"` en el parrafo del mensaje, para que los lectores de pantalla lo anuncien sin interrumpir.
- Entra y sale con transicion de opacidad y desplazamiento (`duration-300`): en movil baja desde arriba (`-translate-y-4` a `translate-y-0`) y en escritorio entra desde la derecha (`sm:translate-x-8` a `translate-x-0`). Con `motion-reduce:transition-none` se omite la animacion.
- Se cierra solo a los 5 segundos y se desmonta al terminar la transicion de salida (300 ms). El temporizador se pausa mientras el cursor o el foco estan dentro del toast y mientras el modal de confirmacion esta abierto; al reanudar conserva el tiempo restante.
- Boton de cierre con icono X y `aria-label="Cerrar aviso"`. Cerrar el toast no borra nada.
- Boton de accion "Borrar respuestas y empezar de nuevo": abre el mismo modal de confirmacion que "Borrar respuestas" (no borra directamente).

### Borrar respuestas durante el cuestionario

Mientras haya alguna respuesta, debajo de los botones de navegacion aparece el boton "Borrar respuestas": ancho completo, `min-h-12` (48 px), `text-base font-semibold`, texto y borde de 2 px `red-700` sobre blanco, icono de papelera en SVG con `aria-hidden="true"` y anillo de foco visible (`focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2`). Al pulsarlo se abre el modal de confirmacion.

### Modal de confirmacion

`ModalConfirmacion` es un componente reutilizable (props `abierto`, `titulo`, `descripcion`, `textoConfirmar`, `textoCancelar`, `onConfirmar`, `onCancelar`). Lo abren "Borrar respuestas" y la accion del toast; "Contestar de nuevo" no lo usa.

- Titulo "¿Borrar tus respuestas?" y descripcion indicando que se perderan las respuestas guardadas y que el cuestionario volvera a la pregunta 1.
- Botones "Cancelar" (secundario, borde gris) y "Sí, borrar respuestas" (`bg-red-700 text-white`), ambos con `min-h-12`.
- Solo "Sí, borrar respuestas" borra: elimina la clave de localStorage y restablece el estado inicial (`pasoActual` 0, `respuestas` `{ habitantesHogar: 1 }`, `verResultado` false, `resultado` null). Tambien cierra el toast si estaba visible.
- "Cancelar", la tecla Escape o un clic en el fondo cierran el modal sin borrar.

Implementacion con el elemento nativo `<dialog>`:

- Siempre esta montado (cerrado no se muestra ni aparece en el arbol de accesibilidad). Un efecto controlado por la prop `abierto` llama a `showModal()` al abrir y a `close()` al cerrar; el estado del padre es la fuente de verdad.
- `showModal()` pone el dialogo en la capa superior (top layer) y vuelve inerte el resto de la pagina, por lo que no hace falta `role="dialog"` ni `aria-modal`: `<dialog>` ya tiene el rol implicito.
- Escape dispara el evento nativo `cancel`; el componente llama a `preventDefault()` y a `onCancelar()`. Si el navegador cierra el dialogo por su cuenta (evento `close` con `abierto` aun verdadero), tambien se llama a `onCancelar()`; un ref evita la doble llamada.
- El contenido va en un `div` interno con `p-6` y el `<dialog>` no tiene padding, asi que un clic cuyo `target` es el propio `<dialog>` solo puede venir del fondo (`::backdrop`). Su equivalente de teclado es Escape.
- Los eventos `cancel`, `close`, `click` y `keydown` se registran con `addEventListener` sobre el `<dialog>` mientras esta abierto (API nativa del elemento), sin manejadores JSX en un elemento no interactivo; asi se cumplen las reglas jsx-a11y de SonarQube.
- Tab / Shift+Tab rotan entre "Cancelar" y "Sí, borrar respuestas" sin salir a la barra del navegador.

### Botones de la pantalla de resultados

| Boton | Accion |
| :--- | :--- |
| Volver al Inicio | Enlace a `/`; el progreso sigue guardado |
| Contestar de nuevo | Borra el progreso y vuelve a la pregunta 1 con el estado inicial |
| Revisar mis respuestas | `verResultado` a false y `pasoActual` al ultimo paso, conservando las respuestas |

---

## Calculo y Resultado

La funcion `calcularHuellaEcologica` (definida en `preguntas.js`) recibe el objeto de respuestas y retorna:

- `totalGeneral`: suma de puntos de todas las secciones
- `totalAlimentos`, `totalTransporte`, `totalEnergia`, `totalForestal`: subtotales por seccion
- `infraestructura`: valor fijo calculado segun el numero de habitantes del hogar
- `interpretacion`: objeto con rango en hag, equivalente en planetas y mensaje de consejo

### Niveles de sostenibilidad

| Puntos totales | Hectareas globales (hag) | Equivalente en planetas | Nivel |
| :--- | :--- | :--- | :--- |
| Menos de 16,000 | Menos de 1.6 hag | Menos de 1 planeta | Sostenible |
| 16,000 a 32,000 | 1.6 a 3.2 hag | Entre 1 y 2 planetas | En riesgo |
| Mas de 32,000 | Mas de 3.2 hag | Mas de 2 planetas | No sostenible |

---

## Estado Interno (`useState`)

| Variable | Descripcion |
| :--- | :--- |
| `pasos` | Lista calculada con `useMemo` de todos los pasos del cuestionario |
| `progresoInicial` | Progreso leido una sola vez de localStorage al montar (o `null`) |
| `pasoActual` | Indice del paso actualmente visible (persistido) |
| `respuestas` | Objeto acumulador donde cada clave es el ID de la pregunta y el valor es la respuesta (persistido) |
| `verResultado` | Booleano que activa la pantalla de resultados (persistido) |
| `resultado` | Objeto devuelto por `calcularHuellaEcologica`; no se persiste, se recalcula al restaurar |
| `avisoRecuperado` | Booleano que monta el toast "Recuperamos tus respuestas guardadas."; pasa a false cuando el toast termina de cerrarse o al borrar |
| `modalBorrarAbierto` | Booleano que abre el modal de confirmacion de borrado |

`pasoActual`, `respuestas` y `verResultado` se inicializan de forma perezosa desde `progresoInicial`. Ver la seccion "Persistencia en localStorage".

Claves especiales en `respuestas`:

- `detalle11`: array de frecuencias para los alimentos de Q11
- `detalle21`: array de booleanos para los electrodomesticos de Q21
- `ninguno21`: `true` cuando se eligio "Ninguno de estos" en Q21 (en ese caso `respuestas[21] = 0`)
- `cantidadCelulares`: cantidad de celulares ingresada en Q24
- `detalle25`: objeto con horas de uso por tipo de dispositivo para Q25
- `habitantesHogar`: numero de habitantes del hogar

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer |
| `Link` | React Router DOM | Boton "Volver al Inicio" en la pantalla de resultados |
| `ImagenTema` | `src/features/calculadora/ImagenTema.jsx` | Imagen ilustrativa del tema de cada paso (LoremFlickr) con espacio reservado y respaldo "Imagen no disponible" |
| `ToastAviso` | `src/features/calculadora/ToastAviso.jsx` | Aviso flotante con cierre automatico (5 s), pausa al pasar el cursor o enfocar, boton "Cerrar aviso" y accion opcional |
| `ModalConfirmacion` | `src/features/calculadora/ModalConfirmacion.jsx` | Dialogo modal de confirmacion sobre `<dialog>` nativo (`showModal()`, Escape via `cancel`, clic en el fondo, foco en Cancelar, bloqueo de scroll) |

---

## Diseno

- Fondo crema (`bg-[#f4f1ec]`) para toda la vista, diferenciandola de las demas.
- Barra de progreso verde lima en la parte superior que avanza con cada pregunta.
- Tarjeta blanca centrada con sombra que contiene cada pregunta.
- Opciones seleccionadas se resaltan en verde lima (`bg-lime-500`).
- Imagen ilustrativa de 160 px de alto (`h-40 object-cover`) en la parte superior de la tarjeta.
- Boton "Siguiente" / "Finalizar" semitransparente y no clicable mientras el paso no tenga respuesta.
- La pantalla de resultados usa una tarjeta amplia con tipografia grande para destacar el total.
- El toast de progreso recuperado es una tarjeta blanca flotante con borde izquierdo lima y sombra, en la esquina superior derecha debajo del navbar (ver "Toast de progreso recuperado").
- El boton "Anterior" es un boton secundario: fondo blanco, texto `gray-900`, borde de 2 px `border-gray-900`, `rounded` y `font-semibold`, con la misma altura que "Siguiente" (`py-1.5` mas el borde equivale a `py-2`). Al pasar el cursor se rellena con la paleta lima (`hover:bg-lime-100 hover:border-lime-700 hover:text-lime-900`). Deshabilitado en la pregunta 1 (`disabled:opacity-50 disabled:cursor-not-allowed`, sin cambio al pasar el cursor).
- "Borrar respuestas" es un boton grande rojo con borde (ver "Borrar respuestas durante el cuestionario"); el modal es un `<dialog>` blanco centrado (`m-auto`, necesario porque el reset de Tailwind quita el margen automatico) con fondo `backdrop:bg-black/50`, que entra y sale con transicion de opacidad y escala (`duration-200`).
- "Contestar de nuevo" es un boton con borde lima junto a "Volver al Inicio"; "Revisar mis respuestas" es texto gris subrayado.

### Accesibilidad

- El toast pausa su temporizador con escuchas nativas (`mouseenter`, `mouseleave`, `focusin`, `focusout`) sobre su contenedor; `role="status"` y `aria-live="polite"` estan en el parrafo del mensaje.
- Contraste: `red-700` sobre blanco y blanco sobre `red-700` superan la relacion 4.5:1 de WCAG AA; el texto del toast es `gray-800` y su accion `lime-800` sobre blanco.
- Botones de borrado y del modal con area de toque minima de 48 px (`min-h-12`) y texto de 16 px o mas.
- Anillo de foco visible (`focus-visible:ring-4`) en los botones del modal, en "Borrar respuestas" y en "Anterior" (`ring-lime-300`); `focus-visible:ring-2` en los botones del toast.
- "Anterior": `gray-900` sobre blanco y `lime-900` sobre `lime-100` superan ampliamente la relacion 4.5:1 de WCAG AA.
- Iconos SVG decorativos con `aria-hidden="true"`; el boton de cierre del toast tiene `aria-label="Cerrar aviso"`.
- El modal es un `<dialog>` nativo abierto con `showModal()` (rol `dialog` implicito, modal, fondo inerte) con `aria-labelledby` (titulo) y `aria-describedby` (descripcion). Al abrir, el foco va a "Cancelar"; Tab y Shift+Tab rotan dentro del dialogo; al cerrar, el foco vuelve al boton que lo abrio (si sigue en la pagina). El scroll del body se bloquea mientras esta abierto.
- Transicion del modal con CSS nativo: `transition-discrete` (`transition-behavior: allow-discrete`) y la variante `starting:` (`@starting-style`) animan opacidad y escala del dialogo (`scale-95` a `scale-100`) y la opacidad del fondo (`backdrop:bg-black/50`) al abrir y al cerrar, sin temporizadores: `close()` se llama de inmediato y el foco vuelve al disparador sin esperar. En navegadores sin soporte de transiciones discretas el modal simplemente aparece y desaparece.
- Todas las transiciones usan `motion-reduce:transition-none` (en el modal tambien `motion-reduce:backdrop:transition-none`).

---

## Modo Experimento

Es opt-in: se activa solo con `VITE_EXPERIMENTO_ACTIVO=true` (`EXPERIMENTO_ACTIVO` en `src/config/experiment.js`). Sin esa variable, por ejemplo en el despliegue publico de GitHub Pages, la calculadora funciona normal sin login ni cuestionario. Si esta activo, al pulsar "Finalizar" en la ultima pregunta se muestra el cuestionario de evaluacion (`CuestionarioExperimento`) a pantalla completa, y solo despues la pantalla de resultados.

### Acceso (login federado o correo)

Si ademas existe `VITE_API_URL`, `/calculadora` se envuelve en `LoginGate` (`src/features/auth/LoginGate.jsx`), que consulta `GET /api/me`. La respuesta trae `modoAcceso`, definido por la variable `REQUIERE_LOGIN` del backend (no se recompila el frontend):

- `saml` (`REQUIERE_LOGIN=true`): pide iniciar sesion con la cuenta institucional de la UCOL. Solo pasan estudiantes (`uTipo = Estudiante`).
- `correo` (`REQUIERE_LOGIN=false`): muestra `AccesoCorreo` (`src/features/auth/AccesoCorreo.jsx`), un campo para escribir el correo institucional que se envia a `POST /api/acceso/correo`. Solo se admiten los dominios de `CORREO_DOMINIOS_PERMITIDOS` (por defecto `ucol.mx` y subdominios) y la identidad no se verifica.

En ambos modos el navegador nunca recibe correo, nombre ni numero de cuenta, y no se puede enviar el cuestionario sin una sesion.

### Guardado de respuestas

Al finalizar el cuestionario se envia `POST {VITE_API_URL}/api/respuestas` con `respuestas`, `tiempoMin` y `planetas`. El tiempo y los planetas se calculan solos. El backend toma el id y el correo de la sesion (SAML o correo), valida los datos y los inserta en la tabla `respuestas` de MySQL. Hay un solo registro por participante y por correo; un segundo envio devuelve `duplicado` y la pantalla de resultados muestra un aviso (`avisoEnvio`).

### Estado adicional

| Variable | Descripcion |
| :--- | :--- |
| `verCuestionario` | Muestra el cuestionario del experimento en lugar de la calculadora |
| `avisoEnvio` | Mensaje del toast cuando el guardado falla o es un duplicado |
| `tiempoInicio` | Marca de tiempo al montar; se usa para calcular los minutos |

### Tipos de pregunta del cuestionario

`opcion_unica`, `select`, `numero` (con `min` y `max`), `texto_corto`, `texto_largo` y `escala_likert` (1 a 5). Las listas de opciones deben coincidir con `backend/src/validacion/respuestas.ts`.
