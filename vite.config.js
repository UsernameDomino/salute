import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Stamps sw.js with a unique build hash so each deploy busts the
 * service worker cache. Runs after the bundle is written to dist/.
 */
function swCacheBust() {
  const hash = Date.now().toString(36)
  return {
    name: 'sw-cache-bust',
    apply: 'build',
    closeBundle() {
      const swPath = path.resolve('dist', 'sw.js')
      if (fs.existsSync(swPath)) {
        const contents = fs.readFileSync(swPath, 'utf-8')
        fs.writeFileSync(swPath, contents.replace(/__BUILD_HASH__/g, hash))
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [svelte(), viteSingleFile(), swCacheBust()],
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
