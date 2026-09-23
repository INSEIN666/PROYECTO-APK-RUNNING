import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';

interface AvatarProfileProps {
  uri: string | null;
  loading: boolean;
  size?: number;
}

export const AvatarProfile: React.FC<AvatarProfileProps> = ({
  uri,
  loading,
  size = 140,
}) => {
  const containerStyle = [
    styles.avatarContainer,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  if (loading) {
    return (
      <View style={containerStyle}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Sin Foto</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1D1D6',
    width: '100%',
  },
  placeholderText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
});