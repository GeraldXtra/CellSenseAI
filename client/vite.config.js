// Vite config for the client: the React plugin, the base path, the dev port and the proxy that sends /api to the server. Owner: Gerald.
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function basePath(value) {
  const trimmed = (value || '').trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: basePath(env.VITE_BASE_PATH),
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
