import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Image, Dimensions, Alert, Platform } from 'react-native';
import { theme } from '../constants/theme';
import Logo from '../components/Logo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid } from 'react-native';

const { width, height } = Dimensions.get('window');


interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Request location permission when app starts
    const requestLocationPermission = async () => {
      try {
        let permissionGranted = false;

        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to provide better services.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // iOS
          const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          permissionGranted = result === RESULTS.GRANTED;
        }

        if (permissionGranted) {
          console.log('Location permission granted');
          // Get current location and save it
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log('Current location:', { latitude, longitude });

              // Save location to AsyncStorage
              const saveLocation = async () => {
                try {
                  const AsyncStorage = require('@react-native-async-storage/async-storage');
                  await AsyncStorage.setItem('userLatitude', latitude.toString());
                  await AsyncStorage.setItem('userLongitude', longitude.toString());
                  console.log('Location saved successfully');
                } catch (error) {
                  console.error('Error saving location:', error);
                }
              };

              saveLocation();
            },
            (error) => {
              console.error('Error getting location:', error);
              Alert.alert(
                'Location Error',
                'Unable to get your current location. Please check your GPS settings.',
                [{ text: 'OK' }]
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000
            }
          );
        } else {
          console.log('Location permission denied');
          Alert.alert(
            'Location Permission',
            'Location permission is required for better app experience. You can enable it later in settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      }
    };

    // Request permission immediately
    requestLocationPermission();

    // Start background animation
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate logo with bounce and rotation
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate title with slide up
    setTimeout(() => {
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Animate subtitle with delay
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1200);

    // Animate particles
    setTimeout(() => {
      Animated.timing(particlesOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 2000);

    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Fade out animation before navigation
    const fadeOutTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 0.8, duration: 500, useNativeDriver: true }),
        Animated.timing(particlesOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => {
        onFinish();
      });
    }, 4500);

    return () => {
      clearTimeout(fadeOutTimer);
      pulseAnimation.stop();
    };
  }, [onFinish, titleOpacity, subtitleOpacity, logoScale, logoRotate, particlesOpacity, backgroundOpacity, logoPulse]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a4d3a" />

      {/* Animated Background Gradient */}
      <Animated.View style={[styles.background, { opacity: backgroundOpacity }]}>
        <View style={styles.gradient1} />
        <View style={styles.gradient2} />
        <View style={styles.gradient3} />
      </Animated.View>
      {/* Floating Particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particlesOpacity }]}>
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                transform: [
                  {
                    translateY: particlesOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -Math.random() * 100 - 50],
                    }),
                  },
                  {
                    translateX: particlesOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (Math.random() - 0.5) * 200],
                    }),
                  },
                ],
                opacity: particlesOpacity.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.8, 0],
                }),
              },
            ]}
          >
            <Icon name="grain" size={16} color="rgba(255,255,255,0.6)" />
          </Animated.View>
        ))}
      </Animated.View>

      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: titleOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, logoPulse) },
                {
                  rotate: logoRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoGlow}>
            <Image
              style={styles.logo}
              source={require("../assets/img/logo.png")}
              onError={() => console.log('Logo image not found, using Logo component')}
            />
          </View>
        </Animated.View>

        {/* Animated Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [
                {
                  translateY: titleOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          NVS Rice Mall
        </Animated.Text>

        {/* Animated Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [
                {
                  translateY: subtitleOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Premium Quality Rice Experience
        </Animated.Text>

        {/* Enhanced Loading Animation */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: subtitleOpacity,
              transform: [
                {
                  translateY: subtitleOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: particlesOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Loading amazing experience...</Text>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <Icon name="star" size={16} color="rgba(255,255,255,0.7)" />
            <Icon name="star" size={12} color="rgba(255,255,255,0.5)" />
            <Icon name="star" size={14} color="rgba(255,255,255,0.6)" />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d3626',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient1: {
    position: 'absolute',
    top: -height * 0.5,
    left: -width * 0.5,
    width: width * 2,
    height: height * 2,
    backgroundColor: '#1a4d3a',
    opacity: 0.8,
    transform: [{ rotate: '45deg' }],
  },
  gradient2: {
    position: 'absolute',
    top: -height * 0.3,
    right: -width * 0.3,
    width: width * 1.5,
    height: height * 1.5,
    backgroundColor: '#2d6b4f',
    opacity: 0.6,
    borderRadius: width * 0.75,
  },
  gradient3: {
    position: 'absolute',
    bottom: -height * 0.4,
    left: -width * 0.2,
    width: width * 1.2,
    height: height * 1.2,
    backgroundColor: '#4a8b6b',
    opacity: 0.4,
    borderRadius: width * 0.6,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    top: height * 0.2 + Math.random() * height * 0.6,
    left: Math.random() * width,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoGlow: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 8,
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 40,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '85%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
    fontWeight: '500',
  },
  decorativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default SplashScreen;