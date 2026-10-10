import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',    // rutas relativas: necesario para que el build cargue bajo file:// (Tauri empaquetado)
  server: {
    port: 5173,
    strictPort: true,   // Tauri apunta a este puerto fijo (devUrl); no debe cambiar si está ocupado
    open: false,         // la ventana de Tauri es la que muestra la app, no un tab de navegador
  },
  test: {
    environment: 'jsdom',
  },
})
