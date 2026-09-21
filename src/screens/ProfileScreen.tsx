import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

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
    <View style={styles.container}>
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
      <Text style={styles.userRole}>ADSO - SENA (Estudiante)</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Tomar Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={pickImage}>
          <Text style={styles.buttonSecondaryText}>Elegir de Galería</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#ff69b4',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: 2,
  },
  avatarContainer: {
    marginBottom: 20,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ff69b4',
    overflow: 'hidden',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholderAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userRole: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
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