const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Base de datos simulada en memoria (puedes adaptarla según los datos que envíe tu app)
let serverUsers = [];
let serverOrders = [];

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.json({ message: "API Backend de Bapesta funcionando correctamente (SENA ADSO)" });
});

// 1. Endpoint para sincronizar usuarios creados offline
app.post('/api/users/sync', (req, res) => {
  try {
    const { users } = req.body; // Recibe un arreglo de usuarios desde la app móvil
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ error: "Formato de usuarios inválido" });
    }

    users.forEach(localUser => {
      const existe = serverUsers.find(u => u.email === localUser.email);
      if (!existe) {
        serverUsers.push(localUser);
        console.log(`Usuario sincronizado desde offline: ${localUser.email}`);
      }
    });

    res.json({ success: true, message: "Usuarios sincronizados con éxito", total: serverUsers.length });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor al sincronizar usuarios" });
  }
});

// 2. Endpoint para sincronizar pedidos/compras hechas offline
app.post('/api/orders/sync', (req, res) => {
  try {
    const { orders } = req.body; // Recibe los pedidos pendientes

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ error: "Formato de pedidos inválido" });
    }

    orders.forEach(order => {
      serverOrders.push(order);
      console.log(`Pedido sincronizado del usuario: ${order.user_email} - Total: ${order.total}`);
    });

    res.json({ success: true, message: "Pedidos sincronizados con éxito", totalOrders: serverOrders.length });
  } catch (error) {
    res.status(500).json({ error: "Error interno al sincronizar pedidos" });
  }
});

// Iniciar servidor en el puerto 4000
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});