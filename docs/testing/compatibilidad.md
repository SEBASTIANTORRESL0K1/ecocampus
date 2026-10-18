# Pruebas de compatibilidad

Pruebas automatizadas de las vistas publicas en varios navegadores y perfiles de dispositivo. Ultima ejecucion: 17 de octubre de 2026, 30 pruebas, 30 correctas, 1 min 30 s.

## Herramienta

Playwright 1.63.0. El archivo es `frontend/e2e/compatibilidad.spec.js` y los perfiles estan en `frontend/playwright.config.js`.

## Navegadores y dispositivos

| Proyecto | Motor y version | Sistema operativo (agente de usuario) | Ventana | Tactil |
| :--- | :--- | :--- | :--- | :--- |
| `chromium` | Chromium 153.0.8010.12 | Windows 10/11 (maquina real: Windows 11) | 1280x720 | No |
| `firefox` | Firefox 155.0 | Windows 10/11 (maquina real: Windows 11) | 1280x720 | No |
| `webkit` | WebKit 26.6 (motor de Safari) | macOS 10.15.7 (emulado por agente de usuario) | 1280x720 | No |
| `movil-android-chrome` | Chromium 153.0.8010.12, perfil Pixel 7 | Android 14 (emulado) | 588x1198 | Si |
| `movil-ios-safari` | WebKit 26.6, perfil iPhone 14 | iOS 16.0 (emulado por agente de usuario) | 390x664 | Emulado |

Todos corren en la misma maquina (AMD Ryzen 5 5500U, Windows 11). La version de cada navegador se registra en cada prueba como anotacion `entorno` y queda en `frontend/test-results/compatibilidad.json`.

## Que se prueba en cada perfil

1. Inicio: aparece el titulo y el boton "Comenzar calculo".
2. Calculadora: se muestra "Pregunta 1 de 31"; al responder y pulsar "Siguiente" avanza a la pregunta 2.
3. Mapa: se renderiza el titulo, los 21 marcadores, al menos un mosaico de OpenStreetMap cargado, y al tocar un marcador se abre el popup con nombre e imagen.
4. Comunidad: carga el encabezado.
5. Guia de reciclaje: carga el encabezado.
6. Sin desbordamiento horizontal (el ancho del documento no excede la ventana) en inicio, calculadora y mapa.

## Hallazgo corregido

La prueba 6 detecto un defecto real en el perfil iPhone 14: el menu de `Navbar` (`ul` con `flex space-x-6`) ocupaba 588 px y excedia los 390 px de la ventana, de modo que "Mapa", "Comunidad" y "Guia de Reciclaje" quedaban cortados y la pagina se desplazaba horizontalmente. Se corrigio en `src/components/layout/Navbar.jsx` permitiendo que la barra y los enlaces pasen a varias lineas (`flex-wrap`, `gap-x`, `gap-y`). Tras la correccion las 30 pruebas pasan.

## Limitaciones

- Los perfiles moviles y Safari son emulaciones: usan el motor real (Chromium o WebKit) con el tamano de pantalla, el agente de usuario y el modo tactil del dispositivo, pero no son dispositivos fisicos. WebKit 26.6 de Playwright no es la aplicacion Safari de Apple.
- Las pruebas corren con `VITE_API_URL` vacio y `VITE_EXPERIMENTO_ACTIVO=false`, es decir, sin el login institucional ni el cuestionario del experimento. Ese flujo se verifico manualmente en el navegador contra el stack Docker, pero no esta automatizado.
- Falta probar en dispositivos fisicos. Registrar en la tabla siguiente cada equipo real usado:

| Dispositivo (modelo) | Sistema operativo y version | Navegador y version | Resultado |
| :--- | :--- | :--- | :--- |
| Pendiente | Pendiente | Pendiente | Pendiente |

## En el CI

El job `compatibilidad` de `.github/workflows/test.yml` corre estas pruebas en cada push o pull request a `main` y `dev`, con Chromium, Firefox y WebKit instalados, y sube `compatibilidad.json` como artefacto (30 dias) con el navegador, la version y el agente de usuario de cada prueba. El job `e2e` corre solo la calculadora en Chromium.

## Como ejecutar

Desde `frontend/`:

```bash
npx playwright install chromium firefox webkit     # solo la primera vez
npx playwright test e2e/compatibilidad.spec.js     # todos los perfiles
npx playwright test e2e/compatibilidad.spec.js --project=movil-ios-safari
```

Playwright inicia su propio servidor de desarrollo en el puerto 5174.
