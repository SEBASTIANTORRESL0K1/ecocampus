import { defineConfig, devices } from '@playwright/test';

// Pruebas contra el sitio desplegado (Lightsail). No levanta servidor propio.
//   URL_PRODUCCION=http://3.143.203.113 npx playwright test -c playwright.produccion.config.js
// Procedimiento y resultados: docs/testing/produccion/README.md
const SOLO_RED = /red\.spec\.js/;

export default defineConfig({
  testDir: './e2e-produccion',
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: '../docs/testing/produccion/resultados/compatibilidad.json' }]],
  use: {
    baseURL: process.env.URL_PRODUCCION || 'http://3.143.203.113',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: SOLO_RED },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: SOLO_RED },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: SOLO_RED },
    { name: 'movil-android-chrome', use: { ...devices['Pixel 7'] }, testIgnore: SOLO_RED },
    { name: 'movil-ios-safari', use: { ...devices['iPhone 14'] }, testIgnore: SOLO_RED },
    { name: 'red', use: { ...devices['Desktop Chrome'] }, testMatch: SOLO_RED },
  ],
});
