import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Output for easy embedding
    outDir: 'dist',
    // Generate a single JS file for easier embedding
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Base path - update this when deploying
  // For Framer embedding via iframe, you'll host the built files
  // and set base to your hosting URL
  base: './',
})
