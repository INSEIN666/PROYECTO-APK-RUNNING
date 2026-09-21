import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerResult } from '../types/profile';

export const useImagePicker = (): ImagePickerResult => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetImage = () => setUri(null);

  const pickFromGallery = async () => {
    try {
      setError(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert(
          'Permiso denegado',
          'Se requieren permisos para acceder a la biblioteca de imágenes.'
        );
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUri(result.assets[0].uri);
      }
    } catch (err) {
      const msg = 'Ocurrió un error al cargar la imagen desde la galería.';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setError(null);
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso denegado',
          'Se requieren permisos para hacer uso de la cámara.'
        );
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUri(result.assets[0].uri);
      }
    } catch (err) {
      const msg = 'Ocurrió un error al capturar la fotografía.';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    uri,
    loading,
    error,
    pickFromGallery,
    takePhoto,
    resetImage,
  };
};