import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  Alert 
} from 'react-native';
import { CartModal, ProfileModal, SettingsModal, AuthModal } from './components/Modals';
import { initDatabase, openDatabase } from './src/database/db';
const { width } = Dimensions.get('window');

export default function App() {
  // Estados de sesión
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Lista de usuarios registrados (almacenados en SQLite)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Estado del Carrito y Modales
  const [cart, setCart] = useState<any[]>([]);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);

  // ==========================================
  // CONFIGURACIÓN E INICIALIZACIÓN DE SQLITE OFFLINE
  // ==========================================
  useEffect(() => {
    const setupDB = async () => {
      await initDatabase();
      await loadUsersFromDB();
    };
    setupDB();
  }, []);

  // Cargar usuarios desde la base de datos local SQLite
  const loadUsersFromDB = async () => {
    try {
      const db = await openDatabase();
      const allUsers: any = await db.getAllAsync('SELECT * FROM users');
      
      // Si la tabla está vacía, insertamos un usuario por defecto
      if (allUsers.length === 0) {
        await db.runAsync(
          'INSERT INTO users (name, email, password, synced) VALUES (?, ?, ?, ?)',
          ['nico777', 'nico777@sena.com', '123456', 1]
        );
        setRegisteredUsers([{ name: 'nico777', email: 'nico777@sena.com', password: '123456' }]);
      } else {
        setRegisteredUsers(allUsers);
      }
    } catch (error) {
      console.error("Error cargando usuarios de SQLite:", error);
    }
  };

  // Función para registrar un nuevo usuario offline en SQLite
  const handleRegisterUser = async (newUser: any) => {
    try {
      const db = await openDatabase();
      
      // Verificar si el correo ya existe localmente
      const existing: any = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?', 
        [newUser.email.toLowerCase().trim()]
      );

      if (existing) {
        Alert.alert("Error", "Este correo ya está registrado localmente.");
        return false;
      }

      // Guardar en SQLite (synced = 0 para indicar que está pendiente de sincronizar con la API)
      await db.runAsync(
        'INSERT INTO users (name, email, password, synced) VALUES (?, ?, ?, ?)',
        [newUser.name, newUser.email.toLowerCase().trim(), newUser.password, 0]
      );

      await loadUsersFromDB();
      Alert.alert("¡Éxito (Offline)!", "Cuenta guardada en SQLite correctamente.");
      return true;
    } catch (error) {
      console.error("Error al registrar en SQLite:", error);
      Alert.alert("Error", "No se pudo guardar el usuario en la base de datos local.");
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserAvatar(null);
    setUserName("");
    setUserEmail("");
    setIsProfileVisible(false);
  };

  const handleAuthSuccess = (name: string, email: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserEmail(email);
    setIsAuthVisible(false);
  };

  // Guardar pedido localmente en SQLite (para futura sincronización offline)
  const saveOrderOffline = async (totalAmount: string, itemsList: any[]) => {
    try {
      const db = await openDatabase();
      await db.runAsync(
        'INSERT INTO orders (user_email, total, items, synced) VALUES (?, ?, ?, ?)',
        [userEmail, totalAmount, JSON.stringify(itemsList), 0]
      );
    } catch (error) {
      console.error("Error al guardar pedido en SQLite:", error);
    }
  };

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    Alert.alert("¡Añadido!", `${product.name} se agregó al carrito 🛒`);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const products = [
    {
      id: '1',
      name: 'Bapesta Low "Pink Camo"',
      price: '$280.000',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Bapesta "Black & White"',
      price: '$295.000',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Bapesta Mid "Triple White"',
      price: '$310.000',
      image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BARRA SUPERIOR */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (!isLoggedIn) {
              setIsAuthVisible(true);
            } else {
              setIsProfileVisible(true);
            }
          }} 
          style={styles.avatarButton}
        >
          <Image 
            source={{ 
              uri: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' 
            }} 
            style={styles.avatarImage} 
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>B A P E S T A</Text>

        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={() => setIsCartVisible(true)} style={styles.iconButton}>
            <Text style={styles.iconSymbol}>🛒</Text>
            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.iconButton}>
            <Text style={styles.iconSymbol}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            {isLoggedIn ? `Bienvenido, ${userName}` : "Bienvenido, Invitado"}
          </Text>
          <Text style={styles.subtitleText}>
            {isLoggedIn ? "Modo Offline Activo (SQLite)" : "Inicia sesión para ver todo el contenido"}
          </Text>

          {!isLoggedIn && (
            <TouchableOpacity 
              style={styles.loginPromptButton} 
              onPress={() => setIsAuthVisible(true)}
            >
              <Text style={styles.loginPromptText}>Iniciar Sesión / Registrarse</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Banner destacado */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>EDICIÓN LIMITADA ABC CAMO</Text>
          <Text style={styles.bannerSubtitle}>Almacenamiento SQLite sincronizable</Text>
        </View>

        {/* Cuadrícula de Productos */}
        <Text style={styles.sectionTitle}>Nuevos Lanzamientos</Text>
        <View style={styles.productsGrid}>
          {products.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
              <TouchableOpacity 
                style={styles.buyButton} 
                onPress={() => addToCart(item)}
              >
                <Text style={styles.buyButtonText}>Comprar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* MODALES */}
      <ProfileModal 
        visible={isProfileVisible}
        userAvatar={userAvatar}
        setUserAvatar={setUserAvatar}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onClose={() => setIsProfileVisible(false)}
      />

      <CartModal 
        visible={isCartVisible}
        cart={cart}
        onRemove={removeFromCart}
        onCheckout={async () => {
          // Calcular total y guardar pedido en SQLite offline
          const totalCalc = cart.reduce((sum, item) => {
            const clean = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + clean;
          }, 0);
          
          await saveOrderOffline(totalCalc.toString(), cart);

          Alert.alert("¡Pedido Procesado (Offline)!", "Guardado localmente en SQLite pendiente de sincronización.");
          setCart([]);
          setIsCartVisible(false);
        }}
        onClose={() => setIsCartVisible(false)}
      />

      <SettingsModal 
        visible={isSettingsVisible}
        theme="dark"
        setTheme={() => {}}
        onClose={() => setIsSettingsVisible(false)}
      />

      <AuthModal 
        visible={isAuthVisible}
        registeredUsers={registeredUsers}
        onRegister={handleRegisterUser}
        onLoginSuccess={handleAuthSuccess}
        onClose={() => setIsAuthVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 105, 180, 0.2)',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ff69b4',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTitle: {
    color: '#ff69b4',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    position: 'relative',
  },
  iconSymbol: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff69b4',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#0b0b0b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginBottom: 16,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 8,
  },
  loginPromptButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  loginPromptText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bannerContainer: {
    backgroundColor: 'rgba(255, 105, 180, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ff69b444',
  },
  bannerTitle: {
    color: '#ff69b4',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#cccccc',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: '#ff69b4',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
});