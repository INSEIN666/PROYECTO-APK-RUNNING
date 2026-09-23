import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// ==========================================
// 1. MODAL DE PERFIL Y GALERÍA
// ==========================================
export function ProfileModal({ visible, userAvatar, setUserAvatar, userName, userEmail, onLogout, onClose }: any) {
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUserAvatar(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Mi Perfil</Text>
          
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainerModal}>
            <Image 
              source={{ uri: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' }} 
              style={styles.modalAvatarImage} 
            />
            <Text style={styles.changePhotoText}>Cambiar foto de galería</Text>
          </TouchableOpacity>

          <Text style={styles.userInfoText}>Usuario: {userName}</Text>
          <Text style={styles.userInfoText}>Correo: {userEmail}</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 2. MODAL DEL CARRITO
// ==========================================
export function CartModal({ visible, cart, onRemove, onCheckout, onClose }: any) {
  
  const calculateTotal = () => {
    return cart.reduce((sum: number, item: any) => {
      const cleanPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + cleanPrice;
    }, 0);
  };

  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(calculateTotal());

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tu Carrito 🛒</Text>

          {cart.length === 0 ? (
            <Text style={styles.emptyCartText}>El carrito está vacío</Text>
          ) : (
            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
              {cart.map((item: any, index: number) => (
                <View key={`${item.id}-${index}`} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{item.price}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {cart.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValue}>{formattedTotal}</Text>
            </View>
          )}

          {cart.length > 0 && (
            <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
              <Text style={styles.checkoutButtonText}>Finalizar Pedido</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 3. MODAL DE AUTENTICACIÓN (Multiusuario Dinámico)
// ==========================================
export function AuthModal({ visible, registeredUsers, onRegister, onLoginSuccess, onClose }: any) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!email || !password || (!isLoginMode && !name)) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    if (isLoginMode) {
      // Buscamos si el usuario existe en la lista de registrados
      const usuarioEncontrado = registeredUsers.find(
        (u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!usuarioEncontrado) {
        Alert.alert("Acceso Denegado", "Correo o contraseña incorrectos.");
        return;
      }

      // Si coincide, inicia sesión con el nombre real de ese usuario
      onLoginSuccess(usuarioEncontrado.name, usuarioEncontrado.email);

    } else {
      // Modo Registro: Creamos el usuario nuevo
      if (password.length < 6) {
        Alert.alert("Seguridad", "La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      const creadoExitosamente = onRegister({ name, email: email.trim(), password });
      if (creadoExitosamente) {
        setIsLoginMode(true); // Cambia automáticamente al login para que ingrese
      }
    }

    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Text>

          {!isLoginMode && (
            <TextInput 
              style={styles.input} 
              placeholder="Nombre de usuario" 
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput 
            style={styles.input} 
            placeholder="Correo electrónico" 
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput 
            style={styles.input} 
            placeholder="Contraseña" 
            placeholderTextColor="#888"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {isLoginMode ? 'INGRESAR' : 'REGISTRARSE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsLoginMode(!isLoginMode)} 
            style={{ marginTop: 15, alignItems: 'center' }}
          >
            <Text style={{ color: '#ff69b4', fontSize: 13 }}>
              {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.closeButton, { marginTop: 15 }]} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 4. MODAL DE CONFIGURACIÓN
// ==========================================
export function SettingsModal({ visible, theme, setTheme, onClose }: any) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Configuración ⚙️</Text>
          <Text style={{ color: '#ccc', marginBottom: 20 }}>Versión de la App: 1.0.0 (ADSO)</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// ESTILOS DE LOS MODALES
// ==========================================
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ff69b455',
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#ff69b4',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarContainerModal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ff69b4',
    marginBottom: 8,
  },
  changePhotoText: {
    color: '#ff69b4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfoText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#ccc',
    fontWeight: 'bold',
  },
  emptyCartText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 30,
  },
  cartList: {
    maxHeight: 250,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  cartItemImage: {
    width: 45,
    height: 45,
    borderRadius: 6,
  },
  cartItemName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cartItemPrice: {
    color: '#ff69b4',
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#ff69b4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutButtonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  submitButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  submitButtonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 14,
  },
});