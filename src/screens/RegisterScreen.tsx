import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleRegister = () => {
    if (name === '' || email === '' || phone === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    // Demo register - in real app, call API
    const user = { name, email, phone };
    login(user);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Create your Rice Mall account</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xlarge,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.fonts.size.title,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.card,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.card,
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    padding: theme.spacing.large,
  },
  inputContainer: {
    marginBottom: theme.spacing.large,
  },
  input: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    ...theme.shadows.card,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  registerButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
  },
});

export default RegisterScreen;