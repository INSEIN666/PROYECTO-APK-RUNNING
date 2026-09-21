import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';

// Datos de ejemplo para la tienda virtual (puedes adaptarlo a zapatillas o ropa urbana)
const PRODUCTS = [
  { id: '1', name: 'Bapesta All Star Pink Camo', price: 450000, stock: 5 },
  { id: '2', name: 'Bapesta Classic White', price: 420000, stock: 8 },
  { id: '3', name: 'Hoodie Bapesta Shark', price: 320000, stock: 3 },
];

export default function CatalogScreen({ navigation }: any) {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    alert(`¡${product.name} agregado al carrito!`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>★ BAPESTA STORE ★</Text>
        <Text style={styles.subtitle}>Catálogo de Productos</Text>
      </View>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>$ {item.price.toLocaleString()} COP</Text>
              <Text style={styles.productStock}>Stock disponible: {item.stock}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Text style={styles.addButtonText}>COMPRAR</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ff69b4',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ff69b4',
  },
  productInfo: {
    marginBottom: 10,
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    color: '#ff69b4',
    fontSize: 15,
    marginTop: 4,
  },
  productStock: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});