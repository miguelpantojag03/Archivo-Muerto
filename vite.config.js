import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: false,   // si 5173 está ocupado, sube al siguiente disponible
    open: true,          // abre el browser automáticamente al correr npm run dev
  },
})
