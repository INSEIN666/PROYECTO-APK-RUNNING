import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { openDatabase } from '../database/db'; // Asegúrate de que la ruta sea correcta

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const userEmail = 'nico777@sena.edu.co'; // Puedes dinamizar esto si guardas el correo en sesión

  // Estadísticas locales de SQLite
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    syncedOrders: 0,
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const db = await openDatabase();
      const allOrders: any = await db.getAllAsync(
        'SELECT * FROM orders WHERE user_email = ?;',
        [userEmail]
      );

      const total = allOrders.length;
      const pending = allOrders.filter((o: any) => o.synced === 0).length;
      const synced = allOrders.filter((o: any) => o.synced === 1).length;

      setStats({
        totalOrders: total,
        pendingOrders: pending,
        syncedOrders: synced,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas del usuario:', error);
    }
  };

  // Función para abrir la galería y seleccionar foto
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar la imagen de la galería.');
    }
  };

  // Función para tomar una foto con la cámara
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Se requieren permisos para usar la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo capturar la foto.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>★ PERFIL CAMO ★</Text>

      <View style={styles.avatarContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>Sin Foto</Text>
          </View>
        )}
      </View>

      <Text style={styles.userName}>Nicolás Ortiz</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
      <Text style={styles.userRole}>ADSO - SENA (Estudiante)</Text>

      {/* NUEVO MÓDULO: Panel de Estadísticas SQLite */}
      <View style={styles.statsCard}>
        <Text style={styles.statsCardTitle}>📊 Resumen de Actividad Local</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Registros</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#ffcc00' }]}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#00ffcc' }]}>{stats.syncedOrders}</Text>
            <Text style={styles.statLabel}>Sincronizados</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>📷 Tomar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={pickImage}>
          <Text style={styles.buttonSecondaryText}>🖼️ Elegir de Galería</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    color: '#ff69b4',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 2,
  },
  avatarContainer: {
    marginBottom: 15,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ff69b4',
    overflow: 'hidden',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  placeholderAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 13,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userEmail: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 3,
  },
  userRole: {
    color: '#ff69b4',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 20,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#161616',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  statsCardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#262626',
  },
  statNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#ff69b4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff69b4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#ff69b4',
    fontWeight: 'bold',
    fontSize: 15,
  },
});