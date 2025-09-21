import React, { useState } from 'react';
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
import ProfileScreen from './src/screens/ProfileScreen';
import {
  CartProvider,
} from './src/context/CartContext';
import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from './src/constants/theme';

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
        name="HelpSupport"
        component={HelpSupportScreen}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationScreen}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { cart } = useCart();
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outlined';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'shopping-cart' : 'shopping-cart-outlined';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          const iconSize = focused ? 28 : 24;
          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: theme.fonts.size.medium,
          fontFamily: theme.fonts.family.medium,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70,
          paddingBottom: 10,
          position: 'absolute',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          left: 20,
          right: 20,
          bottom: 20,
          margin: 0,
        },
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontFamily: theme.fonts.family.bold,
          fontSize: theme.fonts.size.title,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Products',
          tabBarLabel: 'Products',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.error,
            color: 'white',
            fontSize: 12,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthScreens() {
  const { auth, login } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  if (auth.loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (!auth.isAuthenticated) {
    return currentScreen === 'login' ? (
      <LoginScreen />
    ) : (
      <RegisterScreen />
    );
  }

  return <MainTabs />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <AuthScreens />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
