import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function SyncView() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Escucha en tiempo real si el dispositivo tiene o pierde conexión a la red
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    // Limpia el listener al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Función al presionar el botón de sincronización
  const handleSync = async () => {
    if (!isConnected) {
      Alert.alert(
        "Sin conexión", 
        "No se pudo sincronizar por lo que no está conectado a una red."
      );
      return;
    }

    try {
      // Aquí puedes colocar tu llamada a fetch o axios hacia tu servidor backend local
      // ej: await fetch('http://TU_IP_DE_PC:4000/api/orders/sync', { ... });

      Alert.alert("¡Sincronizado!", "Los datos se han sincronizado con el servidor correctamente.");
    } catch (error) {
      Alert.alert("Error de Servidor", "No se pudo conectar con el servidor backend.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bapesta Store - Sincronización</Text>
        
        {/* Indicador visual de estado de red */}
        <View style={[styles.badge, { backgroundColor: isConnected ? '#d4edda' : '#f8d7da' }]}>
          <Text style={[styles.badgeText, { color: isConnected ? '#155724' : '#721c24' }]}>
            {isConnected ? "🟢 Conectado a la red" : "🔴 Sin conexión (Modo Offline)"}
          </Text>
        </View>

        <Text style={styles.description}>
          {isConnected 
            ? "Tu dispositivo tiene internet. Puedes proceder a sincronizar tus datos locales con el servidor." 
            : "Estás sin conexión. Los datos se guardan localmente en SQLite hasta que detectemos una red."}
        </Text>

        {/* Botón dinámico */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isConnected ? '#000000' : '#6c757d' }]}
          onPress={handleSync}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isConnected ? "Sincronizar con el Servidor" : "No se pudo sincronizar (Sin red)"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});