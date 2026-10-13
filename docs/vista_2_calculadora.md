# Vista 2: Calculadora de Huella Ecologica

- Ruta: `/calculadora`
- Componente: `src/features/calculadora/Calculadora.jsx`
- Datos de preguntas: `src/features/calculadora/preguntas.js`
- Validacion de pasos: `src/features/calculadora/pasoRespondido.js`
- Imagen ilustrativa: `src/features/calculadora/ImagenTema.jsx`

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

Cada pregunta en `preguntas.js` tiene un campo `imagen` con una palabra clave en ingles del tema (por ejemplo `fruit`, `bread`, `subway`, `lightbulb`, `notebook`); el paso `habitantesHogar` usa `family`. En la parte superior de la tarjeta de cada paso se muestra una imagen obtenida de **LoremFlickr** (gratuito, sin API key):

```
https://loremflickr.com/640/320/{palabraClave}?lock={id}
```

- `lock` usa el id de la pregunta (0 para `habitantesHogar`), de modo que cada pregunta muestra siempre la misma imagen.
- La URL se construye en `urlImagenTema()` (en `ImagenTema.jsx`); para cambiar de proveedor basta con modificar esa funcion.
- El contenedor gris (`bg-gray-100`, `h-40`) reserva el espacio mientras la imagen carga (`loading="lazy"`).
- El texto `alt` es `Imagen ilustrativa: {texto de la pregunta}`.
- Si la imagen falla (`onError`), se oculta y el contenedor muestra "Imagen no disponible". El componente recibe `key={pasoActual}` para reiniciar ese estado al cambiar de paso.

---

## Flujo de Navegacion

1. La vista construye una lista ordenada de pasos al montarse (`construirPasos()`).
2. Se muestra un paso a la vez con barra de progreso en la parte superior.
3. El usuario puede avanzar ("Siguiente") o retroceder ("Anterior") entre preguntas.
4. En el ultimo paso, el boton cambia a "Finalizar" y ejecuta `calcularHuellaEcologica(respuestas)`.
5. Se presenta la pantalla de resultados.

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
| `pasoActual` | Indice del paso actualmente visible |
| `respuestas` | Objeto acumulador donde cada clave es el ID de la pregunta y el valor es la respuesta |
| `verResultado` | Booleano que activa la pantalla de resultados |
| `resultado` | Objeto devuelto por `calcularHuellaEcologica` |

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

---

## Diseno

- Fondo crema (`bg-[#f4f1ec]`) para toda la vista, diferenciandola de las demas.
- Barra de progreso verde lima en la parte superior que avanza con cada pregunta.
- Tarjeta blanca centrada con sombra que contiene cada pregunta.
- Opciones seleccionadas se resaltan en verde lima (`bg-lime-500`).
- Imagen ilustrativa de 160 px de alto (`h-40 object-cover`) en la parte superior de la tarjeta.
- Boton "Siguiente" / "Finalizar" semitransparente y no clicable mientras el paso no tenga respuesta.
- La pantalla de resultados usa una tarjeta amplia con tipografia grande para destacar el total.
