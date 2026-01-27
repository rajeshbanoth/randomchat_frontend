import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This is the new v4 way
  ],
  
  server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'https://randomchat-lfo7.onrender.com',
          //target: 'http://localhost:5000',
        ws: true
      }
    }
  }
})