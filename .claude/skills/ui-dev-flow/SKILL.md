---
name: ui-dev-flow
description: Flujo completo de desarrollo de interfaz: Playwright screenshot → taste-skill → design-bridge → implementacion → auditoria → verificacion visual. Usar para cualquier cambio de UI o nueva vista.
metadata:
  author: ecocampus
  version: "1.0.0"
  argument-hint: <vista|componente|descripcion del cambio>
---

# Flujo de Desarrollo de Interfaz — EcoCampus

Ejecutar los pasos en orden. No saltar pasos; cada uno alimenta al siguiente.

---

## Paso 1 — Screenshot inicial (estado actual)

Antes de tocar codigo, capturar el estado actual con Playwright para tener una base de comparacion.

```bash
cd frontend && npx playwright screenshot --browser chromium http://localhost:5173 /tmp/ui-before.png
```

Si el servidor no esta corriendo, iniciarlo primero:

```bash
cd frontend && npm run dev
```

Guardar la ruta del screenshot para el Paso 6.

---

## Paso 2 — Elegir taste-skill

**Preguntar siempre al usuario** cual taste-skill aplicar para esta iteracion. Presentar las opciones disponibles y esperar confirmacion antes de continuar:

- `taste-skill` (design-taste-frontend) — gusto general de frontend
- `soft-skill` (high-end-visual-design) — diseno visual de alto nivel
- `stitch-skill` (stitch-design-taste) — consistencia de sistema de diseno
- `redesign-skill` (redesign-existing-projects) — rediseno de vistas existentes
- `brutalist-skill` (industrial-brutalist-ui) — estetica brutalista/industrial
- `minimalist-skill` (minimalist-ui) — interfaz minimalista

Una vez confirmada, invocarla con el `Skill` tool antes de continuar.

---

## Paso 3 — Crear o actualizar DESIGN.md

Con el taste-skill activo, crear (o actualizar) un archivo `DESIGN.md` en la raiz del proyecto que describa:

- Paleta de colores, tipografia, espaciado
- Estilo visual objetivo para la vista/componente en cuestion
- Referencia al mockup o imagen de entrada si existe

Si la tarea viene con una imagen de referencia adjunta en el chat, analizarla aqui y volcar los hallazgos en `DESIGN.md` antes de continuar.

---

## Paso 4 — design-bridge: DESIGN.md → instrucciones de componente

Invocar el agente `voltagent-core-dev:design-bridge` pasandole:

1. El archivo `DESIGN.md` generado en el paso anterior
2. La vista o componente objetivo (del argumento de la skill o confirmado con el usuario)
3. La documentacion de vista correspondiente en `docs/` (ver tabla en CLAUDE.md)

El agente produce instrucciones precisas de implementacion que replican el look definido.

---

## Paso 5 — Implementacion con frontend-developer

Invocar el agente `voltagent-core-dev:frontend-developer` con las instrucciones del paso anterior.

Restricciones a siempre incluir en el brief:
- Framework: React + Vite 8
- Estilos: CSS modules o clases existentes en el proyecto; no introducir nuevas librerias de estilos sin confirmar
- Accesibilidad: semantica HTML correcta, atributos aria donde corresponda
- Leer el archivo `docs/vista_N_nombre.md` correspondiente antes de modificar la vista

---

## Paso 6 — Auditoria web-design-guidelines

Con los archivos modificados identificados, invocar el skill `web-design-guidelines` sobre ellos:

```
/web-design-guidelines <archivos modificados>
```

Resolver cada finding antes de continuar al paso siguiente. Los findings se reportan en formato `file:line`.

---

## Paso 7 — Verificacion visual con Playwright

Tomar un nuevo screenshot del estado post-implementacion:

```bash
cd frontend && npx playwright screenshot --browser chromium http://localhost:5173 /tmp/ui-after.png
```

Comparar visualmente `ui-before.png` vs `ui-after.png`:

1. Usar el browser pane (`preview_start`) para mostrar ambas imagenes
2. Identificar diferencias entre las dos capturas
3. Validar que los cambios corresponden a lo especificado en `DESIGN.md`

Si hay regresiones visuales visibles (algo que funcionaba antes ya no se ve correctamente), volver al Paso 5 con una descripcion especifica del problema.

---

## Paso 8 — Sugerencias por imagen (iteracion)

Si el resultado visual no satisface al usuario o hay diferencias con el diseno esperado:

1. El usuario puede pegar una imagen de referencia en el chat
2. Claude analiza la imagen contra el screenshot actual (`ui-after.png`)
3. Se genera una lista de ajustes especificos (colores, espaciados, tipografia, layout)
4. Volver al Paso 3 con esos ajustes incorporados en `DESIGN.md`

---

## Resumen rapido

| Paso | Herramienta | Entrada | Salida |
|------|-------------|---------|--------|
| 1 | Playwright CLI | URL local | `ui-before.png` |
| 2 | Skill tool | Opciones de taste | Taste-skill activo |
| 3 | taste-skill + Claude | Descripcion / imagen | `DESIGN.md` |
| 4 | design-bridge | `DESIGN.md` + docs vista | Instrucciones de componente |
| 5 | frontend-developer | Instrucciones | Codigo React modificado |
| 6 | web-design-guidelines | Archivos modificados | Lista de findings |
| 7 | Playwright CLI | URL local | `ui-after.png` + comparacion |
| 8 | Claude + imagen usuario | Imagen referencia + `ui-after.png` | Lista de ajustes → iterar |

---

## Notas

- Siempre leer `docs/vista_N_nombre.md` antes de modificar una vista (regla de CLAUDE.md).
- No omitir el Paso 6 aunque los cambios parezcan menores; la auditoria detecta problemas de accesibilidad y semantica.
- Los screenshots de Playwright se guardan en `/tmp/`; no commitear esos archivos.
- Si Playwright no esta instalado: `cd frontend && npx playwright install chromium`.
