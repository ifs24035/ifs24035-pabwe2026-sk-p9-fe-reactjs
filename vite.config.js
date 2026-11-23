import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Izinkan request HTTPS dengan sertifikat self-signed / invalid di environment Node (dev server)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5174
  const rawTarget = env.VITE_API_BASE_URL || 'http://localhost:8081/api'

  let targetOrigin = 'http://localhost:8081'
  try {
    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
      targetOrigin = new URL(rawTarget).origin
    }
  } catch {
    // fallback default
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      proxy: {
        // Reverse proxy /api ke backend Golang Gin (port 8081)
        '/api': {
          target: targetOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx', 'src/setupTests.js', '**/*.test.{js,jsx}'],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }
})
