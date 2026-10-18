import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Service Worker: registra apenas em produção (build publicado).
// No preview/dev, remove qualquer SW legado para evitar cache de módulos Vite desatualizados.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .catch((err) => console.warn('SW registration failed:', err));
    } else {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .then(() => {
          if (window.caches) {
            window.caches.keys().then((keys) => keys.forEach((k) => window.caches.delete(k)));
          }
        })
        .catch(() => {});
    }
  });
}