# WebPageTest: pagina de inicio, escritorio y movil

Resultados de WebPageTest sobre la URL del servidor de produccion, ejecutados por la tesista el 18 de octubre de 2026: la pagina de inicio en escritorio y en movil, una corrida cada uno. El JSON completo de WebPageTest no se guarda en el repositorio (pesa varios MB por las trazas de CPU y de ancho de banda); esta pagina conserva solo lo relevante.

## Condiciones de las pruebas

| Dato | Escritorio | Movil |
| :--- | :--- | :--- |
| Identificador del resultado | `261018_instant_6912bf1d68b749c4a2fb3bb65684e2a2` | `261018_instant_543a02bae4c441e89be3ebf1fa3bdb27` |
| URL | `http://3.143.203.113/ecocampus/` | igual |
| Navegador | Chrome 152 | Chrome 152 |
| Ventana | 1024x681 | 393x659 |
| Corridas | 1 (solo primera visita, sin visita repetida) | igual |
| Version de WebPageTest | 26.09.01 | igual |
| Lighthouse y CrUX en el resultado | No incluidos | No incluidos |

El JSON no informa la ubicacion de la maquina de pruebas ni el nombre del perfil de conexion, y declara una latencia de 2 en ambas pruebas; esos datos no se afirman. Por los tiempos de conexion al servidor (unos 5 ms en escritorio y unos 62 ms en movil) la prueba movil se hizo con una red mas lenta que la de escritorio. Para el reporte conviene anotar la ubicacion y la conexion desde la pagina del resultado en webpagetest.org.

## Metricas

| Metrica | Escritorio | Movil |
| :--- | ---: | ---: |
| Tiempo al primer byte (TTFB) | 37 ms | 143 ms |
| Primer pintado con contenido (FCP) | 858 ms | 1103 ms |
| Pintado de contenido mas grande (LCP) | 1055 ms | 1300 ms |
| Inicio de renderizado | 900 ms | 1100 ms |
| Speed Index | 1384 ms | 1688 ms |
| Tiempo total de bloqueo (TBT) | 0 ms | 0 ms |
| Desplazamiento acumulado de diseno (CLS) | 0 | 0 |
| Carga del documento | 292 ms | 585 ms |
| Carga completa | 1423 ms | 1270 ms |
| Visualmente completa | 1500 ms | 1800 ms |
| Peticiones | 26 | 23 |
| Bytes recibidos | 4,271,989 (4.1 MB) | 543,672 (531 KB) |
| Imagenes descargadas | 3,937,172 B | 163,223 B |
| Violaciones de accesibilidad (axe 4.10.2) | 0 | 0 |

El elemento del LCP es en ambos casos el titulo "Calcula tu huella ecologica" (texto). Las metricas de Core Web Vitals (LCP, CLS y TBT) quedan en el rango bueno en los dos perfiles.

## Calificaciones de WebPageTest

| Criterio | Escritorio | Movil | Comentario |
| :--- | ---: | ---: | :--- |
| Compresion (gzip) | 100 | 100 | HTML, JS y CSS comprimidos |
| Conexiones persistentes (keep-alive) | 100 | 100 | |
| Compresion de imagenes | 93 | 90 | Ahorro posible: 287 KB en escritorio y 17 KB en movil |
| Cache de recursos estaticos | 77 | 74 | Los archivos de `/assets/` ya llevan `Cache-Control: public, immutable` por un ano; los logos, el favicon y el manifest no llevan cache |
| CDN | 33 | 24 | Esperable: el sitio se sirve desde un solo servidor |
| JPEG progresivo | 0 | 0 | |

## De donde viene el peso

La diferencia entre perfiles es grande: 4.1 MB en escritorio contra 531 KB en movil. Casi todo el peso en escritorio son imagenes externas descargadas a su resolucion original.

| Recurso | Origen | Tamano | Escritorio | Movil |
| :--- | :--- | ---: | :--- | :--- |
| `pexels-photo-19507080.jpeg` (3376x6000 px, se muestra a unos 222 px) | Pexels | 2,455,874 B | Descargada | No se descargo |
| `photo-1595278069441-...` (3000x2000 px) | Unsplash | 995,965 B | Descargada | No se descargo |
| `photo-1542601906990-...` (3000x1718 px) | Unsplash | 276,310 B | Descargada | No se descargo |
| `UdC_logo.png` (2428x830 px, se muestra a 129 a 164 px de ancho) | Propio | 126,573 B | Descargada | Descargada |
| `fa-brands-400.woff2` | Font Awesome (CDN) | 116,672 B | Descargada | Descargada |
| `eslogan.png` (2198x653 px, se muestra a 135 a 148 px de ancho) | Propio | 45,800 B | Descargada | Descargada |
| Texto comprimido (JavaScript y CSS, propios y de terceros) | Ambos | unos 185 KB | Descargado | Descargado |

