import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../utils/apiService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount: number;
  category: string;
  subCategory: string;
  weight?: string;
  originalPrice?: number;
}

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
  | { type: 'LOAD_CART'; cart: CartState }
  | { type: 'API_ADD_OR_UPDATE'; productId: string; quantity: number };

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
    case 'API_ADD_OR_UPDATE':
      // For API operations, we'll handle the actual API call in the context provider
      // This action is mainly for optimistic updates or syncing with API
      return state;
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
  addOrUpdateToCart: (productId: string, quantity: number) => Promise<boolean>;
  syncCartFromServer: () => Promise<void>;
  isSyncing: boolean;
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
  const [isSyncing, setIsSyncing] = React.useState(false);
  const syncInProgressRef = React.useRef(false);

  // Load cart from AsyncStorage on mount (only once)
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

  // Save cart to AsyncStorage whenever it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
          console.error('Error saving cart:', error);
        }
      };
      saveCart();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
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

  const addOrUpdateToCart = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      console.log('🔄 API CART: Adding/updating item in cart via API');
      console.log('🔄 API CART: Product ID:', productId);
      console.log('🔄 API CART: Quantity:', quantity);

      const response = await apiService.addOrUpdateToCart({
        productId,
        quantity,
      });

      if (response.success) {
        console.log('✅ API CART: Successfully added/updated item in server cart');
        
        // Update local cart optimistically
        const existingItem = cart.items.find(item => item.product.id === productId);
        if (existingItem) {
          dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
        } else {
          // We need to get the product details first - for now, just update the quantity
          // In a real implementation, you'd fetch the product details
          console.log('⚠️ API CART: Need to fetch product details for new item');
        }
        
        return true;
      } else {
        console.log('❌ API CART: Failed to add/update item in server cart');
        console.log('❌ API CART: Error:', response.error);
        return false;
      }
    } catch (error) {
      console.error('❌ API CART: Error calling addOrUpdateToCart API:', error);
      return false;
    }
  };

  const syncCartFromServer = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous sync operations
    if (syncInProgressRef.current) {
      console.log('⚠️ CART SYNC: Already in progress, skipping...');
      return;
    }

    try {
      console.log('🛒 =======================================');
      console.log('🛒 CART CONTEXT: SYNCING CART FROM SERVER');
      console.log('🛒 =======================================');
      
      syncInProgressRef.current = true;
      setIsSyncing(true);
      
      console.log('🔄 API CART: Syncing cart from server with product details');
      
      const response = await apiService.getCart();
      console.log('📥 CART CONTEXT: Cart sync response received');
      console.log('📥 CART CONTEXT: Response success:', response.success);
      console.log('📥 CART CONTEXT: Response data:', JSON.stringify(response.data, null, 2));

      if (response.success && response.data) {
        console.log('✅ =======================================');
        console.log('✅ API CART: Successfully fetched cart from server');
        
        // Extract cart items from response - Handle the actual API structure
        const cartData = response.data;
        let cartItems: any[] = [];

        // The API returns: { success: true, message: "Cart fetched", data: { items: [...] } }
        // response.data is the data field, which contains items array
        if (cartData?.items && Array.isArray(cartData.items)) {
          cartItems = cartData.items;
          console.log('✅ API CART: Found items in cartData.items');
        } else if (cartData?.data?.items && Array.isArray(cartData.data.items)) {
          cartItems = cartData.data.items;
          console.log('✅ API CART: Found items in cartData.data.items');
        } else if (cartData?.data && Array.isArray(cartData.data)) {
          cartItems = cartData.data;
          console.log('✅ API CART: Found items in cartData.data');
        } else if (Array.isArray(cartData)) {
          cartItems = cartData;
          console.log('✅ API CART: Found items directly in cartData');
        } else {
          console.log('⚠️ API CART: Unexpected cart data structure');
          console.log('⚠️ Available keys:', Object.keys(cartData));
          cartItems = [];
        }

        console.log('📦 API CART: Found', cartItems.length, 'items in cart');
        console.log('📦 API CART: Cart items:', JSON.stringify(cartItems, null, 2));

        // Extract product IDs from cart items
        const productIds = cartItems.map((item: any) => {
          return item.productId || item.product_id || item._id || item.id;
        }).filter(Boolean);

        console.log('🆔 API CART: Extracted product IDs:', productIds);

        if (productIds.length === 0) {
          console.log('⚠️ API CART: No product IDs found in cart');
          dispatch({
            type: 'LOAD_CART',
            cart: {
              ...initialState,
              items: []
            }
          });
          return;
        }

        // Fetch product details for each product ID (limit to avoid too many requests)
        const limitedProductIds = productIds.slice(0, 10); // Limit to 10 products max
        console.log('🔄 API CART: Fetching product details for', limitedProductIds.length, 'products (limited)');
        
        const productDetailsPromises = limitedProductIds.map(async (productId: string) => {
          console.log('🔄 API CART: Fetching product details for ID:', productId);
          try {
            const productResponse = await apiService.getProductById(productId);
            if (productResponse.success) {
              console.log('✅ API CART: Successfully fetched product:', productId);
              return {
                productId,
                productDetails: productResponse.data.data
              };
            } else {
              console.log('❌ API CART: Failed to fetch product:', productId);
              return {
                productId,
                productDetails: null,
                error: productResponse.error
              };
            }
          } catch (error) {
            console.log('💥 API CART: Error fetching product:', productId, error);
            return {
              productId,
              productDetails: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        });

        // Wait for all product detail requests to complete
        const productDetailsResults = await Promise.all(productDetailsPromises);
        
        console.log('📊 API CART: Product details fetched for all items');
        console.log('📊 API CART: Product details results:', JSON.stringify(productDetailsResults, null, 2));

        // Combine cart items with product details
        const enrichedCartItems = cartItems.map((item: any) => {
          const productId = item.productId || item.product_id || item._id || item.id;
          const productDetailsResult = productDetailsResults.find(result => result.productId === productId);
          
          return {
            ...item,
            productId,
            productDetails: productDetailsResult?.productDetails,
            fetchError: productDetailsResult?.error
          };
        });

        // Calculate totals
        const totalItems = enrichedCartItems.reduce((sum: number, item: any) => {
          return sum + (item.quantity || 1);
        }, 0);

        const totalPrice = enrichedCartItems.reduce((sum: number, item: any) => {
          const price = item.productDetails?.price || item.productDetails?.generalPrice || 0;
          const quantity = item.quantity || 1;
          return sum + (price * quantity);
        }, 0);

        console.log('🎉 =======================================');
        console.log('🎉 CART CONTEXT: CART ENRICHMENT COMPLETED');
        console.log('🎉 Total items:', totalItems);
        console.log('🎉 Total price:', totalPrice);
        console.log('🎉 =======================================');

        // Update local cart state with enriched data
        dispatch({
          type: 'LOAD_CART',
          cart: {
            ...initialState,
            items: enrichedCartItems.map((item: any) => ({
              product: {
                id: item.productId,
                name: item.productDetails?.name || 'Product Name Not Available',
                description: item.productDetails?.description || 'No description available',
                price: item.productDetails?.price || item.productDetails?.generalPrice || 0,
                image: item.productDetails?.image || 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=300&h=300&fit=crop&crop=center',
                rating: item.productDetails?.rating || 4.0,
                reviewCount: item.productDetails?.reviewCount || 0,
                discount: item.productDetails?.discount || 0,
                category: item.productDetails?.category || 'General',
                subCategory: item.productDetails?.subCategory || '',
                weight: item.productDetails?.weightInKg ? `${item.productDetails.weightInKg}kg` : 'N/A',
                originalPrice: item.productDetails?.originalPrice
              },
              quantity: item.quantity || 1,
              addedAt: new Date(item.addedAt || Date.now()),
              fetchError: item.fetchError
            }))
          }
        });

        console.log('🎉 =======================================');
        console.log('🎉 CART CONTEXT: CART SYNC COMPLETED SUCCESSFULLY');
        console.log('🎉 Local cart updated with server data');
        console.log('🎉 =======================================');
        
      } else {
        console.log('❌ =======================================');
        console.log('❌ API CART: Failed to sync cart from server');
        console.log('❌ API CART: Error:', response.error);
        console.log('❌ =======================================');
      }
    } catch (error) {
      console.error('💥 =======================================');
      console.error('💥 API CART: Error syncing cart from server');
      console.error('💥 Error:', error);
      console.error('💥 Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('💥 =======================================');
    } finally {
      syncInProgressRef.current = false;
      setIsSyncing(false);
    }
  }, []);

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
      addOrUpdateToCart,
      syncCartFromServer,
      isSyncing,
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