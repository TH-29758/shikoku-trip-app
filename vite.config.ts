import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Browser QA writes Chrome profiles here; their locked cache files cannot be watched.
  server: { watch: { ignored: ['**/.qa/**'] } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // アプリがオフラインでも動くようにする設定
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      // スマホにインストールした時の見た目・アイコンの設定
      manifest: {
        name: '四国旅行 2026',
        short_name: '四国旅行',
        description: '10人用の四国旅行しおりアプリ',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        lang: 'ja',
        start_url: '/',
        scope: '/',
        display: 'standalone', // アプリっぽく全画面で開く設定
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
