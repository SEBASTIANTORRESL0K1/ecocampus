# Vista 1: Inicio (Landing Page)

- Ruta: `/`
- Componente: `src/features/landing/LandingPage.jsx`

---

## Proposito

Pagina de bienvenida que introduce el concepto de huella ecologica al usuario, presenta las herramientas de la plataforma y lo invita a usar la calculadora interactiva. Funciona como punto de entrada principal de la aplicacion.

---

## Estructura de la Vista

### Hero

Ocupa toda la altura de la pantalla (`100dvh`). Usa el componente `PageHero` con:

- Imagen de fondo: foto del campus de la UCOL
- Eyebrow: "Plataforma ambiental universitaria"
- Titulo: "Calcula tu huella ecologica"
- Descripcion: "Conoce tu impacto ambiental y actua hoy"
- Boton de accion primaria "Comenzar calculo" (`CtaButton`) que navega a `/calculadora`

El `PageLayout` recibe la prop `navTransparent` para que la barra de navegacion sea transparente sobre el hero.

### Seccion informativa (About)

Cuadricula de dos columnas (`1fr 1fr`) con fondo blanco, que se colapsa a una sola columna en movil (`max-width: 768px`). Contiene:

Columna izquierda:
- Eyebrow en italica: "Bienvenido a EcoCampus"
- Titulo: "¿Que es la huella ecologica?" con icono `Leaf` decorativo
- Dos parrafos de definicion
- Dato estadistico: Mexico tiene una huella ecologica de aproximadamente **3.1 hectareas globales** por persona (fuente: WWF)
- Dato adicional: Mexico ocupa el lugar 26 en concentracion anual de PM2.5, con **20.1 ug/m3** de promedio
- Fila de dos estadisticas numericas grandes ("3.1 ha globales / persona" y "20.1 ug/m3 PM2.5")

Columna derecha:
- Imagen ilustrativa de huella ecologica (`loading="lazy"`, `object-fit: cover`), con borde redondeado y sombra verde

### Seccion de herramientas

Bloque con fondo `var(--color-section-alt)` que contiene:

- Encabezado (`SectionHeading`) con eyebrow "Todo lo que necesitas" y titulo "Nuestras herramientas"
- Cuadricula de 4 tarjetas (`repeat(auto-fit, minmax(220px, 1fr))`) que enlazan a las otras vistas:

| Herramienta | Ruta | Icono |
| :--- | :--- | :--- |
| Calculadora | `/calculadora` | `Sprout` |
| Mapa interactivo | `/mapa` | `Map` |
| Comunidad | `/comunidad` | `Users` |
| Guia de reciclaje | `/guia-reciclaje` | `Recycle` |

Cada tarjeta es un `article` con imagen de fondo, superposicion oscura semitransparente, `IconCircle`, nombre y descripcion en blanco. Tiene efecto de escala y sombra al pasar el cursor.

---

## Animaciones

La vista usa el hook `useScrollReveal` con clases `reveal` y `reveal-card` para animar la entrada de los elementos al hacer scroll. Las tarjetas de herramientas tienen un retraso escalonado de 80 ms entre cada una.

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Envuelve el contenido con Navbar y Footer; recibe `navTransparent` |
| `PageHero` | `src/components/ui/PageHero.jsx` | Bloque hero con imagen de fondo, eyebrow, titulo, descripcion y CTA |
| `CtaButton` | `src/components/ui/CtaButton.jsx` | Boton de accion primaria del hero |
| `SectionWrapper` | `src/components/ui/SectionWrapper.jsx` | Contenedor de seccion con padding y fondo configurables |
| `SectionHeading` | `src/components/ui/SectionHeading.jsx` | Encabezado de seccion con eyebrow y titulo |
| `FeatureCard` | `src/components/ui/FeatureCard.jsx` | Tarjeta blanca de caracteristica (usado como fallback sin imagen) |
| `IconCircle` | `src/components/ui/IconCircle.jsx` | Circulo con icono de lucide-react |
| `useScrollReveal` | `src/hooks/useScrollReveal.js` | Hook para animaciones de entrada al hacer scroll |
| `Link` | React Router DOM | Navegacion hacia `/calculadora` sin recarga de pagina |
| `Sprout`, `Map`, `Users`, `Recycle`, `Leaf` | lucide-react | Iconos de las tarjetas de herramientas y secciones |

---

## Comportamiento y Flujo

1. El usuario llega a la pagina raiz `/`.
2. Ve el hero a pantalla completa con el CTA "Comenzar calculo".
3. Al hacer scroll, la seccion About y las estadisticas se revelan con animacion.
4. Mas abajo aparece la seccion de herramientas con 4 tarjetas que enlazan a las demas vistas.
5. Hacer clic en "Comenzar calculo" o en la tarjeta "Calculadora" lleva a `/calculadora`.

---

## Decisiones de Diseno

- La navbar transparente sobre el hero crea una experiencia inmersiva de pantalla completa.
- La cuadricula de dos columnas en la seccion About permite mostrar texto e imagen sin apilarlos.
- Las tarjetas de herramientas con imagen de fondo refuerzan la identidad visual de cada seccion.
- El diseNo es responsivo: la cuadricula About y las tarjetas se colapsan a una columna en movil.
