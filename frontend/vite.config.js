import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Local Spring Boot fallback. Prefer VITE_API_PROXY_TARGET in .env.development. */
const DEFAULT_API_PROXY = 'http://3.105.160.225'

export default defineConfig(({ mode }) => {
  // process.cwd() is the package root when running npm scripts from frontend/
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || DEFAULT_API_PROXY

  return {
    plugins: [react({ fastRefresh: false }), tailwindcss()],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
