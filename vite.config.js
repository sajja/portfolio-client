import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network devices
    port: 5173,
    proxy: {
      '/api/cse/details': {
        target: 'https://www.cse.lk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cse\/details/, '/api/getAnnouncementById'),
        secure: true,
        headers: {
          'Origin': 'https://www.cse.lk'
        }
      },
      '/api/cse': {
        target: 'https://www.cse.lk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cse/, '/api/smd'),
        secure: true,
        headers: {
          'Origin': 'https://www.cse.lk'
        }
      }
    }
  }
})
