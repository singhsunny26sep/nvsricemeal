import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import OtpVerify from 'react-native-otp-verify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../utils/apiService';
import { useNavigation } from '@react-navigation/native';
import { FCM_STORAGE_KEY } from '../utils/firebase';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [, setSessionId] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const focusValues = React.useRef<Record<string, Animated.Value>>({}).current;
  const otpInputs = React.useRef<Array<TextInput | null>>([]);
  const { login } = useAuth();
  const { strings } = useLanguage();
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const otpRef = useRef('');
  const phoneRef = useRef('');

  useEffect(() => {
    otpRef.current = otp;
  }, [otp]);

  useEffect(() => {
    phoneRef.current = phone;
  }, [phone]);

  const otpHandler = (message: string) => {
    console.log('SMS Retriever Message:', message);
    const otpMatch = /(\d{4,6})/g.exec(message);
    if (otpMatch && otpMatch[1]) {
      const extractedOtp = otpMatch[1];
      console.log('Extracted OTP:', extractedOtp);
      setOtp(extractedOtp);
      if (extractedOtp.length === 6) {
        setTimeout(() => {
          verifyOTPHandler(extractedOtp);
        }, 500);
      }
    }
  };

  const verifyOTPHandler = async (otpValue: string) => {
    if (otpValue.length !== 6) {
      Alert.alert(
        strings?.common?.error || 'ದೋಷ',
        'ದಯವಿಟ್ಟು 6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const fcmToken = await AsyncStorage.getItem(FCM_STORAGE_KEY);
      const response = await apiService.verifyMobileOTP({
        mobile: phoneRef.current,
        otp: otpValue,
        fcmToken: fcmToken || '',
      });

      if (response.success && response.data) {
        const user = (response.data as any)?.data?.user || (response.data as any)?.user;
        const token = (response.data as any)?.data?.token || (response.data as any)?.token;
        
        if (user && user.isSignUpCompleted === false) {
          if (token) {
            await AsyncStorage.setItem('userToken', token);
          }
          
          setShowOTPInput(false);
          setOtp('');
          setSessionId('');
          
          setTimeout(() => {
            (navigation as any).navigate('ProfileCompletion', { user });
          }, 300);
        } else if (user && token) {
          login({
            ...user,
            token,
          });

          Alert.alert(
            strings?.login?.success || 'ಯಶಸ್ಸು',
            strings?.login?.loginSuccess || 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!'
          );

          setShowOTPInput(false);
          setOtp('');
          setSessionId('');
        } else {
          Alert.alert(
            strings?.common?.error || 'ದೋಷ',
            response.error || 'OTP ತಪ್ಪಾಗಿದೆ'
          );
        }
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      OtpVerify.getHash()
        .then((hash) => {
          console.log('SMS Retriever Hash:', hash);
        })
        .catch((error) => {
          console.log('SMS Retriever Hash Error:', error);
        });

      OtpVerify.getOtp()
        .then(() => OtpVerify.addListener(otpHandler))
        .catch((error) => {
          console.log('OTP Listener Error:', error);
        });
    }

    return () => {
      if (Platform.OS === 'android') {
        OtpVerify.removeListener();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      if (response.success) {
        if (response.data?.data?.otpData?.Details) {
          setSessionId(response.data.data.otpData.Details);
        }
        setShowOTPInput(true);
        Alert.alert(
          strings?.login?.success || 'ಯಶಸ್ಸು',
          'OTP ಕಳುಹಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೆಲ್ ಸಂಖ್ಯೆಗೆ ಬಂದ OTP ನಮೂದಿಸಿ.'
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

  const handleVerifyMobileOTP = async () => {
    const currentOtp = otp;
    if (currentOtp.length !== 6) {
      Alert.alert(
        strings?.common?.error || 'ದೋಷ',
        'ದಯವಿಟ್ಟು 6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const fcmToken = await AsyncStorage.getItem(FCM_STORAGE_KEY);
      const response = await apiService.verifyMobileOTP({
        mobile: phone,
        otp: currentOtp,
        fcmToken: fcmToken || '',
      });

      if (response.success && response.data) {
        const user = (response.data as any)?.data?.user || (response.data as any)?.user;
        const token = (response.data as any)?.data?.token || (response.data as any)?.token;
        
        if (user && user.isSignUpCompleted === false) {
          if (token) {
            await AsyncStorage.setItem('userToken', token);
          }

          setShowOTPInput(false);
          setOtp('');
          setSessionId('');
          
          setTimeout(() => {
            (navigation as any).navigate('ProfileCompletion', { user });
          }, 300);
        } else if (user && token) {
          login({
            ...user,
            token,
          });

          Alert.alert(
            strings?.login?.success || 'ಯಶಸ್ಸು',
            strings?.login?.loginSuccess || 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!'
          );

          setShowOTPInput(false);
          setOtp('');
          setSessionId('');
        } else {
          Alert.alert(
            strings?.common?.error || 'ದೋಷ',
            response.error || 'OTP ತಪ್ಪಾಗಿದೆ'
          );
        }
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

  const renderFloatingInput = (
    icon: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldKey: string,
    secureTextEntry?: boolean,
    keyboardType?: any,
    maxLength?: number,
    autoCapitalize?: any
  ) => {
    if (!focusValues[fieldKey]) {
      focusValues[fieldKey] = new Animated.Value(0);
    }
    const focusVal = focusValues[fieldKey];
    const isFocused = focusedField === fieldKey;
    const shouldFloat = isFocused || value.length > 0;

    const labelTop = focusVal.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });
    const labelSize = focusVal.interpolate({ inputRange: [0, 1], outputRange: [14, 11] });
    const labelColor = focusVal.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textSecondary, theme.colors.primary],
    });
    const borderColor = focusVal.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(76, 175, 80, 0.15)', theme.colors.primary],
    });

    const animateFocus = (to: number) => {
      Animated.timing(focusVal, {
        toValue: to,
        duration: 160,
        useNativeDriver: false,
      }).start();
    };

    return (
      <View style={styles.inputContainer}>
        <Animated.View style={[styles.iconInput, { borderColor }]}>
          <Icon name={icon as any} size={22} color={theme.colors.textSecondary} />
          <View style={styles.inputInner}>
            <Animated.Text
              style={[
                styles.floatingPlaceholder,
                { top: labelTop, fontSize: labelSize, color: labelColor },
              ]}
            >
              {placeholder}
            </Animated.Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              maxLength={maxLength}
              autoCapitalize={autoCapitalize}
              onFocus={() => {
                setFocusedField(fieldKey);
                animateFocus(shouldFloat ? 0 : 1);
              }}
              onBlur={() => {
                setFocusedField(null);
                if (value.length === 0) {
                  animateFocus(0);
                }
              }}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderPrimaryButton = (label: string, onPress: () => void) => (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#1b50aa', '#3d81e8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.loginButtonGradient, isLoading && styles.loginButtonGradientDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <Text style={styles.loginButtonText}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <LinearGradient
        colors={['#1b50aa', '#3d81e8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.logoWrap}>
         <Image source={require('../assets/img/logos.jpeg')} style={styles.logo} />
        </View>
        <Text style={styles.subtitle}>
          {strings?.login?.welcomeBack || 'NVS ಅಕ್ಕಿ ಮಾಲ್‌ಗೆ ಮರಳಿ ಸ್ವಾಗತ'}
        </Text>
        <Text style={styles.tagline}>Fresh Rice, Delivered to Your Door</Text>
      </LinearGradient>

      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <View style={styles.phoneHint}>
          <Icon name="info-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.phoneHintText}>
            {strings?.login?.mobileLoginNote || 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಮತ್ತು OTP ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ'}
          </Text>
        </View>

        {renderFloatingInput(
          'phone',
          strings?.profile?.phone || 'ಮೊಬೆಲ್ ಸಂಖ್ಯೆ',
          phone,
          setPhone,
          'phone',
          false,
          'phone-pad',
          10,
          'none'
        )}

        {/* Inline OTP Input */}
        {showOTPInput && (
          <View style={styles.otpSection}>
            <View style={styles.otpInputContainer}>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <TextInput
                    key={index}
                    style={[
                      styles.otpBox,
                      otp[index] ? styles.otpBoxFilled : null,
                      focusedField === `otp${index}` && styles.otpBoxFocused,
                    ]}
                    value={otp[index] || ''}
                    onChangeText={(text) => {
                      if (text.length <= 1 && /^\d*$/.test(text)) {
                        const newOtp = otp.padEnd(6, ' ').split('');
                        newOtp[index] = text;
                        setOtp(newOtp.join('').replace(/ /g, ''));
                        if (text && index < 5) {
                          otpInputs.current[index + 1]?.focus();
                        }
                        setFocusedField(`otp${index}`);
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                        otpInputs.current[index - 1]?.focus();
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={1}
                    autoFocus={index === 0}
                    textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                    onFocus={() => setFocusedField(`otp${index}`)}
                    onBlur={() => setFocusedField(null)}
                    ref={(ref) => {
                      if (ref) {
                        otpInputs.current[index] = ref;
                      }
                    }}
                  />
                ))}
            </View>
            <TouchableOpacity onPress={handleSendOTP} activeOpacity={0.6} style={styles.resendRow}>
              <Text style={styles.resendOtp}>
                {strings?.login?.resendOTP || 'ಮರುಗಮನಿಸಿ OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {renderPrimaryButton(
          showOTPInput
            ? (strings?.login?.verifyOTP || 'OTP ಪರಿಶೀಲಿಸಿ')
            : (strings?.login?.sendOTP || 'OTP ಕಳುಹಿಸಿ'),
          showOTPInput ? handleVerifyMobileOTP : handleSendOTP
        )}

       
      </Animated.View>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...theme.shadows.card,
    elevation: 8,
  },
  logoWrap: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 60,
    padding: theme.spacing.small,
    marginBottom: theme.spacing.medium,
  },
  logo: {
    width: 140,
    height: 140,
  },
  subtitle: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.card,
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: theme.fonts.family.medium,
  },
  tagline: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.card,
    opacity: 0.75,
    marginTop: theme.spacing.small,
    fontStyle: 'italic',
  },
  phoneHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: theme.spacing.large,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.large,
  },
  phoneHintText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.medium,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.large,
    paddingTop: theme.spacing.xlarge,
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
    elevation: 3,
    borderWidth: 1,
  },
  inputInner: {
    flex: 1,
    marginLeft: theme.spacing.medium,
  },
  input: {
    flex: 1,
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    paddingVertical: 0,
    minHeight: 20,
  },
  floatingPlaceholder: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'transparent',
  },
  loginButton: {
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    marginVertical: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: theme.spacing.large,
    paddingHorizontal: theme.spacing.xlarge,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
    flexDirection: 'row',
    gap: 8,
  },
  loginButtonGradientDisabled: {
    opacity: 0.8,
  },
  loginButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  otpSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(27, 80, 170, 0.1)',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: theme.spacing.medium,
  },
  otpBox: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(27, 80, 170, 0.3)',
    borderRadius: theme.borderRadius.medium,
    fontSize: theme.fonts.size.xlarge,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
    textAlign: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: 0,
  },
  otpBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(27, 80, 170, 0.05)',
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(27, 80, 170, 0.05)',
  },
  resendRow: {
    alignSelf: 'center',
  },
  resendOtp: {
    color: theme.colors.primary,
    fontSize: theme.fonts.size.medium,
    fontFamily: theme.fonts.family.medium,
    textAlign: 'center',
  },
  switchAuthButton: {
    marginTop: theme.spacing.large,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  switchAuthLink: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
