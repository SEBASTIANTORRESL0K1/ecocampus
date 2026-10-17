import { defineConfig, devices } from '@playwright/test';

// Las pruebas de compatibilidad corren en todos los proyectos; el E2E completo de la
// calculadora (calculadora.spec.js) solo en chromium para no multiplicar su duracion.
const SOLO_COMPATIBILIDAD = /compatibilidad\.spec\.js/;

export default defineConfig({
  testDir: './e2e',
  // No retries in development — failures should be investigated immediately
  retries: 0,
  // Run tests in sequence to avoid dev-server contention with a single worker
  workers: 1,
  // Fail the suite as soon as one test fails during development
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['json', { outputFile: 'test-results/compatibilidad.json' }]],

  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: SOLO_COMPATIBILIDAD },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: SOLO_COMPATIBILIDAD },
    { name: 'movil-android-chrome', use: { ...devices['Pixel 7'] }, testMatch: SOLO_COMPATIBILIDAD },
    { name: 'movil-ios-safari', use: { ...devices['iPhone 14'] }, testMatch: SOLO_COMPATIBILIDAD },
  ],

  // Servidor propio en el puerto 5174 (no reutiliza el 5173 de desarrollo para que las variables de entorno siempre apliquen).
  // Sin login ni cuestionario: las pruebas miden la calculadora y las vistas, no el experimento.
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174/ecocampus/',
    reuseExistingServer: false,
    timeout: 60000,
    env: { VITE_API_URL: '', VITE_EXPERIMENTO_ACTIVO: 'false' },
  },
});
