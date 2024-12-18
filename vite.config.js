import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    // Ensure static files are copied
    assetsDir: 'assets',
    copyPublicDir: true
  },
  server: {
    // Development server configuration
    port: 5173,
    strictPort: true,
    host: true
  },
  preview: {
    // Preview server configuration
    port: 5173,
    strictPort: true,
    host: true
  }
})
