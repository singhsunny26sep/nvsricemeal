import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { theme } from '../constants/theme';
import Logo from '../components/Logo';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Animate title fade in
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animate subtitle fade in after title
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 500);

    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish, titleOpacity, subtitleOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <Animated.View style={{ opacity: titleOpacity }}>
        <Logo
          size="large"
          showText={true}
          variant="circular"
          style={styles.logo}
        />
      </Animated.View>
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Loading your premium rice experience...
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.fonts.size.header,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: theme.spacing.medium,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fonts.size.xlarge,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.medium,
  },
  logo: {
    marginBottom: theme.spacing.large,
  },
});

export default SplashScreen;