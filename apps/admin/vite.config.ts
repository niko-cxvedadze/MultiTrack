import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const envDir = command === 'serve' ? path.resolve(__dirname, '../../') : __dirname

  const env = loadEnv(mode, envDir, '')

  const cacheDir = path.resolve(
    __dirname,
    'node_modules/.vite',
    Buffer.from(__dirname).toString('base64url')
  )

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    envDir,
    cacheDir,
    server: {
      port: parseInt(env.VITE_PORT || '5174'),
      strictPort: false
    }
  }
})
