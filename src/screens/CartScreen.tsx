import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import db from '../database/db';

export default function CartScreen({ route, navigation }: any) {
  const [cartItems, setCartItems] = useState<any[]>([
    { id: '1', name: 'Bapesta All Star Pink Camo', price: 450000, quantity: 1 }
  ]);

  const saveOrderOffline = (item: any) => {
    try {
      db.runSync(
        'INSERT INTO offline_orders (product_id, quantity, synced) VALUES (?, ?, ?);',
        [item.id, item.quantity, 0]
      );
      Alert.alert('Modo Offline', 'Pedido guardado localmente en SQLite con éxito.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el pedido offline en SQLite.');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>★ CARRITO DE COMPRAS ★</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>$ {item.price.toLocaleString()} COP</Text>
            </View>
            <Text style={styles.itemQty}>Cant: {item.quantity}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: $ {calculateTotal().toLocaleString()} COP</Text>
        
        <TouchableOpacity 
          style={styles.checkoutButton} 
          onPress={() => cartItems.forEach(item => saveOrderOffline(item))}
        >
          <Text style={styles.checkoutButtonText}>CONFIRMAR PEDIDO (OFFLINE)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#ff69b4',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  cartItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  itemName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemPrice: {
    color: '#ff69b4',
    fontSize: 14,
    marginTop: 4,
  },
  itemQty: {
    color: '#888',
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 15,
  },
  totalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
});