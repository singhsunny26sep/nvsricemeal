import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../utils/apiService';
import Logo from '../components/Logo';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
}
const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const { login } = useAuth();
  const { strings } = useLanguage();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (loginMethod === 'email') {
      if (email === '' || password === '') {
        Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.login?.fillAllFields || 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.');
        return;
      }
      if (!emailRegex.test(email)) {
        Alert.alert(strings?.common?.error || 'ದೋಷ', strings?.common?.invalidEmail || 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.');
        return;
      }
      if (password.length < 6) {
        Alert.alert(strings?.common?.error || 'ದೋಷ', 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು.');
        return;
      }

      setIsLoading(true);
      try {
        let response;
        if (loginMethod === 'email') {
          response = await apiService.login({
            type: 'email',
            email,
            password,
            fcmToken: 'dkcdkmdedmeidcwd', // This would typically come from FCM device registration
          });
        } else {
          // Mobile login - Direct login with mobile number
          if (phone === '') {
            Alert.alert(strings?.common?.error || 'ದೋಷ', 'ದಯವಿಟ್ಟು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.');
            return;
          }
          // Direct mobile login (OTP will be sent by server)
          setIsLoading(true);
          try {
            const response = await apiService.loginWithMobile({
              mobile: phone
            });

            if (response && response.success && response.data) {
              const { user, token } = response.data;
              login({
                ...user,
                token,
              });

              Alert.alert(
                strings?.login?.success || 'ಯಶಸ್ಸು',
                strings?.login?.loginSuccess || 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!'
              );
            } else {
              Alert.alert(
                strings?.common?.error || 'ದೋಷ',
                (response?.error) || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ'
              );
            }
          } catch (error) {
            Alert.alert(
              strings?.common?.error || 'ದೋಷ',
              'ನೆಟ್‌ವರ್ಕ್ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            );
          } finally {
            setIsLoading(false);
          }
          return;
        }

        if (response && response.success && response.data) {
          // Login successful
          const { user, token } = response.data;
          login({
            ...user,
            token,
          });

          Alert.alert(
            strings?.login?.success || 'ಯಶಸ್ಸು',
            strings?.login?.loginSuccess || 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!'
          );
        } else {
          Alert.alert(
            strings?.common?.error || 'ದೋಷ',
            (response?.error) || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ'
          );
        }
      } catch (error) {
        Alert.alert(
          strings?.common?.error || 'ದೋಷ',
          'ನೆಟ್‌ವರ್ಕ್ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mobile login validation
      if (phone === '') {
        Alert.alert(strings?.common?.error || 'ದೋಷ', 'ದಯವಿಟ್ಟು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.');
        return;
      }
      // Mobile validation is handled in the try block below
    }
  };


  // Send OTP for mobile login
  const handleSendOTP = async () => {
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(phone)) {
      Alert.alert(
        strings?.common?.error || 'ದೋಷ',
        'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
      );
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiService.sendOTP({
        phone: phone,
        type: 'phone',
      });

      console.log('Send OTP API Response:', response);

      if (response.success) {
        // Store sessionId from response data
        if (response.data?.data?.otpData?.Details) {
          setSessionId(response.data.data.otpData.Details);
          console.log('Session ID stored:', response.data.data.otpData.Details);
        }
        setShowOTPInput(true);
        Alert.alert(
          strings?.login?.success || 'ಯಶಸ್ಸು',
          'OTP ಕಳುಹಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಬಂದ OTP ನಮೂದಿಸಿ.'
        );
      } else {
        Alert.alert(
          strings?.common?.error || 'ದೋಷ',
          response.error || 'OTP ಕಳುಹಿಸುವಲ್ಲಿ ವಿಫಲವಾಗಿದೆ'
        );
      }
    } catch (error) {
      Alert.alert(
        strings?.common?.error || 'ದೋಷ',
        'ನೆಟ್‌ವರ್ಕ್ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Verify mobile OTP
  const handleVerifyMobileOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert(
        strings?.common?.error || 'ದೋಷ',
        'ದಯವಿಟ್ಟು 6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.verifyMobileOTP({
        mobile: phone,
        otp: otp,
      });

      console.log('Verify Mobile OTP API Response:', response);

      if (response.success && response.data) {
        const { user, token } = response.data;
        login({
          ...user,
          token,
        });

        Alert.alert(
          strings?.login?.success || 'ಯಶಸ್ಸು',
          strings?.login?.loginSuccess || 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!'
        );

        // Reset state
        setShowOTPInput(false);
        setOtp('');
        setSessionId('');
      } else {
        Alert.alert(
          strings?.common?.error || 'ದೋಷ',
          response.error || 'OTP ತಪ್ಪಾಗಿದೆ'
        );
      }
    } catch (error) {
      Alert.alert(
        strings?.common?.error || 'ದೋಷ',
        'ನೆಟ್‌ವರ್ಕ್ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
      );
    } finally {
      setIsLoading(false);
    }
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
        <Image resizeMode='contain'   style={styles.logo} source={require("../assets/img/logos.jpeg")}/>
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
              loginMethod === 'mobile' && styles.loginMethodButtonActive
            ]}
            onPress={() => setLoginMethod('mobile')}
          >
            <Text style={[
              styles.loginMethodText,
              loginMethod === 'mobile' && styles.loginMethodTextActive
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
                  : (strings?.profile?.phone || 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ')
              }
              value={loginMethod === 'email' ? email : phone}
              onChangeText={loginMethod === 'email' ? setEmail : setPhone}
              keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize={loginMethod === 'email' ? 'none' : 'words'}
              maxLength={loginMethod === 'mobile' ? 10 : undefined}
            />
          </View>
        </View>

        {/* Password Input - Only show for email login */}
        {loginMethod === 'email' && (
          <View style={styles.inputContainer}>
            <View style={styles.iconInput}>
              <Icon name="lock" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={strings?.login?.password || 'ಪಾಸ್‌ವರ್ಡ್'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>
        )}
        <Animated.View style={[styles.loginButtonContainer, { transform: [{ scale: scaleValue }] }]}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={loginMethod === 'mobile' ? (showOTPInput ? handleVerifyMobileOTP : handleSendOTP) : handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.card} />
            ) : (
              <Text style={styles.loginButtonText}>
                {loginMethod === 'mobile'
                  ? (showOTPInput ? (strings?.login?.verifyOTP || 'OTP ಪರಿಶೀಲಿಸಿ') : (strings?.login?.sendOTP || 'OTP ಕಳುಹಿಸಿ'))
                  : (strings?.login?.login || 'ಲಾಗಿನ್')
                }
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{strings?.login?.noAccount || "ಖಾತೆ ಇಲ್ಲವೇ?"} </Text>
          <TouchableOpacity onPress={onSwitchToRegister}>
            <Text style={styles.registerLink}>{strings?.login?.register || 'ನೋಂದಣಿ'}</Text>
          </TouchableOpacity>
        </View>
      </View>

     {/* OTP Input Modal for Mobile Login */}
     {showOTPInput && (
       <View style={styles.otpModal}>
         <View style={styles.otpContainer}>
           <Text style={styles.otpTitle}>OTP ಪರಿಶೀಲನೆ</Text>
           <Text style={styles.otpSubtitle}>
             ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಿದ 6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ{'\n'}{phone}
           </Text>

           <View style={styles.otpInputContainer}>
             <TextInput
               style={styles.otpInput}
               placeholder="000000"
               value={otp}
               onChangeText={setOtp}
               keyboardType="numeric"
               maxLength={6}
               autoFocus
             />
           </View>

           <TouchableOpacity
             style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
             onPress={handleVerifyMobileOTP}
             disabled={isLoading}
           >
             {isLoading ? (
               <ActivityIndicator size="small" color={theme.colors.card} />
             ) : (
               <Text style={styles.verifyButtonText}>
                 {strings?.login?.verifyOTP || 'OTP ಪರಿಶೀಲಿಸಿ'}
               </Text>
             )}
           </TouchableOpacity>

           <TouchableOpacity
             style={styles.closeButton}
             onPress={() => {
               setShowOTPInput(false);
               setOtp('');
               setSessionId('');
             }}
           >
             <Text style={styles.closeButtonText}>ರದ್ದುಗೊಳಿಸಿ</Text>
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
  loginButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
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
  verifyButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  verifyButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
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
