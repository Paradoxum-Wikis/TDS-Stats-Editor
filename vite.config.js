import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ranker: resolve(__dirname, 'ranker/index.html'),
        db: resolve(__dirname, 'db/index.html')
      }
    }
  },
})