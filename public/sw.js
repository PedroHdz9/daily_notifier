// sw.js - Service Worker vacío pero necesario para notificaciones en PWA nativa

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  // Aquí se manejarían notificaciones push de un servidor backend si lo hubiese
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Al hacer clic, intenta abrir y enfocar la app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then( windowClients => {
        // Enfoque la primera pestaña que encuentre de nuestra app
        for (var i = 0; i < windowClients.length; i++) {
            var client = windowClients[i];
            if (client.url.indexOf(self.registration.scope) !== -1 && 'focus' in client) {
                return client.focus();
            }
        }
        // Si no hay ninguna abierta, abre una nueva (solo a veces permitido en móvil)
        if (clients.openWindow) {
            return clients.openWindow('/');
        }
    })
  );
});
