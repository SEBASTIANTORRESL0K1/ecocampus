# EcoCampus 🌿 - Documentación General del Proyecto

Bienvenido a la documentación oficial de **EcoCampus**, una plataforma web diseñada para promover la conciencia ambiental, la educación en sostenibilidad y la gestión de residuos dentro de la comunidad universitaria. 

Este documento sirve como base para comprender el propósito, la arquitectura, las características técnicas del proyecto y la estructura de sus diferentes vistas. Esta información está diseñada de manera que sea ideal para preparar una presentación ejecutiva del proyecto.

---

## 🎯 Propósito del Proyecto
EcoCampus nace como una iniciativa tecnológica para empoderar a estudiantes, docentes y personal de la **Universidad de Colima** (y la sociedad en general) en la toma de decisiones ecológicas conscientes. A través de la gamificación, la geolocalización y la educación, el proyecto busca:
1. **Medir el impacto personal:** Evaluar de forma científica la huella ecológica individual con un enfoque adaptado a la realidad mexicana.
2. **Facilitar la acción práctica:** Geolocalizar los contenedores y depósitos de reciclaje distribuidos por el campus para incentivar la separación de residuos.
3. **Educar y concientizar:** Ofrecer guías interactivas sobre los principios del reciclaje y los beneficios globales de la sustentabilidad.
4. **Fomentar la comunidad:** Mantener un canal activo de comunicación sobre noticias, talleres e iniciativas ecológicas locales.

---

## 💻 Ficha Técnica del Proyecto (Stack Tecnológico)
El desarrollo del proyecto destaca por utilizar versiones modernas e innovadoras de tecnologías líderes en el mercado web:

| Componente | Tecnología | Versión | Propósito / Beneficio |
| :--- | :--- | :--- | :--- |
| **Framework Frontend** | [React](https://react.dev/) | `v19.0.0` | Biblioteca de interfaz declarativa de alto rendimiento que utiliza componentes modulares y reutilizables. |
| **Estilizado & Diseño** | [Tailwind CSS](https://tailwindcss.com/) | `v4.0.9` | Framework de diseño utilitario de última generación (v4) que optimiza el tamaño de la compilación y agiliza un desarrollo visual responsivo. |
| **Enrutamiento** | [React Router DOM](https://reactrouter.com/) | `v7.2.0` | Gestión avanzada de la navegación de una Sola Página (SPA) con transiciones inmediatas. |
| **Mapeo Interactivo** | [React Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/) | `v5.0.0` / `v1.9.4` | Renderizado interactivo y móvil-amigable de mapas utilizando datos abiertos de OpenStreetMap. |
| **Despliegue Continuo** | GitHub Actions & GitHub Pages | - | Integración y entrega continua (CI/CD) para compilar y desplegar la aplicación automáticamente en la dirección web pública. |

---

## 🗺️ Estructura de Navegación (Vistas del Proyecto)
La aplicación cuenta con 5 vistas principales, accesibles de manera fluida mediante una barra de navegación superior compartida:

1. [**Vista 1: Inicio (Landing Page)**](./vista_1_inicio.md)
   - *Ruta:* `/`
   - *Función:* Introducción al concepto de huella ecológica y puerta de acceso al cuestionario interactivo.
2. [**Vista 2: Calculadora de Huella Ecológica**](./vista_2_calculadora.md)
   - *Ruta:* `/calculadora`
   - *Función:* Cuestionario interactivo de 30 preguntas basado en metodología científica mexicana para evaluar y desglosar el impacto ecológico del usuario.
3. [**Vista 3: Mapa de Puntos de Reciclaje**](./vista_3_mapa.md)
   - *Ruta:* `/mapa`
   - *Función:* Mapa georreferenciado e interactivo que ubica los 21 contenedores de reciclaje físicos del campus central, acompañados de fotos reales para su fácil identificación.
4. [**Vista 4: Comunidad EcoCampus**](./vista_4_comunidad.md)
   - *Ruta:* `/comunidad`
   - *Función:* Tablón de noticias y eventos ecológicos para mantener conectada a la comunidad universitaria con las acciones ambientales de su entorno.
5. [**Vista 5: Guía de Reciclaje**](./vista_5_guia_reciclaje.md)
   - *Ruta:* `/guia-reciclaje`
   - *Función:* Sección informativa y visual (incluye infografía) sobre las 3 R's de la ecología, beneficios del reciclaje y enlaces a programas oficiales de la Universidad de Colima.

---

## 🎨 Características de Diseño y Maquetación Global
* **Maquetación Unificada (`PageLayout`):** Todas las vistas están envueltas en un componente estructural común que asegura que la barra de navegación (**Navbar**) y el pie de página (**Footer**) permanezcan consistentes.
* **Header Temático:** Cada sección utiliza encabezados visualmente bien diferenciados (tonos verdes y grises oscuros) para establecer un contraste profesional y mantener una paleta de colores coherente con la naturaleza.
* **Footer Institucional:** El pie de página integra la identidad de la **Universidad de Colima**, mostrando logotipos oficiales (UdC, eslogan *"Pertenencia que transforma"*), enlaces directos a sus redes sociales (Facebook, Instagram, YouTube) y su dirección física institucional, cumpliendo con los estándares de representación de la institución.
* **Diseño Responsivo (Mobile-First):** La interfaz está completamente adaptada para lucir perfecta tanto en pantallas de teléfonos móviles como en tabletas y computadoras de escritorio.
