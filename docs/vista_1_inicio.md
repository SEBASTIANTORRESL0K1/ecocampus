# Vista 1: Inicio (Landing Page)

- Ruta: `/`
- Componente: `src/features/landing/LandingPage.jsx`

---

## Proposito

Pagina de bienvenida que introduce el concepto de huella ecologica al usuario y lo invita a usar la calculadora interactiva. Funciona como punto de entrada principal de la aplicacion.

---

## Estructura de la Vista

### Encabezado hero

Bloque de fondo verde lima (`bg-lime-600`) que ocupa el ancho completo de la pantalla. Contiene:

- Titulo principal: "Calcula tu huella ecologica y ayuda al planeta"
- Subtitulo: "Conoce tu impacto y ayuda al planeta"
- Boton de accion primaria "Comenzar calculo" que navega a `/calculadora`

### Seccion informativa

Tarjeta blanca con sombra centrada en la pagina. Contiene:

- Pregunta "Que es la huella ecologica?" como titulo de seccion
- Parrafo de definicion general con fondo gris claro (`bg-neutral-200`)
- Dato estadistico destacado: Mexico tiene una huella ecologica de aproximadamente **3.1 hectareas globales** por persona (fuente: WWF)
- Dato adicional: Mexico ocupa el lugar 26 en concentracion anual de PM2.5, con **20.1 ug/m3** de promedio

---

## Componentes Utilizados

| Componente | Archivo | Funcion |
| :--- | :--- | :--- |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Envuelve el contenido con Navbar y Footer |
| `Link` | React Router DOM | Navegacion hacia `/calculadora` sin recarga de pagina |

---

## Comportamiento y Flujo

1. El usuario llega a la pagina raiz `/`.
2. Lee la introduccion a la huella ecologica.
3. Hace clic en "Comenzar calculo" para ser dirigido a la Vista 2 (Calculadora).

No hay estado interno ni llamadas a datos externos. La vista es completamente estatica.

---

## Decisiones de Diseno

- El fondo verde lima del hero establece la paleta cromatica del proyecto y refuerza la identidad ambiental.
- El boton de CTA usa indigo para crear contraste visual frente al fondo verde.
- El diseno es responsivo: el ancho de la tarjeta informativa se ajusta con clases `w-11/12 md:w-3/4`.
