import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // targetは「/exec」まで含めず、ベースとなるURLにしてみる
        target: 'https://script.google.com/macros/s/AKfycbzuYtZtsZTgTkxvC61FQz9kSk4wYiFrxo1FHC-qLhUtCMq_2H9A6-vDDsl0nFmda48',
        changeOrigin: true,
        secure: false, // HTTPS証明書チェックを回避
        rewrite: (path) => path.replace(/^\/api/, '/exec') // /api を /exec に書き換える
      }
    }
  }
})