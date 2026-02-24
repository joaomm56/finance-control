import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'clsx': 'clsx/dist/clsx.mjs'
    }
  },
  build: {
    commonjsOptions: {
      include: [/recharts/, /node_modules/]
    }
  }
})