# Guia de pruebas — EcoCampus

## Filosofia

Las pruebas del proyecto se organizan en dos niveles:

**Pruebas de componentes (Vitest + React Testing Library)**
- Smoke/render tests: verifican que un componente monta sin lanzar excepciones.
- Pruebas de comportamiento: interactuamos con el DOM mediante roles ARIA (`getByRole`) para reflejar lo que un usuario real ve y accede, incluyendo compatibilidad con lectores de pantalla.

**Pruebas E2E (Playwright)**
- Flujos completos de la calculadora de huella ecologica: desde el paso 1 hasta el resultado final.
- Pruebas de navegacion: avanzar, retroceder, validar encabezados y contadores de progreso.

El objetivo es detectar regresiones visibles para el usuario, no validar detalles de implementacion interna.

---

## Comandos rapidos

```bash
# Ejecutar pruebas de componentes una vez
npm test

# Ejecutar pruebas de componentes en modo watch
npm run test:watch

# Ejecutar pruebas E2E (Playwright)
npm run test:e2e
```

Todos los comandos se ejecutan desde el directorio `frontend/`.

---

## Suites de prueba

### Pruebas de componentes

Ubicacion: colocadas junto a cada componente con el sufijo `.test.jsx`.

Archivos existentes:

| Archivo | Que cubre |
|---------|-----------|
| `frontend/src/App.test.jsx` | Montaje de la aplicacion completa |
| `frontend/src/features/landing/LandingPage.test.jsx` | Contenido y estructura de la pagina de inicio |

### Pruebas E2E

Ubicacion: `frontend/e2e/`, sufijo `.spec.js`.

Archivos existentes:

| Archivo | Que cubre |
|---------|-----------|
| `frontend/e2e/calculadora.spec.js` | Navegacion, flujos completos y validaciones de la calculadora |

---

## Cuando agregar nuevas pruebas

- **Nueva vista o componente**: agregar un archivo `.test.jsx` colocado junto al componente. Como minimo, un smoke test y pruebas de los elementos ARIA principales.
- **Nuevo flujo de calculadora**: agregar un caso en `frontend/e2e/calculadora.spec.js` usando los helpers existentes.
- **Cambio de navegacion** (rutas, enlaces, botones de navegacion): agregar o actualizar una prueba E2E que verifique la ruta destino.

---

## Documentacion adicional

- [Guia de pruebas de componentes con Vitest](./vitest-guidelines.md)
- [Guia de pruebas E2E con Playwright](./playwright-e2e.md)
