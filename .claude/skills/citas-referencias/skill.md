---
name: citas-referencias
description: Analiza un documento .md (tesis, reporte, capítulo académico) para auditar sus citas APA en español. Genera 3 listas en un archivo .md descargable — (1) referencias bibliográficas con conteo de cuántas veces se citan cada una por apellido, (2) citas en el texto que no tienen referencia correspondiente en la bibliografía, y (3) referencias en la bibliografía que nunca fueron citadas en el texto. Úsala siempre que el usuario pida auditar, revisar, contar o cruzar citas contra referencias/bibliografía en un documento .md, incluso si no menciona el nombre de la skill — por ejemplo "cuántas veces cito a X", "qué referencias no uso", "qué citas me faltan en la bibliografía", "revisa mis citas del capítulo 3".
---

# Auditoría de citas y referencias (documentos .md en español, estilo APA)

## Qué hace

Corre un script en Python (`scripts/analizar_citas.py`) sobre un archivo `.md` y genera un
reporte con tres listas:

1. **Referencias con conteo de citas** — cada entrada de la bibliografía con el número de veces
   que aparece citada en el cuerpo del texto (agrupado por apellido + año).
2. **Citas sin referencia** — citas parentéticas `(Apellido, año)` o narrativas `Apellido (año)`
   en el texto que no tienen una entrada correspondiente en la bibliografía. Cada una se marca
   `[parentética]` o `[narrativa]` según cómo se detectó.
3. **Referencias sin cita** — entradas de la bibliografía que nunca aparecen citadas en el texto
   (contando ambos estilos de cita).

El cruce es **heurístico** (basado en expresiones regulares sobre apellido + año), no un parser
APA completo. Siempre revisa manualmente las secciones 2 y 3 del reporte antes de usarlas para
corregir un documento — pueden aparecer falsos positivos por variantes de escritura, apellidos
compuestos, o autores institucionales.

## Cómo usarla

1. Confirma con el usuario la ruta del `.md` a analizar (si no la da, pregunta o usa el archivo
   más reciente/obvio del proyecto) y, si el documento usa un encabezado distinto a
   "Referencias" para la bibliografía (ej. "Bibliografía", "Fuentes consultadas"), pídelo o
   detéctalo leyendo el documento primero.
2. Copia el `.md` de origen a un directorio de trabajo si viene de una ubicación de solo lectura
   (ej. `/mnt/project/`, `/mnt/user-data/uploads/`) — el script solo necesita leerlo, no lo
   modifica.
3. Ejecuta:
   ```bash
   python3 scripts/analizar_citas.py <ruta_al_md> --out /mnt/user-data/outputs/reporte_citas.md
   ```
   Si el encabezado de la bibliografía no es "Referencias", agrega
   `--ref-heading "<texto exacto del encabezado>"`.
4. Abre el reporte generado (`view`) y revisa rápidamente:
   - ¿Hay citas en la lista 2 que en realidad SÍ tienen referencia pero con apellido mal escrito
     o año distinto? Repórtaselo al usuario como posible error de la tesis, no del script.
   - ¿Hay autores institucionales (ej. "UNAM", "IPCC", "WWF") mezclados con apellidos de
     personas? Es normal, el script los trata igual.
5. Presenta el archivo de salida al usuario con `present_files` y resume en 2-3 líneas los
   hallazgos más relevantes (ej. "tienes N citas sin referencia, la más repetida es X").

## Notas sobre el formato que reconoce

- Citas parentéticas: `(Apellido, 2020)`, `(Apellido & Apellido2, 2020)`, `(Apellido y Apellido2,
  2020)`, `(Apellido et al., 2020)`, múltiples citas separadas por `;` dentro del mismo paréntesis.
- Citas narrativas: `Apellido (2020)`, `Apellido y Apellido2 (2020)`, `Apellido et al. (2020)`,
  con o sin "Según"/"De acuerdo con..." antes — se detectan buscando un nombre propio pegado a un
  paréntesis que contiene SOLO el año (si el paréntesis trae más que el año, se trata como
  parentética, no como narrativa). Admite apellidos compuestos de hasta 2 palabras (ej. "López
  Álvarez", "Ching Ruíz"); autores institucionales de 3+ palabras (ej. "Global Footprint Network")
  pueden capturarse incompletos (ej. "Footprint Network") — es un falso positivo cosmético, revisa
  manualmente si el conteo de esa referencia no cuadra.
- **No detecta** citas sin ningún paréntesis (ej. "Apellido 2020" a secas, sin `()`).
- Referencias: lista numerada (`1. `, `2. `, ...) donde cada entrada empieza con
  `Apellido(s), Iniciales. (año).`
- Referencias sin año (`s.f.`) se soportan y se marcan como tal.

## Casos límite a tener en cuenta

- Si el script no encuentra el encabezado de referencias, prueba con `--ref-heading` usando el
  texto exacto (sin negritas ni numeración) tal como aparece en el `.md`.
- **Encabezados exportados de Google Docs/Pandoc con anchor** (ej. `# **Referencias**
  {#referencias}`): el matcher de encabezado exige que la línea termine justo después del texto
  (más asteriscos opcionales), así que el sufijo ` {#referencias}` rompe la coincidencia. Pasa
  `--ref-heading` con el texto completo incluyendo ese sufijo, ej.
  `--ref-heading "Referencias** {#referencias}"`.
- **Imágenes embebidas en base64** al final del documento (ej. `[image1]: <data:image/png;base64,...>`
  pegado justo después de la última referencia numerada, típico de exportes de Google Docs): el
  script las fusiona con la última entrada de la lista si no hay una línea `N. ` que las separe,
  generando una "referencia" falsa gigantesca. Si ves una entrada con `base64` en el reporte,
  avísale al usuario que es un artefacto del documento (probablemente un número de referencia que
  quedó vacío), no una referencia real.
- Documentos muy largos (varios capítulos) funcionan igual siempre que las citas estén en
  formato parentético o narrativo estándar y la bibliografía esté en una sola lista numerada al
  final.
- Si el usuario pide comparar dos versiones del documento (antes/después de correcciones), corre
  el script sobre cada una y compara los reportes en vez de modificar el script.
