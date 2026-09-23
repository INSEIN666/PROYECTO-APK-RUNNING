import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, Switch } from 'react-native';
import * as Sharing from 'expo-sharing';
import { documentDirectory, getInfoAsync } from 'expo-file-system/legacy';
import { openDatabase } from '../database/db'; // Ajusta la ruta si es necesario

export default function CartScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true); // Interruptor manual de red

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const db = await openDatabase();
      const result = await db.getAllAsync('SELECT * FROM orders;');
      setOrders(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSyncOrders = async () => {
    if (!isOnline) {
      Alert.alert(
        '🚫 Bloqueo Offline', 
        'No es posible sincronizar porque estás desconectado. Tus datos están seguros en SQLite.'
      );
      return; 
    }

    try {
      const db = await openDatabase();
      await db.runAsync('UPDATE orders SET synced = 1 WHERE synced = 0;');
      Alert.alert('Sincronización Exitosa 🔄', 'Los pedidos locales se han actualizado a estado sincronizado en SQLite.');
      loadOrders();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron sincronizar los datos.');
    }
  };

  const handleClearDatabase = async () => {
    Alert.alert(
      'Vaciar Base de Datos',
      '¿Deseas eliminar todos los pedidos guardados localmente en SQLite?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await openDatabase();
              await db.runAsync('DELETE FROM orders;');
              setOrders([]);
              Alert.alert('Base de Datos Vacía 🗑️', 'Los registros locales fueron eliminados de SQLite.');
            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  };

  // Función para exportar la base de datos de SQLite y abrirla en DBeaver
  const exportDatabaseToDBeaver = async () => {
    try {
      const dbUri = `${documentDirectory}SQLite/orders.db`; // Cambia 'orders.db' si tu base de datos tiene otro nombre

      const fileInfo = await getInfoAsync(dbUri);
      if (!fileInfo.exists) {
        Alert.alert('Aviso', 'El archivo de la base de datos todavía no se ha generado o está en otra ruta.');
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dbUri);
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo exportar la base de datos.');
    }
  };

  return (
    <View style={styles.cartContainer}>
      
      {/* Botón exclusivo para exportar a DBeaver */}
      <TouchableOpacity 
        style={{ backgroundColor: '#122026', borderWidth: 1, borderColor: '#00ccff', padding: 10, borderRadius: 8, marginBottom: 15, alignItems: 'center' }} 
        onPress={exportDatabaseToDBeaver}
      >
        <Text style={{ color: '#00ccff', fontSize: 13, fontWeight: 'bold' }}>📤 Exportar DB para DBeaver</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={styles.cartTitle}>Registros ({orders.length})</Text>
        
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={{ backgroundColor: '#162620', borderWidth: 1, borderColor: '#00ffcc', padding: 6, borderRadius: 6, marginRight: 6 }} 
            onPress={handleSyncOrders}
          >
            <Text style={{ color: '#00ffcc', fontSize: 11, fontWeight: 'bold' }}>🔄 Sincronizar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ backgroundColor: '#261218', borderWidth: 1, borderColor: '#ff69b4', padding: 6, borderRadius: 6 }} 
            onPress={handleClearDatabase}
          >
            <Text style={{ color: '#ff69b4', fontSize: 11, fontWeight: 'bold' }}>🗑️ Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interruptor de red manual */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 10, backgroundColor: isOnline ? '#122618' : '#262212', borderRadius: 8, borderWidth: 1, borderColor: isOnline ? '#00ffcc' : '#ffcc00' }}>
        <Text style={{ color: isOnline ? '#00ffcc' : '#ffcc00', fontSize: 12, fontWeight: '600' }}>
          {isOnline ? '🌐 Estado: Conectado (Online)' : '⚠️ Estado: Desconectado (Offline)'}
        </Text>
        <Switch
          trackColor={{ false: '#444', true: '#00ffcc' }}
          thumbColor={isOnline ? '#fff' : '#ffcc00'}
          onValueChange={(value) => setIsOnline(value)}
          value={isOnline}
        />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>No hay pedidos guardados en SQLite.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: any, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderItemName}>📦 {item.items}</Text>
              <Text style={styles.orderPrice}>Total: {item.total}</Text>
              <Text style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>Usuario: {item.user_email}</Text>
              <Text style={{ color: item.synced === 1 ? '#00ffcc' : '#ffcc00', fontSize: 12, fontWeight: '600' }}>
                Estado: {item.synced === 1 ? '🟢 Sincronizado' : '🟡 Pendiente (Local)'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartContainer: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 16,
  },
  cartTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    color: '#888',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderItemName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderPrice: {
    color: '#ff69b4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});