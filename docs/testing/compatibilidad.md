# Prueba de compatibilidad — EcoCampus

## Objetivo

Verificar que la plataforma EcoCampus se visualiza y funciona correctamente en los dispositivos, sistemas operativos y navegadores mas utilizados por el publico objetivo.

---

## Entornos probados

### Dispositivos y sistemas operativos

| Dispositivo | Sistema operativo | Tipo |
| :--- | :--- | :--- |
| Laptop HP / Dell | Windows 11 Pro (22H2) | Escritorio |
| Laptop MacBook Air M2 | macOS Ventura 13.x | Escritorio |
| iPhone 12 | iOS 17.x | Movil |
| Samsung Galaxy A54 | Android 13 | Movil |

### Navegadores

| Navegador | Version | Plataforma |
| :--- | :--- | :--- |
| Google Chrome | 120.x | Windows, Android |
| Mozilla Firefox | 121.x | Windows |
| Safari | 17.x | macOS, iOS |
| Microsoft Edge | 120.x | Windows |

---

## Criterios de aceptacion

Para considerar el entorno compatible, la vista evaluada debe cumplir:

1. Todos los elementos de la interfaz se renderizan correctamente (sin desbordamientos ni elementos solapados).
2. La navegacion entre vistas funciona sin recarga de pagina.
3. La calculadora completa su flujo de 30 preguntas hasta mostrar el resultado.
4. El mapa carga los 21 marcadores y permite interaccion (click en marcador, popup).
5. El diseno responsivo adapta el layout correctamente en pantallas < 768 px.
6. No se presentan errores de consola criticos durante el uso normal.

---

## Resultados

| Entorno | Inicio | Calculadora | Mapa | Comunidad | Guia | Responsivo |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Chrome 120 / Win 11 | OK | OK | OK | OK | OK | OK |
| Firefox 121 / Win 11 | OK | OK | OK | OK | OK | OK |
| Edge 120 / Win 11 | OK | OK | OK | OK | OK | OK |
| Safari 17 / macOS | OK | OK | OK | OK | OK | OK |
| Chrome 120 / Android 13 | OK | OK | OK | OK | OK | OK |
| Safari 17 / iOS 17 | OK | OK | OK | OK | OK | OK |

---

## Problemas encontrados

No se registraron problemas de compatibilidad criticos durante las pruebas. Las diferencias menores de renderizado entre navegadores (espaciado de fuentes, comportamiento del scroll nativo) no afectan la funcionalidad de la plataforma.

---

## Limitaciones

- Las pruebas se realizaron con versiones de navegadores disponibles en octubre de 2024; versiones anteriores no fueron evaluadas.
- No se probaron navegadores minoritarios (Opera, Brave, Samsung Internet).
- La prueba del mapa en Safari/iOS requirio conexion a internet activa para cargar los tiles de OpenStreetMap; el comportamiento offline no fue evaluado.
