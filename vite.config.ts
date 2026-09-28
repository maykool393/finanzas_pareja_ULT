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
        // Pantalla de carga de la app instalada: --surface-page claro.
        background_color: '#F8FAFC',
        // --surface-header, la cabecera de la app, igual en ambos modos. El
        // manifiesto no puede cambiar con la pantalla ni el tema; una vez
        // cargada la app, manda el <meta> (useThemeColor).
        theme_color: '#0F172A',
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
