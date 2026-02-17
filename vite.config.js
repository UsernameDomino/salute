import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  build: {
    // ES2015 target for broad browser support
    target: 'es2015',
  },
  resolve: {
    // Ensure browser conditions are used for Svelte 5
    conditions: ['browser', 'default'],
  },
  test: {
    // Vitest configuration
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    setupFiles: ['./src/test-setup.js'],
  },
})
