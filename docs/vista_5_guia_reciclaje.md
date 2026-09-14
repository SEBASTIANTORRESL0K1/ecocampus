# Vista 5: Guia de Reciclaje

- Ruta: `/guia-reciclaje`
- Componente: `src/features/guiaReciclaje/GuiaReciclaje.jsx`

---

## Proposito

Seccion educativa e informativa sobre la importancia del reciclaje. Explica los principios de las 3 R's, enumera sus beneficios y enlaza a programas oficiales de la Universidad de Colima. Incluye una infografia al final de la pagina.

---

## Estructura de la Vista

### Encabezado

Bloque de fondo gris oscuro (`bg-gray-800`) con texto blanco centrado. Contiene:

- Titulo: "Guia de Reciclaje"
- Subtitulo: "Conoce la importancia del reciclaje y como ayudar al planeta"
- Boton "Conoce mas" que enlaza externamente al programa de reforestacion de la UdC (`https://portal.ucol.mx/siga/reforestaccion/`), abre en nueva pestana

### Banner informativo

Bloque con fondo verde esmeralda claro (`bg-emerald-100`) que introduce el tema con un parrafo breve sobre el impacto positivo del reciclaje.

### Las 3 R's

Tres tarjetas centradas horizontalmente (flexbox, responsivas). En movil se apilan; en escritorio se muestran en fila. Cada tarjeta tiene:

- Numero grande en verde oscuro
- Nombre del principio
- Descripcion breve

| Numero | Nombre | Descripcion |
| :--- | :--- | :--- |
| 1 | Reciclar | Convertir materiales usados en nuevos productos |
| 2 | Reutilizar | Dar nueva vida a productos existentes sin modificarlos |
| 3 | Reducir | Disminuir el consumo y generacion de residuos |

### Beneficios del Reciclaje

Seccion con tres tarjetas blancas organizadas igual que las 3 R's:

| Categoria | Contenido |
| :--- | :--- |
| Ambientales | Menos contaminacion, ahorro de agua y energia, conservacion de recursos naturales |
| Economicos | Generacion de empleo en la industria del reciclaje y reduccion de costos de produccion |
| Sociales | Entorno mas limpio y saludable, comunidades con mayor educacion ambiental |

### Infografia

Imagen a todo el ancho (maximo `max-w-4xl`) cargada desde `public/infografia_guia.jpeg`. Se referencia con `process.env.PUBLIC_URL` para compatibilidad con el despliegue en GitHub Pages.

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer |

---

## Enlace Externo

El boton "Conoce mas" del encabezado apunta al programa **ReforestaAccion** de la Secretaria de Infraestructura y Gestion Ambiental (SIGA) de la Universidad de Colima. Se abre con `target="_blank"` y `rel="noopener noreferrer"` por seguridad.

---

## Diseno

- El encabezado gris oscuro es identico al de la Vista 4 (Comunidad), manteniendo coherencia entre las secciones de contenido informativo.
- Las tarjetas de las 3 R's usan fondo verde esmeralda muy claro (`bg-emerald-50`) para diferenciarlas visualmente de las tarjetas de beneficios (blancas).
- La infografia ocupa el ancho maximo disponible, lo que la hace el elemento visual mas destacado de la pagina.
- El boton del encabezado usa indigo (igual que el CTA de la Vista 1) para mantener coherencia en los botones de accion primaria.
