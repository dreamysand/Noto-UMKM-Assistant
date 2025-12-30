import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/*.png'],
      manifest: {
        short_name: "Noto",
        name: "Noto UMKM Assistant App",
        icons: [
          { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
        ],
        start_url: ".",
        display: "standalone",
        background_color: "#1E3A8A",
        theme_color: "#2563EB"
      }
    })
  ],
})
