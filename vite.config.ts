import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Twoney',
        short_name: 'Twoney',
        description: 'Cuentas, deudas e inversiones compartidas en pareja.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        // Igual al <meta name="theme-color"> claro de index.html (--surface-card).
        // El manifiesto no puede cambiar con el tema; en la app manda el <meta>.
        theme_color: '#FAFAFA',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Límite por defecto (2 MiB): los fondos pasaron a WebP (≈100 KB) y ya
        // no hace falta subirlo. Si un archivo lo supera, el build avisa.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff2}'],
        // email-logo.png solo lo usa el correo de confirmación (vía CDN);
        // testicon-* no los usa la app.
        globIgnores: ['**/email-logo.png', '**/icons/testicon-*', '**/icons/testapple-*'],
      },
    }),
  ],
})
