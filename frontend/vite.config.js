import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/login': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/register': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/project': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/project/, '/user/project'),
      },
      '/task': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/task/, '/user/task'),
      },
      '/timeline': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/timeline/, '/user/timeline'),
      },
      '/calendar': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/calendar/, '/user/calendar'),
      },
      '/dashboard': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dashboard/, '/user/dashboard'),
      },
    }
  }
})
