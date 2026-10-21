import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// Registra o Service Worker do PWA.
// A atualização não é aplicada automaticamente: o aviso "Atualização
// disponível" decide quando trocar de versão, para não interromper trabalho
// em andamento.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .catch((err) => console.warn('Falha ao registrar o service worker:', err));
  });
}