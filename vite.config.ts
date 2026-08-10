import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // アプリがオフラインでも動くようにする設定
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      // スマホにインストールした時の見た目・アイコンの設定
      manifest: {
        name: '四国周遊クエスト',
        short_name: '四国旅',
        description: '10人用の四国旅行しおりアプリ',
        theme_color: '#0f172a', // Tailwindのslate-900と同じ色
        background_color: '#0f172a',
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