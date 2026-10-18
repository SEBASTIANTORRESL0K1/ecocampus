# Vista 3: Mapa de Puntos de Reciclaje

- Ruta: `/mapa`
- Componente: `src/features/mapa/Mapa.jsx`
- Datos: `src/features/mapa/puntosReciclaje.js`
- Icono personalizado: `src/features/mapa/customIcon.js`

---

## Proposito

Mapa interactivo que muestra la ubicacion exacta de los 21 contenedores de reciclaje fisicos distribuidos en el Campus Central de la Universidad de Colima. Cada marcador incluye una fotografia real del deposito para facilitar su identificacion en campo.

---

## Implementacion del Mapa

La vista usa la biblioteca **React Leaflet** con tiles de **OpenStreetMap**.

- Centro inicial del mapa: `[19.249437, -103.698893]` (Campus Central)
- Nivel de zoom inicial: `17`
- Capa de mapa: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

### Icono personalizado

El archivo `customIcon.js` define un icono SVG personalizado con `L.Icon` de Leaflet:

| Propiedad | Valor |
| :--- | :--- |
| `iconUrl` | `src/assets/markpointMap.svg` |
| `iconSize` | `[18, 18]` px |
| `iconAnchor` | `[16, 32]` (base central del icono) |
| `popupAnchor` | `[0, -32]` (popup aparece encima del marcador) |

---

## Datos de los Puntos de Reciclaje

El archivo `puntosReciclaje.js` exporta un arreglo de 21 objetos con la siguiente estructura:

```js
{
  id: number,
  nombre: string,        // Nombre descriptivo de la ubicacion
  coordenadas: [lat, lng],
  imagen: string         // Ruta relativa a /public/Depositos/
}
```

### Ubicaciones registradas

Los 21 puntos cubren las siguientes zonas del campus:

- Facultades: Psicologia, Telematica, Letras, Medicina, Enfermeria, Trabajo Social, Mercadotecnia, Ciencias de la Educacion
- Areas de servicio: Cafeterias, comedores
- Edificios administrativos: Servicios, Direccion General
- Espacios culturales: Auditorios, Radio Universidad
- Bachillerato 1
- Zonas especificas internas: banos, aulas zona norte, laboratorios

---

## Comportamiento de la Interfaz

- Al cargar la vista, el mapa se renderiza centrado en el campus con todos los marcadores visibles.
- Al hacer clic en un marcador, aparece un popup con:
  - Nombre de la ubicacion (titulo en negrita)
  - Fotografia del contenedor (`w-40 h-32`, con `object-cover`)
- El mapa es completamente interactivo: zoom con rueda del raton, arrastre con clic sostenido, y compatible con gestos tactiles en movil.

---

## Componentes Utilizados

| Componente | Origen | Funcion |
| :--- | :--- | :--- |
| `MapContainer` | react-leaflet | Contenedor principal del mapa |
| `TileLayer` | react-leaflet | Carga los tiles de OpenStreetMap |
| `Marker` | react-leaflet | Representa cada punto de reciclaje |
| `Popup` | react-leaflet | Muestra nombre e imagen al hacer clic |
| `PageLayout` | `src/components/layout/PageLayout.jsx` | Estructura global con Navbar y Footer |

---

## Imagenes de los Depositos

Las fotografias estan almacenadas en `public/Depositos/` y se referencian mediante `` `${import.meta.env.BASE_URL}${punto.imagen.slice(1)}` ``. `BASE_URL` incluye el trailing slash y resuelve a `/ecocampus/` en produccion y `/` en desarrollo, garantizando rutas correctas en ambos entornos.

---

## Diseno

- Mapa con bordes redondeados (`rounded-lg`) y sombra (`shadow-lg`).
- Alto fijo de `500px` para garantizar visibilidad sin desplazamiento vertical excesivo.
- Ancho del `91.67%` del contenedor (`w-11/12`) con maxima responsividad.

---

## Georreferenciacion de los puntos

- **Sistema de referencia:** coordenadas geograficas en grados decimales, WGS84 (el que usan OpenStreetMap y Leaflet), con el orden `[latitud, longitud]`.
- **Cobertura:** 21 puntos dentro del Campus Central de la Universidad de Colima, cada uno con nombre, coordenadas y fotografia del deposito (`puntosReciclaje.js` y `public/Depositos/`).
- **Visualizacion:** mapa base de OpenStreetMap (zoom 17, centrado en `[19.249437, -103.698893]`); cada punto es un marcador cuyo popup muestra el nombre y la fotografia.
- **Precision de los datos:** los primeros puntos tienen 6 decimales (aprox. 0.1 m de resolucion) y los demas hasta 15. La resolucion de las cifras no es la exactitud del dato: esta depende del metodo de captura (un GPS de celular suele dar entre 3 y 5 m; un punto marcado sobre imagen satelital, entre 1 y 2 m).
- **Metodo de captura y verificacion:** pendiente de documentar por el autor. El repositorio no registra como se obtuvieron las coordenadas ni como se verificaron en campo; antes de citar este procedimiento en un reporte debe completarse aqui (instrumento o servicio usado, fecha del recorrido y comprobacion contra las fotografias o el mapa base).
