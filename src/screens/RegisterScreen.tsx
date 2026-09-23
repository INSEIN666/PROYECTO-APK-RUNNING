import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';

export default function RegisterScreen({ route, navigation }: any) {
  // Recibimos el parámetro 'isLogin' enviado desde HomeScreen (por defecto falso)
  const isLogin = route.params?.isLogin ?? false;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Si es registro, validamos también nombre y apellido
    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert('Error', 'Por favor ingresa tu nombre y apellido.');
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    if (isLogin) {
      Alert.alert('Éxito', `Sesión iniciada con: ${email}`);
    } else {
      Alert.alert('Éxito', `Cuenta creada para ${firstName} ${lastName} (${email})`);
    }

    // Retornamos al Home pasando el correo electrónico para actualizar la sesión
    navigation.navigate({
      name: 'Home',
      params: { loggedInEmail: email },
      merge: true,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#0b0b0b' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Botón superior para regresar */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Gestión de Cuenta</Text>
        </TouchableOpacity>

        {/* Título dinámico según si es login o registro */}
        <Text style={styles.title}>
          {isLogin ? '★ INICIAR SESIÓN ★' : '★ NUEVO REGISTRO ★'}
        </Text>

        {/* Campos de Nombre y Apellido solo aparecen en Registro */}
        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#666"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor="#666"
              value={lastName}
              onChangeText={setLastName}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {isLogin ? 'Ingresar' : 'Registrarse'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#0b0b0b',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#141414',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
  },
  backButtonText: {
    color: '#ff69b4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    color: '#ff69b4',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: 1,
    marginTop: 40,
  },
  input: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 8,
    padding: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ff69b4',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0b0b0b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});