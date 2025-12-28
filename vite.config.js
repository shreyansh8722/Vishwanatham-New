import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
  // OPTIMIZATION: Faster builds & smoother production
  build: {
    outDir: "dist",
    sourcemap: false, // Saves space
    chunkSizeWarningLimit: 1000, 
    minify: 'terser', // Better minification
    terserOptions: {
      compress: {
        drop_console: true, // Removes console.log in production (HUGE speedup for mobile)
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          'ui-libs': ['react-zoom-pan-pinch', 'react-swipeable', 'lucide-react'], // Group UI libs
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
})