import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../utils/apiService';

interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  token?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; loading: boolean };

const AuthContext = createContext<{
  auth: AuthState;
  login: (user: User) => void;
  logout: () => void;
} | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.user,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson) as User;
          dispatch({ type: 'LOGIN', user });
        } else {
          dispatch({ type: 'SET_LOADING', loading: false });
        }
      } catch (error) {
        console.error('Error loading user', error);
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    };
    loadUser();
  }, []);

  const login = async (user: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN', user });
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  const logout = async () => {
    try {
      // Call API logout first
      const logoutResponse = await apiService.logout();
      if (logoutResponse.success) {
        console.log('API logout successful');
      } else {
        console.error('API logout failed:', logoutResponse.error);
        // Continue with local logout even if API fails
      }

      // Clear local storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
      dispatch({ type: 'LOGOUT' });
      console.log('Local logout completed');
    } catch (error) {
      console.error('Error logging out', error);
      // Still clear local data even if API call fails
      try {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userToken');
        dispatch({ type: 'LOGOUT' });
      } catch (storageError) {
        console.error('Error clearing local storage', storageError);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};