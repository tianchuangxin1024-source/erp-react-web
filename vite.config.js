import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.ERP_API_TARGET || 'http://39.106.106.98:8080'
  const upstream = new URL(target)

  if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.pathname !== '/' || upstream.search || upstream.hash) {
    throw new Error('ERP_API_TARGET 必须是 http(s)://主机:端口，不包含路径或凭据')
  }

  const proxy = {
    '/api': {
      target: upstream.origin,
      changeOrigin: true,
      configure(server) {
        server.on('proxyReq', (proxyRequest, incoming) => {
          if (!incoming.headers.origin) return
          try {
            const origin = new URL(incoming.headers.origin)
            // Only rewrite a browser request from this Vite origin.
            if (origin.host === incoming.headers.host) {
              proxyRequest.setHeader('Origin', upstream.origin)
            }
          } catch {
            // Keep malformed or foreign origins for backend validation.
          }
        })
      },
    },
  }

  return {
    plugins: [react()],
    server: { host: '127.0.0.1', proxy },
    preview: { host: '127.0.0.1', proxy },
  }
})
