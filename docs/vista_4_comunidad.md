# Vista 4: Comunidad EcoCampus

- Ruta: `/comunidad`
- Componente: `src/features/comunidad/Comunidad.jsx`
- Datos: `src/features/comunidad/noticiasEventos.js`

---

## Proposito

Tablon de noticias y eventos ambientales orientado a mantener informada y conectada a la comunidad universitaria sobre las iniciativas ecologicas del campus y su entorno.

---

## Estructura de la Vista

### Hero

Usa el componente `PageHero` con imagen de fondo (foto de reciclaje de Unsplash), altura minima del 42% del viewport (`minHeight: "42vh"`). Contiene:

- Eyebrow: "Noticias y eventos ambientales"
- Titulo: "Comunidad EcoCampus"
- Descripcion: "Mantente informado sobre eventos y noticias ambientales"

El `PageLayout` recibe la prop `navTransparent`.

### Cuadricula de tarjetas

Las publicaciones se presentan en una cuadricula de 3 columnas (`repeat(3, 1fr)`) con espaciado de `1.5rem`, dentro de un `SectionWrapper` con fondo `var(--color-section-alt)`. En movil (max-width: 768px) se colapsa a 1 columna.

Cada tarjeta es un `FeatureCard` con animacion escalonada de 80 ms por indice (`reveal-card`). Contiene:

| Elemento | Descripcion |
| :--- | :--- |
| Badge de tipo | Pastilla redondeada con icono (`Newspaper` o `CalendarDays`) y texto ("Noticia" / "Evento") en verde (`bg: #e8f4ec`, `color: #2d6a2d`) |
| Titulo | Nombre del evento o noticia en verde oscuro (`color: #2d6a2d`, `font-weight: 700`) |
| Fecha | Texto en gris italico con icono `Calendar` a la izquierda |
| Descripcion | Parrafo con el detalle de la publicacion |

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

## Animaciones

El hook `useScrollReveal` observa el contenedor de la cuadricula y aplica la clase `reveal-card` con retraso escalonado de 80 ms a cada tarjeta al entrar en el viewport.

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer; recibe `navTransparent` |
| `PageHero` | `src/components/ui/PageHero.jsx` | Bloque hero con imagen de fondo, eyebrow, titulo y descripcion |
| `SectionWrapper` | `src/components/ui/SectionWrapper.jsx` | Contenedor de seccion con padding y fondo configurables |
| `FeatureCard` | `src/components/ui/FeatureCard.jsx` | Tarjeta blanca de caracteristica para cada noticia o evento |
| `useScrollReveal` | `src/hooks/useScrollReveal.js` | Hook para animaciones de entrada de la cuadricula |
| `Calendar`, `Newspaper`, `CalendarDays` | lucide-react | Iconos de fecha y tipo en las tarjetas |

---

## Diseno

- El hero con imagen de fondo crea consistencia visual con las demas vistas que usan `PageHero`.
- Las tarjetas usan `FeatureCard` (fondo blanco, borde redondeado, sombra sutil) para maximizar la legibilidad.
- La pastilla de tipo con icono diferencia visualmente noticias de eventos sin depender solo del texto.
- La cuadricula de 3 columnas aprovecha el espacio en escritorio; en movil cada tarjeta ocupa el ancho completo.
