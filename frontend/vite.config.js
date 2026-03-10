import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react', 'react-icons'],
          'vendor-charts': ['apexcharts', 'react-apexcharts', 'recharts'],
          'vendor-lib': ['axios', 'i18next', 'sweetalert2', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: true,
    allowedHosts: 'all'
  }
})

