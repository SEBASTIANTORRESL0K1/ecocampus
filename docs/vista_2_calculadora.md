# Vista 2: Calculadora de Huella Ecologica

- Ruta: `/calculadora`
- Componente: `src/features/calculadora/Calculadora.jsx`
- Datos de preguntas: `src/features/calculadora/preguntas.js`

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
- `cantidadCelulares`: cantidad de celulares ingresada en Q24
- `detalle25`: objeto con horas de uso por tipo de dispositivo para Q25
- `habitantesHogar`: numero de habitantes del hogar

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer |
| `Link` | React Router DOM | Boton "Volver al Inicio" en la pantalla de resultados |

---

## Diseno

- Fondo crema (`bg-[#f4f1ec]`) para toda la vista, diferenciandola de las demas.
- Barra de progreso verde lima en la parte superior que avanza con cada pregunta.
- Tarjeta blanca centrada con sombra que contiene cada pregunta.
- Opciones seleccionadas se resaltan en verde lima (`bg-lime-500`).
- La pantalla de resultados usa una tarjeta amplia con tipografia grande para destacar el total.
