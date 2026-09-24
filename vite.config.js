import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' is critical for GitHub Pages subpath hosting
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
})
