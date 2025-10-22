import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,  // Enable polling for Docker environments
    },
    hmr: {
      host: 'localhost',
      port: 3000,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 