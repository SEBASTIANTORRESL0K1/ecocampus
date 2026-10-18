import { test, expect } from '@playwright/test';

// Compatibilidad contra produccion. Igual que e2e/compatibilidad.spec.js, pero la calculadora esta detras del
// acceso por correo (modo experimento), asi que se entra con un correo de prueba. Entrar solo abre una sesion:
// no se envia el cuestionario, por lo que no se escribe nada en la base de datos de produccion.

const CORREO_PRUEBA = 'prueba-playwright@ucol.mx';

async function entrar(page) {
  await page.goto('/ecocampus/calculadora');
  // Espera a que termine "Verificando sesion": aparece el formulario de correo o ya la calculadora
  const formulario = page.getByRole('heading', { name: 'Ingresa tu correo para participar' });
  await formulario.or(page.getByText(/Pregunta 1 de 31/)).first().waitFor();
  if (await formulario.isVisible()) {
    await page.getByLabel('Correo institucional').fill(CORREO_PRUEBA);
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
}

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

test('acceso: la calculadora pide el correo y rechaza dominios ajenos', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');
  await expect(page.getByRole('heading', { name: 'Ingresa tu correo para participar' })).toBeVisible();
  await page.getByLabel('Correo institucional').fill('alguien@gmail.com');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toContainText('@ucol.mx');
  await expect(page.getByText(/Pregunta 1 de 31/)).toHaveCount(0);
});

test('calculadora: con correo permitido muestra la pregunta 1 y avanza', async ({ page }) => {
  await entrar(page);
  await expect(page.getByText(/Pregunta 1 de 31/)).toBeVisible();
  await page.getByRole('button', { name: '1 a 2 raciones a la semana' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText(/Pregunta 2 de 31/)).toBeVisible();
});

test('mapa: renderiza el mapa, los 21 marcadores y abre un popup tocable', async ({ page }) => {
  await page.goto('/ecocampus/mapa');
  await expect(page.getByRole('heading', { name: 'Mapa de Reciclaje' })).toBeVisible();
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
  await entrar(page);
  for (const ruta of ['/ecocampus/', '/ecocampus/calculadora', '/ecocampus/mapa']) {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(desborda, `desbordamiento horizontal en ${ruta}`).toBe(false);
  }
});

test('API: /api/me responde con el modo de acceso y sin sesion no se puede guardar', async ({ request }) => {
  const me = await request.get('/api/me');
  expect(me.status()).toBe(200);
  const cuerpo = await me.json();
  expect(['saml', 'correo']).toContain(cuerpo.modoAcceso);
  expect(cuerpo.authenticated).toBe(false);
  const envio = await request.post('/api/respuestas', { data: {} });
  expect(envio.status()).toBe(401);
});
