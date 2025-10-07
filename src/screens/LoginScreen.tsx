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
import { useLanguage } from '../context/LanguageContext';
import Logo from '../components/Logo';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const { strings } = useLanguage();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handleSendOTP = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (loginMethod === 'email') {
      if (email === '') {
        Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.login?.fillAllFields || 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.');
        return;
      }
      if (!emailRegex.test(email)) {
        Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.common?.invalidEmail || 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.');
        return;
      }

      // Demo OTP sending to email - in real app, call API to send OTP to email
      Alert.alert(
        strings?.login?.otpSent || 'OTP ಕಳುಹಿಸಲಾಗಿದೆ',
        `${strings?.login?.otpSubtitle || 'ಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕಿಗಳ ಕೋಡ್ ನಮೂದಿಸಿ'} ${email}`,
        [{ text: 'OK', onPress: () => setShowOTPVerification(true) }]
      );
    } else {
      if (phone === '') {
        Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.login?.fillAllFields || 'ದಯವಿಟ್ಟು ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.');
        return;
      }
      if (!phoneRegex.test(phone)) {
        Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.common?.invalidPhone || 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.');
        return;
      }

      // Demo OTP sending to phone - in real app, call API to send OTP to phone
      Alert.alert(
        strings?.login?.otpSent || 'OTP ಕಳುಹಿಸಲಾಗಿದೆ',
        `${strings?.login?.otpSubtitle || 'ಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕಿಗಳ ಕೋಡ್ ನಮೂದಿಸಿ'} +91 ${phone}`,
        [{ text: 'OK', onPress: () => setShowOTPVerification(true) }]
      );
    }
  };

  const handleVerifyOTP = () => {
    if (otp === '' || otp.length !== 6) {
      Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.login?.invalidOTP || 'ದಯವಿಟ್ಟು 6 ಅಂಕಿಗಳ OTP ನಮೂದಿಸಿ.');
      return;
    }

    // Demo OTP verification - in real app, call API to verify OTP
    const user = {
      name: 'Demo User',
      email: 'demo@example.com',
      phone: phone
    };
    login(user);
    setShowOTPVerification(false);
    setOtp('');
  };

  // Both email and phone now use OTP, so handleEmailLogin is replaced by handleSendOTP

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
    Alert.alert(
      strings?.login?.forgotPassword || 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿದ್ದೀರಾ?',
      strings?.login?.featureComingSoon || 'ಹೆಚ್ಚುವರಿ ವೈಶಿಷ್ಟ್ಯ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ!'
    );
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
        <Text style={styles.subtitle}>{strings?.login?.welcomeBack || 'NVS ಅಕ್ಕಿ ಮಾಲ್‌ಗೆ ಮರಳಿ ಸ್ವಾಗತ'}</Text>
      </View>
      <View style={styles.formContainer}>
        {/* Login Method Toggle */}
        <View style={styles.loginMethodContainer}>
          <TouchableOpacity
            style={[
              styles.loginMethodButton,
              loginMethod === 'email' && styles.loginMethodButtonActive
            ]}
            onPress={() => setLoginMethod('email')}
          >
            <Text style={[
              styles.loginMethodText,
              loginMethod === 'email' && styles.loginMethodTextActive
            ]}>
              {strings?.login?.email || 'Email'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.loginMethodButton,
              loginMethod === 'phone' && styles.loginMethodButtonActive
            ]}
            onPress={() => setLoginMethod('phone')}
          >
            <Text style={[
              styles.loginMethodText,
              loginMethod === 'phone' && styles.loginMethodTextActive
            ]}>
              {strings?.profile?.phone || 'Phone'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email/Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.iconInput}>
            <Icon
              name={loginMethod === 'email' ? 'email' : 'phone'}
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder={
                loginMethod === 'email'
                  ? (strings?.login?.email || 'ಇಮೇಲ್')
                  : (strings?.profile?.phone || 'ಫೋನ್ ಸಂಖ್ಯೆ')
              }
              value={loginMethod === 'email' ? email : phone}
              onChangeText={loginMethod === 'email' ? setEmail : setPhone}
              keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize={loginMethod === 'email' ? 'none' : 'words'}
              maxLength={loginMethod === 'phone' ? 10 : undefined}
            />
          </View>
        </View>
        <Animated.View style={[styles.loginButtonContainer, { transform: [{ scale: scaleValue }] }]}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSendOTP}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {strings?.login?.sendOTP || 'Send OTP'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{strings?.login?.noAccount || "ಖಾತೆ ಇಲ್ಲವೇ?"} </Text>
          <TouchableOpacity onPress={onSwitchToRegister}>
            <Text style={styles.registerLink}>{strings?.login?.register || 'ನೋಂದಣಿ'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <View style={styles.otpModal}>
          <View style={styles.otpContainer}>
            <Text style={styles.otpTitle}>{strings?.login?.enterOTP || 'Enter OTP'}</Text>
            <Text style={styles.otpSubtitle}>
              {strings?.login?.otpSubtitle || 'Enter the 6-digit code sent to'}{' '}
              {loginMethod === 'email' ? email : `+91 ${phone}`}
            </Text>

            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
              />
            </View>

            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
              <Text style={styles.verifyButtonText}>{strings?.login?.verifyOTP || 'Verify OTP'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => Alert.alert(
                strings?.login?.otpSent || 'OTP ಕಳುಹಿಸಲಾಗಿದೆ',
                `${strings?.login?.otpSubtitle || 'ಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕಿಗಳ ಕೋಡ್ ನಮೂದಿಸಿ'} ${loginMethod === 'email' ? email : '+91 ' + phone}`
              )}
            >
              <Text style={styles.resendButtonText}>{strings?.login?.resendOTP || 'Resend OTP'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowOTPVerification(false);
                setOtp('');
              }}
            >
              <Text style={styles.closeButtonText}>{strings?.common?.cancel || 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  loginMethodContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: theme.borderRadius.large,
    padding: 4,
    marginBottom: theme.spacing.large,
  },
  loginMethodButton: {
    flex: 1,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  loginMethodButtonActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginMethodText: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
  },
  loginMethodTextActive: {
    color: theme.colors.card,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  otpModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  otpContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xlarge,
    margin: theme.spacing.large,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  otpSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xlarge,
    fontFamily: theme.fonts.family.regular,
  },
  otpInputContainer: {
    marginBottom: theme.spacing.xlarge,
  },
  otpInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.large,
    fontSize: theme.fonts.size.xlarge,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
    width: 200,
    textAlign: 'center',
    letterSpacing: 4,
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.xlarge,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    minWidth: 150,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  resendButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  resendButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    fontFamily: theme.fonts.family.medium,
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
  },
  closeButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    fontFamily: theme.fonts.family.medium,
  },
});

export default LoginScreen;
