import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // No retries in development — failures should be investigated immediately
  retries: 0,
  // Run tests in sequence to avoid dev-server contention with a single worker
  workers: 1,
  // Fail the suite as soon as one test fails during development
  forbidOnly: !!process.env.CI,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the Vite dev server automatically before running any test
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/ecocampus/',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
