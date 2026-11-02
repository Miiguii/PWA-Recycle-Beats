// ESTRUCTURA BACKEND (Node.js / Express)

const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configurar las llaves VAPID ()
const publicVapidKey = 'TU_LLAVE_PUBLICA_AQUI';
const privateVapidKey = 'TU_LLAVE_PRIVADA_AQUI';

webpush.setVapidDetails(
  'mailto:tu-correo@ejemplo.com',
  publicVapidKey,
  privateVapidKey
);

// 2. Ruta para guardar la suscripción del cliente
// (En el ejemplo real, esto se guarda en una base de datos SQLite)
let subscriptions = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription); // Guardamos la suscripción
  
  res.status(201).json({});
  
  // Enviamos una notificación de prueba inmediata
  const payload = JSON.stringify({ 
    title: '¡Suscripción exitosa!', 
    body: 'Bienvenido a las notificaciones de Recycle Beats.' 
  });
  
  webpush.sendNotification(subscription, payload).catch(err => console.error(err));
});

// 3. Ruta para enviar una notificación a todos
app.post('/send-message', (req, res) => {
  const payload = JSON.stringify({ 
    title: req.body.title || 'Nuevo aviso',
    body: req.body.body || 'Entra a ver las novedades de Recycle Beats'
  });

  Promise.all(subscriptions.map(sub => webpush.sendNotification(sub, payload)))
    .then(() => res.status(200).json({ message: 'Notificaciones enviadas' }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Error al enviar notificaciones' });
    });
});

// Iniciar servidor
app.listen(8080, () => console.log('Servidor Backend corriendo en puerto 8080'));