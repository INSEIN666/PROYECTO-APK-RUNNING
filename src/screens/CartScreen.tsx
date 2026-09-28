import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openDatabase } from '../database/db'; // Asegúrate de que la ruta de tu BD sea correcta

export default function CartScreen({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNetworkActive, setIsNetworkActive] = useState<boolean>(true); // Simulador o estado de red

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  // Cargar pedidos desde SQLite según la pestaña seleccionada
  const loadOrders = async () => {
    try {
      setLoading(true);
      const db = await openDatabase();
      
      // Si activeTab es 'pending', buscamos synced = 0, sino historial (synced = 1 u otros)
      const queryFilter = activeTab === 'pending' ? 0 : 1;
      
      const result: any = await db.getAllAsync(
        'SELECT * FROM orders WHERE synced = ? ORDER BY id DESC;',
        [queryFilter]
      );
      
      setOrders(result);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos de la base de datos local.');
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar la sincronización manual
  const handleSyncOrders = async () => {
    try {
      setLoading(true);
      const db = await openDatabase();
      
      // Ejemplo de simulación de sincronización pasando synced a 1
      await db.runAsync('UPDATE orders SET synced = 1 WHERE synced = 0;');
      
      Alert.alert('Sincronización', '¡Los pedidos pendientes han sido sincronizados con éxito!');
      loadOrders();
    } catch (error) {
      console.error('Error al sincronizar:', error);
      Alert.alert('Error', 'Hubo un problema al sincronizar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar o eliminar registros
  const handleClearDatabase = () => {
    Alert.alert(
      'Confirmar limpieza',
      '¿Estás seguro de que deseas limpiar los registros de esta vista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await openDatabase();
              const targetSync = activeTab === 'pending' ? 0 : 1;
              await db.runAsync('DELETE FROM orders WHERE synced = ?;', [targetSync]);
              loadOrders();
              Alert.alert('Completado', 'Registros eliminados correctamente.');
            } catch (error) {
              console.error('Error al limpiar base de datos:', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <Text style={[styles.orderStatus, { color: item.synced === 1 ? '#00ffcc' : '#ffcc00' }]}>
          {item.synced === 1 ? 'Sincronizado' : 'Pendiente'}
        </Text>
      </View>
      <Text style={styles.orderText}>Cliente: {item.client_name || 'General'}</Text>
      <Text style={styles.orderText}>Total: ${item.total || 0}</Text>
      <Text style={styles.orderDate}>Fecha: {item.date || 'Reciente'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón de retroceso y Título superior */}
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ff69b4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrito / Pedidos Offline</Text>
      </View>

      {/* Indicador de Red */}
      <View style={styles.networkBanner}>
        <View style={[styles.networkDot, { backgroundColor: isNetworkActive ? '#00ffcc' : '#ff4444' }]} />
        <Text style={styles.networkText}>
          {isNetworkActive ? 'Red Activa: Sincronización automática lista' : 'Sin Red: Modo Offline activado'}
        </Text>
      </View>

      {/* Pestañas: Pendientes / Historial */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'pending' && styles.activeTabPending]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabTextPending]}>
            Pendientes ({activeTab === 'pending' ? orders.length : '...'})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabHistory]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabTextHistory]}>
            Historial ({activeTab === 'history' ? orders.length : '...'})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN CORREGIDA: Título y botones distribuidos correctamente sin encimarse */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'pending' ? 'Pedidos por Sincronizar' : 'Historial de Pedidos Sincronizados'}
        </Text>
        
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={handleSyncOrders}
          >
            <Text style={styles.syncButtonText}>🔄 Forzar Sinc.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearDatabase}
          >
            <Text style={styles.clearButtonText}>🗑️ Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado de Pedidos */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff69b4" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === 'pending' 
                ? 'No hay pedidos pendientes por sincronizar.' 
                : 'No hay registros en el historial.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
  },
  headerTitle: {
    color: '#ff69b4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162620',
    borderWidth: 1,
    borderColor: '#00ffcc33',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkText: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabPending: {
    backgroundColor: '#ff69b4',
  },
  activeTabHistory: {
    backgroundColor: '#333',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 13,
  },
  activeTabTextPending: {
    color: '#000',
  },
  activeTabTextHistory: {
    color: '#fff',
  },
  actionSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  syncButton: {
    flex: 1,
    backgroundColor: '#162620',
    borderWidth: 1,
    borderColor: '#00ffcc',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#261218',
    borderWidth: 1,
    borderColor: '#ff69b4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ff69b4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
  },
  orderDate: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 13,
  },
});