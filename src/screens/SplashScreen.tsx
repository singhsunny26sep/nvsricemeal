import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { theme } from '../constants/theme';

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
      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Rice Mall</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>Your Premium Rice Store</Animated.Text>
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
});

export default SplashScreen;