Las fotos de Pexels y Unsplash llevan `loading="lazy"`. En movil, con las tarjetas apiladas, no se descargaron durante la carga (por eso la pagina pesa 531 KB); en escritorio, donde las tarjetas quedan en una fila a la vista, si se descargaron. Aun asi, cuando se descargan lo hacen a 3000 px o mas para mostrarse a unos 222 px (escritorio) o 345 px (movil) de ancho.

## Otros hallazgos

- **Imagen del banner de la universidad bloqueada.** `https://www.ucol.mx/content/portal/banner_733551615849.jpg` devuelve HTML (codigo 468, 3870 bytes) en lugar de una imagen y no se dibuja (`naturalWidth` 0). Ocurre en los dos perfiles y coincide con el fallo visto con Playwright (`ERR_BLOCKED_BY_ORB`).
- **HTTP/1.1 y sin HTTPS.** El servidor propio responde en `http/1.1` y sin TLS; los recursos de terceros llegan por HTTP/2 y HTTP/3.
- **Terceros.** Google Fonts, `fonts.gstatic.com`, `cdnjs.cloudflare.com` (Font Awesome), Pexels, Unsplash, `encrypted-tbn0.gstatic.com` y `ucol.mx`.
- **CSS que posiblemente bloquea el renderizado.** WebPageTest marca cinco hojas de estilo (Google Fonts, Font Awesome y tres propias: Leaflet, el indice y las animaciones); aun asi el primer pintado ocurre a los 858 ms en escritorio y a los 1103 ms en movil.
- **Tiempo del servidor.** En escritorio los archivos propios responden en 4 a 17 ms de TTFB; en movil unos 62 a 66 ms, que equivalen casi por completo al viaje de red. No hay lentitud del lado del servidor.
- **CPU del navegador.** En movil la utilizacion de CPU se mantiene entre 26 % y 95 % durante toda la carga (en escritorio cae a 5 % a partir de 1.6 s), y el tiempo de CPU de la carga completa es de 3739 ms contra 2299 ms en escritorio.

## Comparacion con Lighthouse

WebPageTest aqui no aplico la limitacion de CPU y de red que usa Lighthouse en movil (4G lenta simulada y CPU 4 veces mas lenta), por eso las cifras son mejores:

| Metrica (inicio) | WebPageTest movil | Lighthouse movil (mediana de 3) |
| :--- | ---: | ---: |
| FCP | 1.10 s | 4.00 s |
| LCP | 1.30 s | 4.77 s |
| TBT | 0 ms | 127 ms |
| Peso | 531 KB | 4118 KB |

El peso de Lighthouse es mayor porque su emulacion de pantalla descarga las imagenes que WebPageTest no pidio en movil. Para escritorio las dos herramientas coinciden: LCP de 1.06 s (WebPageTest) contra 1.50 s (Lighthouse) y TBT de 0 ms en ambas.

## Conclusiones

- La pagina de inicio es rapida en los dos perfiles (LCP de 1.06 s en escritorio y de 1.30 s en movil, sin bloqueo ni desplazamientos de diseno); el unico problema grande es el peso de las imagenes externas cuando se descargan.
- Las fotos de Pexels y Unsplash suman 3.4 MB para mostrarse a unos 222 a 345 px. Pedirlas ya redimensionadas (o servirlas desde el proyecto en WebP a unos 600 px) bajaria la pagina de inicio en escritorio de unos 4 MB a menos de 1 MB sin cambiar su aspecto.
- Los logos `UdC_logo.png` y `eslogan.png` se muestran a unos 130 a 165 px de ancho pero pesan 126 KB y 46 KB; se pueden reducir sin perdida visible.

## Pendiente

Una sola corrida por perfil y solo la pagina de inicio. Para igualar el procedimiento de Lighthouse (3 corridas, 3 paginas) falta repetir con 3 corridas y visita repetida, y para `/ecocampus/calculadora` y `/ecocampus/mapa`; la pagina del mapa es la que Lighthouse marca como mas lenta (LCP de 16.8 s en movil). Con los enlaces o metricas de esos resultados se agregan aqui.
