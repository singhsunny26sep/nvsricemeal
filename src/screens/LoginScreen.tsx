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
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

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
        {/* <Logo
          size="medium"
          showText={true}
          style={styles.logo}
        /> */}
        <Image resizeMode='contain'   style={styles.logo} source={require("../assets/img/logo.png")}/>
        <Text style={styles.subtitle}>Welcome back to NVS Rice Mall</Text>
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
    paddingVertical: theme.spacing.xlarge * 1.5,
    paddingHorizontal: theme.spacing.large,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logo: {
    marginBottom: theme.spacing.medium,
   height:100,
   borderRadius:24
  },
  subtitle: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.card,
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: theme.fonts.family.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  inputContainer: {
    marginBottom: theme.spacing.large,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  input: {
    flex: 1,
    marginLeft: theme.spacing.medium,
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    paddingVertical: theme.spacing.small,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.large,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.medium,
  },
  loginButtonContainer: {
    marginVertical: theme.spacing.large,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
    ...theme.shadows.card,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.size.medium,
    fontFamily: theme.fonts.family.regular,
  },
  registerLink: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;