import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HeaderProps {
  isLoggedIn: boolean;
  cartCount: number;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  isLoggedIn,
  cartCount,
  onOpenProfile,
  onOpenAuth,
  onOpenCart,
  onOpenSettings,
}: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftHeaderActions}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={isLoggedIn ? onOpenProfile : onOpenAuth}
        >
          <Text style={styles.iconText}>👤</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>BAPESTA</Text>

      <View style={styles.rightHeaderActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenCart}>
          <Text style={styles.iconText}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings}>
          <Text style={styles.iconText}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    paddingBottom: 10,
  },
  leftHeaderActions: { flexDirection: 'row', alignItems: 'center' },
  rightHeaderActions: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    color: '#ff69b4',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161616',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: '#ff69b455',
  },
  iconText: { fontSize: 16 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff69b4',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
});