import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Registrar el Service Worker para PWAs y Notificaciones Móviles
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registrado con éxito:', registration.scope);
      },
      (err) => {
        console.log('Fallo al registrar el SW:', err);
      }
    );
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
