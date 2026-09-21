import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/db';

// Importamos las pantallas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Pestañas principales (Solo Tienda, Carrito y Perfil)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#222',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#ff69b4',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen name="Tienda" component={CatalogScreen} />
      <Tab.Screen name="Carrito" component={CartScreen} />
      <Tab.Screen name="Perfil Camo" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {/* Stack principal que arranca en Registro */}
      <Stack.Navigator initialRouteName="Registro" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Registro" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Una vez entra, carga el menú de pestañas con Tienda, Carrito y Perfil */}
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}