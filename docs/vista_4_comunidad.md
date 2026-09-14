# Vista 4: Comunidad EcoCampus

- Ruta: `/comunidad`
- Componente: `src/features/comunidad/Comunidad.jsx`
- Datos: `src/features/comunidad/noticiasEventos.js`

---

## Proposito

Tablon de noticias y eventos ambientales orientado a mantener informada y conectada a la comunidad universitaria sobre las iniciativas ecologicas del campus y su entorno.

---

## Estructura de la Vista

### Encabezado

Bloque de fondo gris oscuro (`bg-gray-800`) con texto blanco centrado. Contiene:

- Titulo: "Comunidad EcoCampus"
- Subtitulo: "Mantente informado sobre eventos y noticias ambientales"

### Cuadricula de tarjetas

Las publicaciones se presentan en una cuadricula responsiva:

- 1 columna en movil
- 2 columnas en escritorio (`md:grid-cols-2`)
- Espaciado de `gap-6` entre tarjetas

Cada tarjeta muestra:

| Campo | Descripcion |
| :--- | :--- |
| Titulo | Nombre del evento o noticia, en verde (`text-green-700`) |
| Fecha | Texto en gris italico |
| Descripcion | Parrafo con el detalle de la publicacion |
| Tipo | Etiqueta ("Evento" o "Noticia") con fondo verde claro |

Las tarjetas tienen efecto de sombra al pasar el cursor (`hover:shadow-lg transition-shadow`).

---

## Estructura de Datos

El archivo `noticiasEventos.js` exporta un arreglo de objetos con la siguiente forma:

```js
{
  id: number,
  titulo: string,
  fecha: string,
  descripcion: string,
  tipo: "Evento" | "Noticia"
}
```

### Contenido actual (datos de ejemplo)

| ID | Titulo | Tipo | Fecha |
| :--- | :--- | :--- | :--- |
| 1 | Limpieza de playa - Manzanillo | Evento | 15 de febrero, 9:00 AM |
| 2 | Nueva estacion de reciclaje en campus | Noticia | 10 de febrero |
| 3 | Taller de compostaje domestico | Evento | 20 de febrero, 16:00 PM |

Los datos estan definidos de forma estatica en el archivo fuente. Para agregar nuevas publicaciones, basta con anadir un objeto al arreglo en `noticiasEventos.js`.

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer |

---

## Diseno

- El encabezado gris oscuro es compartido con la Vista 5 (Guia de Reciclaje), creando consistencia visual entre las secciones de contenido editorial.
- Las tarjetas usan bordes sutiles (`border-gray-200`) con fondo blanco para maximizar la legibilidad.
- La etiqueta de tipo usa colores verdes (`bg-green-100 text-green-800`) que refuerzan la identidad de sustentabilidad del proyecto.
