import { openDatabase } from '../database/db';

// URL de tu backend usando la puerta de enlace de red compartida por USB
const API_URL = 'http://172.20.10.1:4000'; 

export const sincronizarDatosConServidor = async () => {
  try {
    const db = await openDatabase();

    // 1. Sincronizar Usuarios Pendientes (synced = 0)
    const usuariosPendientes: any = await db.getAllAsync('SELECT * FROM users WHERE synced = 0;');
    
    if (usuariosPendientes.length > 0) {
      console.log(`Enviando ${usuariosPendientes.length} usuarios al backend...`);
      
      const responseUser = await fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: usuariosPendientes }),
      });

      const resultUser = await responseUser.json();

      if (resultUser.success) {
        for (const user of usuariosPendientes) {
          await db.runAsync('UPDATE users SET synced = 1 WHERE id = ?;', [user.id]);
        }
        console.log('¡Usuarios sincronizados y actualizados localmente!');
      }
    }

    // 2. Sincronizar Pedidos Pendientes (synced = 0)
    const pedidosPendientes: any = await db.getAllAsync('SELECT * FROM orders WHERE synced = 0;');

    if (pedidosPendientes.length > 0) {
      console.log(`Enviando ${pedidosPendientes.length} pedidos al backend...`);

      const responseOrder = await fetch(`${API_URL}/api/orders/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: pedidosPendientes }),
      });

      const resultOrder = await responseOrder.json();

      if (resultOrder.success) {
        for (const order of pedidosPendientes) {
          await db.runAsync('UPDATE orders SET synced = 1 WHERE id = ?;', [order.id]);
        }
        console.log('¡Pedidos sincronizados y actualizados localmente!');
      }
    }

    if (usuariosPendientes.length === 0 && pedidosPendientes.length === 0) {
      return { success: true, message: 'Todo ya está sincronizado con el servidor.' };
    }

    return { success: true, message: '¡Sincronización completada con éxito!' };

  } catch (error) {
    console.error('Error durante el proceso de sincronización:', error);
    return { success: false, error: 'No se pudo conectar con el servidor (¿Está encendido el backend en la PC?).' };
  }
};