import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';

export default function ProductDetailScreen({ route, navigation }: any) {
  // Recibimos los datos del producto que se pasaron al hacer clic
  const { product } = route.params;

  const handleBuy = () => {
    Alert.alert('¡Producto agregado!', `Has seleccionado ${product.name}. Se guardará en tu orden offline.`);
    // Aquí puedes integrar la lógica para guardar en la tabla 'orders' de SQLite que ya creamos antes
  };

  return (
    <View style={styles.container}>
      <Image 
        source={typeof product.image === 'string' ? { uri: product.image } : product.image} 
        style={styles.image} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price}</Text>
        
        <Text style={styles.descriptionTitle}>Descripción:</Text>
        <Text style={styles.description}>
          Prenda oficial de la colección exclusiva Bapesta ABC Camo. Estética urbana de alta gama, fabricada con materiales de máxima durabilidad y diseño auténtico.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleBuy}>
          <Text style={styles.buttonText}>Comprar Ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    color: '#ff69b4',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  descriptionTitle: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ff69b4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});