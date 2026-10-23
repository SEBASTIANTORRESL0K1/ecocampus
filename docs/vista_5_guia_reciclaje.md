# Vista 5: Guia de Reciclaje

- Ruta: `/guia-reciclaje`
- Componente: `src/features/guiaReciclaje/GuiaReciclaje.jsx`
- Sub-componentes: `HeroSection.jsx`, `PrinciplesSection.jsx`, `BenefitsSection.jsx`
- Datos: `src/features/guiaReciclaje/data.js`

---

## Proposito

Seccion educativa e informativa sobre la importancia del reciclaje. Explica los principios de las 3 R's, enumera sus beneficios y enlaza a programas oficiales de la Universidad de Colima. Incluye una infografia al final de la pagina.

---

## Estructura de la Vista

### Hero (`HeroSection`)

Componente independiente que renderiza un `PageHero` con:

- Imagen de fondo: foto de reciclaje de Unsplash
- Eyebrow: "Plataforma ambiental universitaria"
- Titulo: "Guia de Reciclaje"
- Descripcion: "Conoce la importancia del reciclaje y como ayudar al planeta"
- Boton CTA "Conoce mas" (`CtaButton` como enlace `<a>`) que apunta externamente al programa ReforestaAccion de la UdC (`https://portal.ucol.mx/siga/reforestaccion/`), abierto con `target="_blank"` y `rel="noopener noreferrer"`

El `PageLayout` recibe la prop `navTransparent`.

### Banner informativo

Bloque con fondo `#f7f9f4`, centrado, con icono `Leaf` decorativo y un parrafo sobre el impacto positivo del reciclaje. Entra con animacion `reveal` al hacer scroll.

### Las 3 R's (`PrinciplesSection`)

Componente independiente dentro de un `SectionWrapper` con fondo blanco. Contiene:

- Encabezado (`SectionHeading`) con eyebrow "Principios fundamentales" y titulo "Las 3 R's del reciclaje"
- Cuadricula de 3 tarjetas (`FeatureCard` con `background: var(--color-surface-light)`), que se colapsa a 1 columna en movil

Los datos provienen de `data.js`. Cada tarjeta muestra un numero grande, un icono lucide-react, el nombre del principio en mayusculas y una descripcion.

| Numero | Nombre | Descripcion |
| :--- | :--- | :--- |
| 1 | Reciclar | Convertir materiales usados en nuevos productos |
| 2 | Reutilizar | Dar nueva vida a productos existentes sin modificarlos |
| 3 | Reducir | Disminuir el consumo y generacion de residuos |

### Beneficios del Reciclaje (`BenefitsSection`)

Componente independiente dentro de un `SectionWrapper` con fondo `var(--color-section-alt)`. Contiene:

- Encabezado (`SectionHeading`) con eyebrow "¿Por que reciclar?" y titulo "Beneficios del reciclaje"
- Cuadricula de 3 tarjetas (`FeatureCard` con fondo blanco), que se colapsa a 1 columna en movil

Los datos provienen de `data.js`. Cada tarjeta tiene un `IconCircle` con icono lucide-react, el nombre del beneficio en mayusculas y una descripcion.

| Categoria | Contenido |
| :--- | :--- |
| Ambientales | Menos contaminacion, ahorro de agua y energia, conservacion de recursos naturales |
| Economicos | Generacion de empleo en la industria del reciclaje y reduccion de costos de produccion |
| Sociales | Entorno mas limpio y saludable, comunidades con mayor educacion ambiental |

### Infografia

Seccion con fondo blanco. Tiene un titulo "Infografia informativa" y la imagen a ancho completo (maximo `maxWidth: 896px`, `border-radius: 8px`, sombra verde) cargada desde `public/infografia_guia.jpeg`. Se referencia con `` `${import.meta.env.BASE_URL}infografia_guia.jpeg` `` para compatibilidad con el despliegue en GitHub Pages. Entra con animacion `reveal` al hacer scroll.

---

## Animaciones

`GuiaReciclaje` usa `useScrollReveal` para el banner intro y la infografia. `PrinciplesSection` y `BenefitsSection` tienen sus propios hooks para animar el encabezado y cada tarjeta con retraso escalonado de 80 ms.

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer; recibe `navTransparent` |
| `HeroSection` | `src/features/guiaReciclaje/HeroSection.jsx` | Hero de la vista con `PageHero` y boton "Conoce mas" |
| `PrinciplesSection` | `src/features/guiaReciclaje/PrinciplesSection.jsx` | Seccion de las 3 R's con datos de `data.js` |
| `BenefitsSection` | `src/features/guiaReciclaje/BenefitsSection.jsx` | Seccion de beneficios con datos de `data.js` |
| `PageHero` | `src/components/ui/PageHero.jsx` | Bloque hero (usado en `HeroSection`) |
| `CtaButton` | `src/components/ui/CtaButton.jsx` | Boton "Conoce mas" como enlace externo |
| `SectionWrapper` | `src/components/ui/SectionWrapper.jsx` | Contenedor de seccion con padding y fondo configurables |
| `SectionHeading` | `src/components/ui/SectionHeading.jsx` | Encabezado de seccion con eyebrow y titulo |
| `FeatureCard` | `src/components/ui/FeatureCard.jsx` | Tarjeta de principio o beneficio |
| `IconCircle` | `src/components/ui/IconCircle.jsx` | Circulo con icono (usado en beneficios) |
| `useScrollReveal` | `src/hooks/useScrollReveal.js` | Hook para animaciones de entrada |
| `Leaf` | lucide-react | Icono decorativo del banner intro |

---

## Enlace Externo

El boton "Conoce mas" del hero apunta al programa **ReforestaAccion** de la Secretaria de Infraestructura y Gestion Ambiental (SIGA) de la Universidad de Colima. Se abre con `target="_blank"` y `rel="noopener noreferrer"` por seguridad.

---

## Diseno

- El hero con imagen de fondo crea consistencia visual con las demas vistas que usan `PageHero`.
- El banner intro tiene fondo neutro (`#f7f9f4`) para separar visualmente el hero de las tarjetas.
- Las tarjetas de las 3 R's usan `var(--color-surface-light)` para diferenciarlas de las de beneficios (fondo blanco del tema).
- La infografia ocupa el ancho maximo disponible (hasta 896 px), haciendola el elemento visual mas destacado de la pagina.
- El boton del hero es un `CtaButton` con `as="a"` (igual que el CTA de la Vista 1) para mantener coherencia en los botones de accion primaria.
