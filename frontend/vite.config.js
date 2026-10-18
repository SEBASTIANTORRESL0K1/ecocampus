import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/ecocampus/',
  // Con el codigo montado desde Windows en Docker no llegan eventos de archivos: se usa polling.
  server: { watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/ecocampus/',
      },
    },
    globals: true,
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    env: {
      BASE_URL: '/ecocampus/',
    },
  },
})
