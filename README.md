# EcoCampus (Eco-Campus2)

Aplicación web para fomentar el reciclaje y la sostenibilidad en el campus de la Universidad de Colima. Permite calcular la huella ecológica personal, ubicar los puntos de reciclaje del campus en un mapa interactivo, consultar una guía de reciclaje y mantenerse informado sobre noticias y eventos ambientales de la comunidad universitaria.

Proyecto de tesis — Universidad de Colima.

## Tecnologías

- [React](https://react.dev/) 19 + [Create React App](https://create-react-app.dev/)
- [React Router](https://reactrouter.com/) para el ruteo entre páginas
- [Tailwind CSS](https://tailwindcss.com/) para los estilos
- [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/) para el mapa de puntos de reciclaje

## Estructura del proyecto

```
Ecocampus - copia/
├── README.md
└── frontend/                    # aplicación React (única app del proyecto por ahora)
    ├── public/                  # assets estáticos (logos, fotos de depósitos, favicon...)
    └── src/
        ├── App.jsx              # define las rutas de la app
        ├── components/
        │   └── layout/          # Navbar, Footer y PageLayout compartidos por todas las páginas
        ├── features/            # una carpeta por página/funcionalidad
        │   ├── landing/         # página de inicio
        │   ├── calculadora/     # calculadora de huella ecológica
        │   ├── mapa/            # mapa de puntos de reciclaje del campus
        │   ├── comunidad/       # noticias y eventos ambientales
        │   └── guiaReciclaje/   # guía informativa de reciclaje
        └── assets/              # imágenes e íconos usados directamente en el código
```

## Páginas

| Ruta               | Descripción                                                        |
|---------------------|---------------------------------------------------------------------|
| `/`                 | Landing page con información sobre la huella ecológica              |
| `/calculadora`      | Cuestionario para calcular la huella ecológica personal              |
| `/mapa`              | Mapa interactivo con los puntos de reciclaje del campus              |
| `/comunidad`         | Noticias y eventos ambientales                                       |
| `/guia-reciclaje`    | Guía con los principios y beneficios del reciclaje                   |

## Cómo correr el proyecto localmente

```bash
cd frontend
npm install
npm start
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

Otros scripts disponibles dentro de `frontend/`:

- `npm run build` — genera el build de producción en `frontend/build/`
- `npm test` — corre las pruebas

## Despliegue

El proyecto está configurado para publicarse en GitHub Pages (ver el campo `homepage` en `frontend/package.json`), bajo la ruta base `/Eco-Campus2`.
