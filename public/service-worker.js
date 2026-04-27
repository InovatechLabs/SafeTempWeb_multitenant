self.addEventListener('push', function(event) {
  console.log('[Service Worker] O evento de Push chegou!');

  if (event.data) {
    console.log('[Service Worker] Dados recebidos puros:', event.data.text());
    
    try {
      const data = event.data.json();
      console.log('[Service Worker] JSON parseado com sucesso:', data);

      const options = {
        body: data.body || 'Corpo da notificação não enviado.',
        vibrate: [200, 100, 200, 100, 200],
        icon: '/favicon.ico',
        data: {
          url: data.url || '/'
        }
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'Alerta!', options)
          .then(() => console.log('[Service Worker] showNotification executado com sucesso!'))
          .catch(err => console.error('[Service Worker] Erro no showNotification:', err))
      );
    } catch (e) {
      console.error('[Service Worker] Erro ao dar parse no JSON do Push:', e);
    }
  } else {
    console.log('[Service Worker] Push recebido, mas sem carga de dados (payload).');
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Clicaram na notificação!');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});