import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../constants/products';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

interface SavedItem {
  product: Product;
  savedAt: Date;
}

interface CartState {
  items: CartItem[];
  savedItems: SavedItem[];
  deliveryCharges: number;
  couponCode: string;
  couponDiscount: number;
  pincode: string;
  isDeliveryAvailable: boolean;
  userLocation: {
    coordinates: [number, number];
    address?: string;
    name?: string;
  } | null;
}

type CartAction =
  | { type: 'ADD_TO_CART'; product: Product }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'SAVE_FOR_LATER'; productId: string }
  | { type: 'MOVE_TO_CART'; productId: string }
  | { type: 'APPLY_COUPON'; code: string; discount: number }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_PINCODE'; pincode: string; isAvailable: boolean }
  | { type: 'SET_USER_LOCATION'; location: { coordinates: [number, number]; address?: string; name?: string } | null }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; cart: CartState };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.product.id === action.product.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1, addedAt: new Date() }],
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.productId),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };
    case 'SAVE_FOR_LATER':
      const itemToSave = state.items.find(item => item.product.id === action.productId);
      if (itemToSave) {
        const newSavedItem: SavedItem = { product: itemToSave.product, savedAt: new Date() };
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== action.productId),
          savedItems: [...state.savedItems, newSavedItem],
        };
      }
      return state;
    case 'MOVE_TO_CART':
      const savedItemToMove = state.savedItems.find(item => item.product.id === action.productId);
      if (savedItemToMove) {
        const newCartItem: CartItem = { product: savedItemToMove.product, quantity: 1, addedAt: new Date() };
        return {
          ...state,
          savedItems: state.savedItems.filter(item => item.product.id !== action.productId),
          items: [...state.items, newCartItem],
        };
      }
      return state;
    case 'APPLY_COUPON':
      return {
        ...state,
        couponCode: action.code,
        couponDiscount: action.discount,
      };
    case 'REMOVE_COUPON':
      return {
        ...state,
        couponCode: '',
        couponDiscount: 0,
      };
    case 'SET_PINCODE':
      return {
        ...state,
        pincode: action.pincode,
        isDeliveryAvailable: action.isAvailable,
      };
    case 'SET_USER_LOCATION':
      return {
        ...state,
        userLocation: action.location,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        savedItems: [],
        couponCode: '',
        couponDiscount: 0,
      };
    case 'LOAD_CART':
      return action.cart;
    default:
      return state;
  }
};

const CartContext = createContext<{
  cart: CartState;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setPincode: (pincode: string, isAvailable: boolean) => void;
  setUserLocation: (location: { coordinates: [number, number]; address?: string; name?: string } | null) => void;
  clearCart: () => void;
} | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const initialState: CartState = {
  items: [],
  savedItems: [],
  deliveryCharges: 40,
  couponCode: '',
  couponDiscount: 0,
  pincode: '',
  isDeliveryAvailable: true,
  userLocation: null,
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Convert date strings back to Date objects
          parsedCart.items = parsedCart.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }));
          parsedCart.savedItems = parsedCart.savedItems.map((item: any) => ({
            ...item,
            savedAt: new Date(item.savedAt),
          }));
          dispatch({ type: 'LOAD_CART', cart: parsedCart });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    saveCart();
  }, [cart]);

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', product });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  };

  const saveForLater = (productId: string) => {
    dispatch({ type: 'SAVE_FOR_LATER', productId });
  };

  const moveToCart = (productId: string) => {
    dispatch({ type: 'MOVE_TO_CART', productId });
  };

  const applyCoupon = (code: string, discount: number) => {
    dispatch({ type: 'APPLY_COUPON', code, discount });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const setPincode = (pincode: string, isAvailable: boolean) => {
    dispatch({ type: 'SET_PINCODE', pincode, isAvailable });
  };

  const setUserLocation = (location: { coordinates: [number, number]; address?: string; name?: string } | null) => {
    dispatch({ type: 'SET_USER_LOCATION', location });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      saveForLater,
      moveToCart,
      applyCoupon,
      removeCoupon,
      setPincode,
      setUserLocation,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};