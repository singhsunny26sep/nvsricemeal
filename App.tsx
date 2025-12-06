import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCart } from './src/context/CartContext';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
} from '@react-navigation/stack';
import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RiceCategoryScreen from './src/screens/RiceCategoryScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import CartScreen from './src/screens/CartScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import {
  CartProvider,
} from './src/context/CartContext';
import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';
import {
  LanguageProvider,
  useLanguage,
} from './src/context/LanguageContext';
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from './src/constants/theme';
import LocationFillPage from './src/screens/LocationFillPage';
import SaveLocationScreen from './src/screens/SaveLocationScreen';

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    width: 30,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -8,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: theme.fonts.family.bold,
  },
});

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
      />
      <HomeStack.Screen
        name="RiceCategory"
        component={RiceCategoryScreen}
      />
      <HomeStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
      />
      <HomeStack.Screen
        name="ProductDetailsScreen"
        component={ProductDetailsScreen}
      />
      <HomeStack.Screen
        name="CartScreen"
        component={CartScreen}
      />
    </HomeStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
      />
      <ProfileStack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
      />
      <ProfileStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
      />
      <ProfileStack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
      />
       <ProfileStack.Screen
        name="Location"
        component={LocationFillPage}
      />
 
      <ProfileStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationScreen}
      />
      <ProfileStack.Screen
        name="SaveLocation"
        component={SaveLocationScreen}
      />

    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { cart } = useCart();
  const { strings } = useLanguage();
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          let IconComponent;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
            IconComponent = (
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={focused ? 26 : 22} color={color} />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            );
          } else if (route.name === 'Explore') {
            iconName = focused ? 'explore' : 'explore';
            IconComponent = (
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={focused ? 26 : 22} color={color} />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            );
          } else if (route.name === 'Cart') {
            iconName = focused ? 'shopping-cart' : 'shopping-cart';
            IconComponent = (
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={focused ? 26 : 22} color={color} />
                {focused && <View style={styles.activeIndicator} />}
                {totalItems > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {totalItems > 99 ? '99+' : totalItems}
                    </Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            IconComponent = (
              <View style={styles.iconContainer}>
                <Icon name={iconName} size={focused ? 26 : 22} color={color} />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            );
          }
          return IconComponent;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: theme.fonts.size.small,
          fontFamily: theme.fonts.family.medium,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          height: 80,
          paddingBottom: 15,
          paddingTop: 10,
          position: 'absolute',
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          left: 15,
          right: 15,
          bottom: 15,
          margin: 0,
          backdropFilter: 'blur(10px)',
          borderWidth: 1,
          borderColor: 'rgba(76, 175, 80, 0.1)',
        },
        headerShown: false,
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: strings?.navigation?.products || 'ಉತ್ಪನ್ನಗಳು',
          tabBarLabel: strings?.navigation?.products || 'ಉತ್ಪನ್ನಗಳು',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: strings?.navigation?.explore || 'ಅನ್ವೇಷಿಸಿ',
          tabBarLabel: strings?.navigation?.explore || 'ಅನ್ವೇಷಿಸಿ',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: strings?.navigation?.cart || 'ಕಾರ್ಟ್',
          tabBarLabel: strings?.navigation?.cart || 'ಕಾರ್ಟ್',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: strings?.navigation?.profile || 'ಪ್ರೊಫೈಲ್',
          tabBarLabel: strings?.navigation?.profile || 'ಪ್ರೊಫೈಲ್',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthScreens() {
  const { auth, login } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  if (auth.loading || !isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  if (!auth.isAuthenticated) {
    return currentScreen === 'login' ? (
      <LoginScreen onSwitchToRegister={() => setCurrentScreen('register')} />
    ) : (
      <RegisterScreen onSwitchToLogin={() => setCurrentScreen('login')} />
    );
  }

  return <MainTabs />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <NavigationContainer>
                <AuthScreens />
              </NavigationContainer>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}