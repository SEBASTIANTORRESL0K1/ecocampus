# DESIGN.md — EcoCampus Landing Page Scroll Animations

## Objetivo

Agregar animaciones de entrada al hacer scroll en la página de inicio (`LandingPage.jsx`),
siguiendo el estilo de alto nivel visual (soft-skill / Awwwards-tier) con física de resorte,
blur fade-up y coreografía escalonada.

---

## Vibe & Layout Archetype (soft-skill)

- **Vibe:** Soft Structuralism — fondos blancos/gris plata, tipografía Grotesk bold masiva,
  sombras ambientales difusas sin dureza.
- **Layout:** Z-Axis Cascade con stagger — los elementos aparecen como capas físicas en profundidad.

---

## Paleta existente (mantener)

| Token | Valor | Uso |
|-------|-------|-----|
| `hero-bg` | imagen con overlay verde | Hero section |
| `section-white` | `#ffffff` | Sección About |
| `section-alt` | `var(--color-section-alt)` | Sección herramientas |
| `accent-green` | `#4a7c59` | Textos de énfasis, íconos |
| `heading-dark` | `#1a2e1a` | Títulos principales |
| `body-text` | `#3a4a3a` | Texto de cuerpo |
| `stat-green` | `#2d6a2d` | Cifras estadísticas destacadas |

---

## Tipografía

Mantener la tipografía existente del proyecto (`font-sans`). Las animaciones no cambian la
fuente — solo agregan movimiento al texto existente.

---

## Animaciones de scroll: especificación

### Principio general

Cada sección (About, Stats, Features grid) y sus elementos internos ejecutan un
**"blur-fade-up"** al entrar al viewport:

- Estado inicial: `opacity: 0; transform: translateY(40px); filter: blur(6px)`
- Estado final: `opacity: 1; transform: translateY(0); filter: blur(0)`
- Curva de timing: `cubic-bezier(0.32, 0.72, 0, 1)` (simulación de resorte amortiguado)
- Duración base: `700ms`
- Solo `transform` y `opacity` para GPU — el blur se aplica con `filter` durante la entrada,
  no en estado visible prolongado.

### Implementación técnica

Usar `IntersectionObserver` nativo en un hook personalizado `useScrollReveal`:

```js
// hook devuelve { ref, isVisible }
// threshold: 0.15 — activa cuando el 15% del elemento está visible
// triggerOnce: true — no repite la animación al hacer scroll de vuelta
```

Aplicar el hook a cada bloque semántico con clase utilitaria CSS que gestiona los estados.

### Coreografía por sección

#### Hero

El hero no necesita animación de scroll (ya está visible al cargar). El eyebrow, título,
descripción y CTA pueden tener una animación de **entrada en carga** (fade-up stagger):
- Eyebrow: delay 0ms
- Título: delay 100ms
- Descripción: delay 200ms
- CTA button: delay 300ms

#### Sección About (grid 2 col)

- Columna texto (izquierda): blur-fade-up desde Y+40, delay 0ms
- Columna imagen (derecha): blur-fade-up desde Y+40, delay 150ms
- Estadísticas internas: aparecen con stagger individual delay 80ms entre cada stat

#### Sección Herramientas (FeatureCards)

- SectionHeading (eyebrow + título): blur-fade-up, delay 0ms
- Cada FeatureCard: stagger escalonado de 80ms (card 0: 0ms, card 1: 80ms, card 2: 160ms, card 3: 240ms)
- Las cards parten de `translateY(32px)` (menos desplazamiento para efecto más sutil en grid)

---

## Restricciones

- No introducir Framer Motion ni librerías de animación externas — solo CSS + IntersectionObserver
- No animar `top`, `left`, `width`, `height` — solo `transform` y `opacity` (+ `filter` durante entrada)
- `will-change: transform` solo durante la animación activa; se remueve después
- Las animaciones se desactivan con `@media (prefers-reduced-motion: reduce)` — los elementos
  simplemente aparecen sin movimiento

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/features/landing/LandingPage.jsx` | Aplicar hook/clases de scroll reveal a secciones |
| `frontend/src/hooks/useScrollReveal.js` | Nuevo hook con IntersectionObserver |
| `frontend/src/styles/scroll-animations.css` | Clases CSS utilitarias para estados de animación |

No modificar componentes compartidos (`PageHero`, `FeatureCard`, etc.) — las animaciones
se aplican en el nivel de `LandingPage.jsx` como wrappers o refs.

---

## Navbar Redesign (sin cambios en este PR)

Los tokens del navbar de la iteración anterior se mantienen como están. Este cambio
es exclusivo de animaciones de scroll en la landing page.
