import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'; // Added Compression

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // COMPRESSION: Gzips your files for smaller downloads
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React separate (it rarely changes)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Keep Firebase separate (it's huge)
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // REMOVED 'ui-vendor' to let Vite merge small icon libraries into main chunk for fewer requests
        },
      },
    },
  },
})