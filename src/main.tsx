import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
// Fuentes alojadas en el proyecto (no Google Fonts): la PWA las precachea y
// funcionan sin conexión. Solo el subconjunto latino y los pesos en uso.
import '@fontsource/ubuntu/latin-300.css'
import '@fontsource/ubuntu/latin-400.css'
import '@fontsource/ubuntu/latin-500.css'
import '@fontsource/ubuntu/latin-700.css'
import '@fontsource/ubuntu-mono/latin-400.css'
import './styles/global.css'

// Al abrir la app después de un despliegue, el service worker anterior sirve
// la versión vieja mientras instala la nueva. Registrado así (no con el
// script inyectado por defecto), recarga la página apenas la nueva se
// activa. Sin esto, la primera carga tras cada despliegue mostraba la
// versión anterior, con los assets que ya no existen en el servidor rotos.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
