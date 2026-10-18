import { test, expect } from '@playwright/test';

// Pruebas de compatibilidad: corren en cada proyecto de playwright.config.js (navegador/dispositivo).
// Cada prueba anota navegador, version, plataforma y user agent para el reporte.

test.beforeEach(async ({ page, browser }, testInfo) => {
  await page.goto('/ecocampus/');
  const entorno = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    plataforma: navigator.platform,
    tactil: navigator.maxTouchPoints > 0,
    ventana: `${window.innerWidth}x${window.innerHeight}`,
  }));
  testInfo.annotations.push({
    type: 'entorno',
    description: JSON.stringify({
      proyecto: testInfo.project.name,
      navegador: `${browser.browserType().name()} ${browser.version()}`,
      ...entorno,
    }),
  });
});

test('inicio: carga el titulo y el boton de la calculadora', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Calcula tu huella ecológica/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Comenzar cálculo' })).toBeVisible();
});

test('calculadora: muestra la pregunta 1 y avanza al responder', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');
  await expect(page.getByText(/Pregunta 1 de 31/)).toBeVisible();
  await page.getByRole('button', { name: '1 a 2 raciones a la semana' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText(/Pregunta 2 de 31/)).toBeVisible();
});

test('mapa: renderiza el mapa, los 21 marcadores y abre un popup tocable', async ({ page }) => {
  await page.goto('/ecocampus/mapa');
  await expect(page.getByRole('heading', { name: 'Mapa de Puntos de Reciclaje' })).toBeVisible();
  const marcadores = page.locator('.leaflet-marker-icon');
  await expect(marcadores).toHaveCount(21);
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({ timeout: 15000 });
  await marcadores.first().click();
  await expect(page.locator('.leaflet-popup-content h2')).toBeVisible();
  await expect(page.locator('.leaflet-popup-content img')).toBeVisible();
});

test('comunidad: carga el encabezado', async ({ page }) => {
  await page.goto('/ecocampus/comunidad');
  await expect(page.getByRole('heading', { name: 'Comunidad EcoCampus' })).toBeVisible();
});

test('guia de reciclaje: carga el encabezado', async ({ page }) => {
  await page.goto('/ecocampus/guia-reciclaje');
  await expect(page.getByRole('heading', { name: 'Guía de Reciclaje' })).toBeVisible();
});

test('sin desbordamiento horizontal en las vistas principales', async ({ page }) => {
  for (const ruta of ['/ecocampus/', '/ecocampus/calculadora', '/ecocampus/mapa']) {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(desborda, `desbordamiento horizontal en ${ruta}`).toBe(false);
  }
});
