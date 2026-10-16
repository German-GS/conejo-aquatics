import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Producción vive en conejo-motors.web.app/ac/admin (subcarpeta dentro
// del hosting de Conejo Motors — /ac quedó para el sitio público de
// Aquatics) — en dev sigue sirviendo desde la raíz, así que solo se
// activa con `vite build` (no con `vite dev`).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ac/admin/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}))
