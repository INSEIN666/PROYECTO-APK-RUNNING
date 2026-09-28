import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, Modal, SafeAreaView, Platform, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { initDatabase, openDatabase } from './src/database/db';
import RegisterScreen from './src/screens/RegisterScreen';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
  } as any),
});

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation, route }: any) {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60');
  const [menuVisible, setMenuVisible] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Invitado');
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      const connected = state.isConnected;
      setIsConnected(connected);

      if (connected) {
        try {
          const db = await openDatabase();
          const pendingOrders: any = await db.getAllAsync('SELECT * FROM orders WHERE synced = 0;');
          
          if (pendingOrders.length > 0) {
            await db.runAsync('UPDATE orders SET synced = 1 WHERE synced = 0;');
            
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "🔄 Sincronización Automática",
                subtitle: "Red recuperada con éxito",
                body: `Se han sincronizado ${pendingOrders.length} pedido(s) pendientes automáticamente.`,
              },
              trigger: null,
            });
          }
        } catch (error) {
          console.log('Error en sincronización automática en segundo plano:', error);
        }
      }
    });

    Notifications.requestPermissionsAsync();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (route.params?.loggedInEmail) {
      setIsLoggedIn(true);
      const nameFromEmail = route.params.loggedInEmail.split('@')[0];
      setUsername(nameFromEmail);
    }
  }, [route.params]);

  useEffect(() => {
    initDatabase()
      .then(() => setDbInitialized(true))
      .catch((err) => console.log('Error DB:', err));
  }, []);

  // Función mejorada para elegir galería o cámara
  const handlePickImage = async (useCamera: boolean = false) => {
    setMenuVisible(false);

    let permissionResult;
    if (useCamera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la cámara o tus fotos.');
      return;
    }

    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleProfilePress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Sesión Requerida', 
        'Debes iniciar sesión para gestionar tu perfil y cambiar la foto.',
        [
          { text: 'Ir a Iniciar Sesión', onPress: () => navigation.navigate('Register', { isLogin: true }) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }
    setMenuVisible(true);
  };

  const handleConnectDatabase = async () => {
    try {
      const db = await openDatabase();
      const result = await db.getAllAsync('SELECT * FROM orders;');
      Alert.alert(
        'Base de Datos SQLite Conectada ⚡',
        `Almacenamiento local operativo.\nRegistros guardados localmente: ${result.length}`
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Conexión', 'No se pudo conectar a la base de datos SQLite local.');
    }
  };

  const products = [
    {
      id: '1',
      name: 'Bapesta Low "Pink Camo"',
      price: '$280.000',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0YzLZSvHQdlUjB4aLDioQ7M7s8sSZZHxUG3u_3uU02w&s=10',
    },
    {
      id: '2',
      name: 'Bapesta "Black & White"',
      price: '$295.000',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP4jmyGbilfCfR0DGiU9UvBNBaVyoeX5KQIMAV7OEOZQ&s=10',
    },
    {
      id: '3',
      name: 'Bapesta Mid "Triple White"',
      price: '$310.000',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO77usvuGwVbw7VRpIxHKyqJe4nJ244os_YFyglmXIeA&s=10',
    },
    {
      id: '4',
      name: 'Bapesta logo varsity jacket',
      price: '$310.000',
      image: 'https://i.ebayimg.com/images/g/XocAAOSwmVJnGhcV/s-l400.jpg',
    },
  ];

  const themeStyles = {
    safeArea: { backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f4f6' },
    container: { backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f4f6' },
    textColor: { color: isDarkMode ? '#ffffff' : '#111111' },
    subTextColor: { color: isDarkMode ? '#888888' : '#666666' },
    cardBg: { backgroundColor: isDarkMode ? '#141414' : '#ffffff', borderColor: isDarkMode ? '#262626' : '#e0e0e0' },
    bannerBg: { backgroundColor: isDarkMode ? '#161616' : '#ffffff', borderColor: isDarkMode ? '#333' : '#ddd' },
  };

  return (
    <SafeAreaView style={[styles.safeArea, themeStyles.safeArea]}>
      <ScrollView style={[styles.container, themeStyles.container]}>
        
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              ⚠️ Modo Offline Activo - Sincronización automática pausada
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            <View>
              <Text style={[styles.welcomeText, themeStyles.textColor]}>{username}</Text>
              <Text style={styles.subText}>{isLoggedIn ? 'Toca para gestionar' : 'Invitado'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.authButtonsContainer}>
            <TouchableOpacity 
              style={styles.themeToggleButton}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Text style={{ fontSize: 13 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            {!isLoggedIn ? (
              <>
                <TouchableOpacity 
                  style={styles.authButtonOutline}
                  onPress={() => navigation.navigate('Register', { isLogin: true })}
                >
                  <Text style={styles.authButtonOutlineText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.authButtonFilled}
                  onPress={() => navigation.navigate('Register', { isLogin: false })}
                >
                  <Text style={styles.authButtonFilledText}>Registro</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.authButtonOutline}
                onPress={() => {
                  setIsLoggedIn(false);
                  setUsername('Invitado');
                }}
              >
                <Text style={styles.authButtonOutlineText}>Salir</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.cartIconButton}
              onPress={() => navigation.navigate('Cart', { isDarkMode })}
            >
              <Text style={styles.cartIconText}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.banner, themeStyles.bannerBg]}>
          <Text style={styles.bannerTitle}>EDICIÓN LIMITADA ABC CAMO</Text>
          <Text style={[styles.bannerSubtitle, themeStyles.subTextColor]}>Sincronización Automática + Notificaciones + SQLite</Text>
        </View>

        <TouchableOpacity style={styles.dbButton} onPress={handleConnectDatabase}>
          <Text style={styles.dbButtonText}>
            {dbInitialized ? '🟢 Base de Datos SQLite Lista' : '🟡 Inicializando Base de Datos...'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, themeStyles.textColor]}>Nuevos Lanzamientos</Text>

        <View style={styles.gridContainer}>
          {products.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, themeStyles.cardBg]}
              onPress={() => navigation.navigate('ProductDetail', { product: item, isDarkMode })}
            >
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={[styles.productName, themeStyles.textColor]} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>

              <TouchableOpacity 
                style={styles.buyButton}
                onPress={() => navigation.navigate('ProductDetail', { product: item, isDarkMode })}
              >
                <Text style={styles.buyButtonText}>Comprar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal para elegir Cámara o Galería */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Opciones de Perfil</Text>
              <Text style={styles.modalSubtitle}>Elige una opción para actualizar tu foto</Text>

              <TouchableOpacity style={styles.modalButtonPrimary} onPress={() => handlePickImage(true)}>
                <Text style={styles.modalButtonPrimaryText}>📷 Tomar Foto con la Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButtonPrimary} onPress={() => handlePickImage(false)}>
                <Text style={styles.modalButtonPrimaryText}>🖼️ Seleccionar de la Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalButtonDanger} 
                onPress={() => {
                  setMenuVisible(false);
                  setIsLoggedIn(false);
                  setUsername('Invitado');
                  Alert.alert('Sesión Cerrada', 'Has cerrado sesión correctamente.');
                }}
              >
                <Text style={styles.modalButtonDangerText}>Cerrar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setMenuVisible(false)}>
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductDetailScreen({ route }: any) {
  const { product, isDarkMode } = route.params;

  const handleOfflineOrder = async () => {
    try {
      const db = await openDatabase();
      await db.runAsync(
        'INSERT INTO orders (user_email, total, items, image, synced) VALUES (?, ?, ?, ?, ?)',
        ['nico777@sena.edu.co', product.price, product.name, product.image, 0]
      );
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📦 Pedido Guardado Offline",
          body: `Tu pedido de ${product.name} se guardó en SQLite local y se sincronizará automáticamente al tener red.`,
        },
        trigger: null,
      });

      Alert.alert('¡Guardado Local!', 'Pedido guardado en SQLite. Se sincronizará automáticamente cuando recupere la conexión.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar el pedido localmente.');
    }
  };

  const bgStyle = { backgroundColor: isDarkMode ? '#0b0b0b' : '#ffffff' };
  const textStyle = { color: isDarkMode ? '#ffffff' : '#111111' };

  return (
    <ScrollView style={[styles.detailContainer, bgStyle]}>
      <Image source={{ uri: product.image }} style={styles.detailImage} />
      <View style={styles.detailContent}>
        <Text style={[styles.detailName, textStyle]}>{product.name}</Text>
        <Text style={[styles.detailPrice]}>{product.price}</Text>
        
        <Text style={styles.detailSectionTitle}>Descripción del Producto:</Text>
        <Text style={styles.detailDescription}>
          Prenda oficial exclusiva de la colección Bapesta ABC Camo. Estética urbana de alta gama con soporte offline completo, sincronización en segundo plano y notificaciones inteligentes.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleOfflineOrder}>
          <Text style={styles.primaryButtonText}>Ordenar (Guardar en SQLite Offline)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function CartScreen({ route }: any) {
  const isDarkMode = route.params?.isDarkMode ?? true;
  const [orders, setOrders] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const db = await openDatabase();
      const result = await db.getAllAsync('SELECT * FROM orders;');
      setOrders(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSyncOrders = async () => {
    if (!isConnected) {
      Alert.alert('Sin Conexión', 'No se pudo sincronizar por lo que no está conectado a una red.');
      return;
    }

    try {
      const db = await openDatabase();
      await db.runAsync('UPDATE orders SET synced = 1 WHERE synced = 0;');
      Alert.alert('Sincronización Exitosa 🔄', 'Los pedidos locales se han sincronizado correctamente.');
      loadOrders();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron sincronizar los datos.');
    }
  };

  const handleClearDatabase = async () => {
    Alert.alert(
      'Vaciar Base de Datos',
      '¿Deseas eliminar todos los pedidos guardados localmente en SQLite?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await openDatabase();
              await db.runAsync('DELETE FROM orders;');
              setOrders([]);
              Alert.alert('Base de Datos Vacía 🗑️', 'Los registros locales fueron eliminados.');
            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const filteredOrders = orders.filter(item => {
    if (activeTab === 'pending') return item.synced === 0;
    return item.synced === 1;
  });

  const cartBg = { backgroundColor: isDarkMode ? '#0b0b0b' : '#f4f4f6' };
  const textStyle = { color: isDarkMode ? '#ffffff' : '#111111' };

  return (
    <View style={[styles.cartContainer, cartBg]}>
      <View style={[styles.netBadge, { backgroundColor: isConnected ? '#12261e' : '#261218' }]}>
        <Text style={{ color: isConnected ? '#00ffcc' : '#ff69b4', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
          {isConnected ? '🟢 Red Activa: Sincronización automática lista' : '🔴 Sin Red: Almacenando de forma local'}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'pending' && styles.activeTabButton]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pendientes ({orders.filter(i => i.synced === 0).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Historial ({orders.filter(i => i.synced === 1).length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={[styles.cartTitle, textStyle]}>
          {activeTab === 'pending' ? 'Pedidos por Sincronizar' : 'Historial de Compras'}
        </Text>
        
        <View style={{ flexDirection: 'row' }}>
          {activeTab === 'pending' && (
            <TouchableOpacity 
              style={{ 
                backgroundColor: isConnected ? '#162620' : '#1a1a1a', 
                borderWidth: 1, 
                borderColor: isConnected ? '#00ffcc' : '#555', 
                padding: 6, 
                borderRadius: 6, 
                marginRight: 6 
              }} 
              onPress={handleSyncOrders}
            >
              <Text style={{ color: isConnected ? '#00ffcc' : '#888', fontSize: 11, fontWeight: 'bold' }}>
                {isConnected ? '🔄 Forzar Sinc.' : '🚫 Sin Red'}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={{ backgroundColor: '#261218', borderWidth: 1, borderColor: '#ff69b4', padding: 6, borderRadius: 6 }} 
            onPress={handleClearDatabase}
          >
            <Text style={{ color: '#ff69b4', fontSize: 11, fontWeight: 'bold' }}>🗑️ Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>
            {activeTab === 'pending' ? 'No hay pedidos pendientes por sincronizar.' : 'No hay historial de compras sincronizadas.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item: any, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.orderCard, { backgroundColor: isDarkMode ? '#141414' : '#ffffff', borderColor: isDarkMode ? '#333' : '#ddd' }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.orderThumbnail} />
              ) : (
                <View style={[styles.orderThumbnail, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                  <Text style={{ fontSize: 10, color: '#fff' }}>Sin foto</Text>
                </View>
              )}
              
              <View style={styles.orderDetails}>
                <Text style={[styles.orderItemName, textStyle]} numberOfLines={1}>{item.items}</Text>
                <Text style={styles.orderPrice}>{item.total}</Text>
                <Text style={{ color: isDarkMode ? '#888' : '#666', fontSize: 10, marginBottom: 2 }}>{item.user_email}</Text>
                <Text style={{ color: item.synced === 1 ? '#00ffcc' : '#ffcc00', fontSize: 11, fontWeight: '600' }}>
                  {item.synced === 1 ? '🟢 Sincronizado' : '🟡 Pendiente local'}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0b0b' },
          headerTintColor: '#ff69b4',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Gestión de Cuenta' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalles del Producto' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrito / Pedidos Offline' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
  },
  offlineBanner: {
    backgroundColor: '#ffcc00',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 6,
    alignItems: 'center',
  },
  offlineText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ff69b4',
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  subText: {
    color: '#888888',
    fontSize: 10,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleButton: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#333',
    padding: 6,
    borderRadius: 8,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonOutline: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff69b4',
    marginRight: 4,
  },
  authButtonOutlineText: {
    color: '#ff69b4',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authButtonFilled: {
    backgroundColor: '#ff69b4',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginRight: 4,
  },
  authButtonFilledText: {
    color: '#0b0b0b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartIconButton: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#ff69b4',
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconText: {
    fontSize: 14,
  },
  banner: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  bannerTitle: {
    color: '#ff69b4',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#aaaaaa',
    fontSize: 12,
  },
  dbButton: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#ff69b4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  dbButtonText: {
    color: '#ff69b4',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  card: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
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
    fontSize: 14,
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
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  detailImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  detailContent: {
    padding: 20,
  },
  detailName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detailPrice: {
    color: '#ff69b4',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailSectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detailDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#ff69b4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cartContainer: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    padding: 16,
  },
  netBadge: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#161616',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#ff69b4',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#0b0b0b',
  },
  cartTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  orderThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
  },
  orderItemName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderPrice: {
    color: '#ff69b4',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#ff69b4',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonPrimary: {
    width: '100%',
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonPrimaryText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalButtonDanger: {
    width: '100%',
    backgroundColor: '#261218',
    borderWidth: 1,
    borderColor: '#ff69b4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonDangerText: {
    color: '#ff69b4',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalButtonCancel: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: '#888888',
    fontSize: 14,
  },
});