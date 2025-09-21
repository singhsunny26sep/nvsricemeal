import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    // Demo login - in real app, call API
    const user = { name: 'Demo User', email, phone: 'Demo Phone' };
    login(user);
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome back to Rice Mall</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.iconInput}>
            <Icon name="email" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.iconInput}>
            <Icon name="lock" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>
        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.loginButtonContainer, { transform: [{ scale: scaleValue }] }]}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
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
    ...theme.shadows.card,
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
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: theme.spacing.large,
  },
  inputContainer: {
    marginBottom: theme.spacing.large,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    ...theme.shadows.card,
  },
  input: {
    flex: 1,
    marginLeft: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.medium,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.medium,
  },
  loginButtonContainer: {
    marginBottom: theme.spacing.large,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  loginButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.medium,
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.size.small,
  },
  registerLink: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
  },
});

export default LoginScreen;