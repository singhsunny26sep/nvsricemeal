import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';

const { width } = Dimensions.get('window');

interface CartItemProps {
  item: { product: any; quantity: number; addedAt: Date };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  // Calculate individual item prices correctly
  const productPrice = item.product.price || 0;
  const productDiscount = item.product.discount || 0;
  
  // Calculate total price without discount
  const totalPrice = productPrice * item.quantity;
  
  // Calculate discount amount per item and then for quantity
  const discountPerItem = productPrice * (productDiscount / 100);
  const totalDiscountAmount = discountPerItem * item.quantity;
  
  // Final price after discount
  const finalPrice = totalPrice - totalDiscountAmount;

  return (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.cartImage}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=200&h=200&fit=crop&crop=center' }}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>₹{productPrice} each</Text>
        {productDiscount > 0 && (
          <Text style={styles.discountText}>{productDiscount}% OFF</Text>
        )}

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
            onPress={() => item.quantity > 1 && onUpdateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Icon name="remove" size={16} color="white" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity >= 10 && styles.disabledButton]}
            onPress={() => item.quantity < 10 && onUpdateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= 10}
          >
            <Icon name="add" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceWrapper}>
            {productDiscount > 0 && (
              <Text style={styles.originalPrice}>₹{totalPrice}</Text>
            )}
            <Text style={styles.totalPrice}>₹{finalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(item.product.id)}
          >
            <Icon name="delete-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CartScreen: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, applyCoupon, setPincode, clearCart, syncCartFromServer, isSyncing } = useCart();
  const { auth } = useAuth();
  const { strings } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState(cart.pincode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessWave, setShowSuccessWave] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const hasSyncedRef = useRef(false);

  // Animation refs
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Sync cart data from server when component mounts (only once per session)
  useEffect(() => {
    const syncCartData = async () => {
      if (auth?.user && !hasSyncedRef.current) {
        hasSyncedRef.current = true;
        setSyncError('');
        console.log('🛒 CartScreen: Syncing cart data from server...');
        
        try {
          await syncCartFromServer();
          console.log('✅ CartScreen: Cart data synced successfully');
        } catch (error) {
          console.error('❌ CartScreen: Failed to sync cart data:', error);
          setSyncError('Failed to load cart data. Please try again.');
          hasSyncedRef.current = false; // Reset flag on error
        }
      }
    };

    // Add a small delay to prevent immediate sync on mount
    const timeoutId = setTimeout(syncCartData, 500);
    return () => clearTimeout(timeoutId);
  }, [auth?.user]); // Remove syncCartFromServer from dependencies

  // Manual sync function
  const handleSyncCart = async () => {
    setSyncError('');
    
    try {
      await syncCartFromServer();
      console.log('✅ CartScreen: Manual cart sync successful');
    } catch (error) {
      console.error('❌ CartScreen: Manual cart sync failed:', error);
      setSyncError('Failed to sync cart data. Please try again.');
    }
  };

  // Calculate totals correctly
  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    cart.items.forEach(item => {
      const productPrice = item.product.price || 0;
      const productDiscount = item.product.discount || 0;
      const quantity = item.quantity;
      
      // Subtotal (without any discounts)
      subtotal += productPrice * quantity;
      
      // Calculate discount amount
      const discountPerItem = productPrice * (productDiscount / 100);
      totalDiscount += discountPerItem * quantity;
    });

    const totalAfterDiscount = subtotal - totalDiscount;
    const deliveryCharges = cart.isDeliveryAvailable ? 40 : 0;
    
    // Apply coupon discount on the discounted total
    const couponDiscount = cart.couponDiscount || 0;
    const finalTotal = Math.max(0, totalAfterDiscount + deliveryCharges - couponDiscount);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalAfterDiscount: Number(totalAfterDiscount.toFixed(2)),
      deliveryCharges,
      couponDiscount,
      finalTotal: Number(finalTotal.toFixed(2))
    };
  };

  const {
    subtotal,
    totalDiscount,
    totalAfterDiscount,
    deliveryCharges,
    couponDiscount,
    finalTotal
  } = calculateTotals();

  const handleApplyCoupon = () => {
    if (couponInput.trim() === '') {
      Alert.alert('Error', 'Please enter a coupon code.');
      return;
    }

    if (couponInput.toUpperCase() === 'SAVE10') {
      // Fixed discount of ₹50
      applyCoupon('SAVE10', 50);
      Alert.alert('Success', 'Coupon applied successfully! You saved ₹50.');
    } else if (couponInput.toUpperCase() === 'RICE20') {
      // 20% discount on total after product discounts
      const discountAmount = Math.round(totalAfterDiscount * 0.2);
      applyCoupon('RICE20', discountAmount);
      Alert.alert('Success', `Coupon applied successfully! You saved ₹${discountAmount}.`);
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid coupon code.');
    }
    setCouponInput('');
  };

  const handlePincodeCheck = () => {
    if (pincodeInput.length === 6 && /^\d+$/.test(pincodeInput)) {
      const isAvailable = pincodeInput.startsWith('1') || pincodeInput.startsWith('2') || pincodeInput.startsWith('3');
      setPincode(pincodeInput, isAvailable);
      Alert.alert(
        isAvailable ? 'Delivery Available' : 'Delivery Not Available',
        isAvailable ? 'We deliver to your area!' : 'Sorry, we don\'t deliver to this area yet.'
      );
    } else {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
    }
  };

  // Success Wave Animation
  const startSuccessAnimation = () => {
    setShowSuccessWave(true);

    // Wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade out after 3 seconds
    setTimeout(() => {
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessWave(false);
        fadeAnimation.setValue(1);
        waveAnimation.setValue(0);
      });
    }, 3000);
  };

  // Razorpay Integration
  const handleRazorpayPayment = (selectedAddress?: any) => {
    setIsLoading(true);

    const options = {
      description: 'Payment for NVS Rice Mall Order',
      image: 'https://your-logo-url.com/logo.png',
      currency: 'INR',
      key: 'rzp_test_your_key_here', // Replace with your Razorpay key
      amount: Math.round(finalTotal * 100), // Amount in paise (rounded)
      name: 'NVS Rice Mall',
      prefill: {
        email: auth?.user?.email || 'customer@example.com',
        contact: auth?.user?.phone || '9876543210',
        name: auth?.user?.name || 'Customer Name'
      },
      theme: { color: '#28a745' }
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        // Payment successful
        setIsLoading(false);
        startSuccessAnimation();

        setTimeout(() => {
          const addressInfo = selectedAddress ?
            `\n\nDelivery Address:\n${selectedAddress.name} - ${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}` :
            '';
            
          Alert.alert(
            'Payment Successful! 🎉',
            `Payment ID: ${data.razorpay_payment_id}\n\nYour order has been placed successfully!${addressInfo}\n\nTotal: ₹${finalTotal}\nDelivery: 1-2 days\n\nThank you for shopping with NVS Rice Mall!`,
            [
              {
                text: 'Continue Shopping',
                onPress: () => clearCart()
              }
            ]
          );
        }, 3500);
      })
      .catch((error: any) => {
        setIsLoading(false);
        Alert.alert('Payment Failed', 'Payment was cancelled or failed. Please try again.');
        console.log('Razorpay error:', error);
      });
  };

  // Fetch addresses from API
  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      // Get stored token from AsyncStorage (like other API calls)
      const storedToken = await AsyncStorage.getItem('userToken');
      
      if (!storedToken) {
        Alert.alert('Error', 'User token not found. Please login again.');
        setIsLoadingAddresses(false);
        return;
      }

      const response = await fetch('https://nvs-rice-mart.onrender.com/nvs-rice-mart/locations/getAll?country=india', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.data) {
        // Transform API response to match our address format
        const transformedAddresses = data.data.data.map((location: any, index: number) => ({
          id: location._id,
          name: location.name || `Location ${index + 1}`,
          fullName: auth?.user?.name || 'Customer Name',
          phone: auth?.user?.phone || '9876543210',
          address: location.address || '',
          area: location.area || '',
          city: location.city || '',
          district: location.district || '',
          state: location.state || '',
          country: location.country || '',
          pincode: location.zipcode || '',
          formattedAddress: location.formattedAddress || '',
          coordinates: location.coordinates || [],
          isDefault: index === 0 // First location as default
        }));
        
        setSavedAddresses(transformedAddresses);
        console.log('✅ Addresses fetched successfully:', transformedAddresses.length);
      } else {
        console.log('❌ Failed to fetch addresses:', data.message);
        Alert.alert('Error', data.message || 'Failed to load delivery locations');
        setSavedAddresses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to load delivery locations. Please try again.');
      setSavedAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Address Selection Handlers
  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
    
    // After address selection, show payment options
    setTimeout(() => {
      const displayAddress = address.formattedAddress ||
        `${address.area ? address.area + ', ' : ''}${address.city}, ${address.district}, ${address.state} - ${address.pincode}`;
        
      Alert.alert(
        'Choose Payment Method',
        `Order Total: ₹${finalTotal}\n\nDelivery Address:\n${address.name}\n${displayAddress}\n\nSelect your preferred payment method:`,
        [
          {
            text: 'Cash on Delivery',
            onPress: () => {
              Alert.alert(
                'Order Confirmed! 🎉',
                `Your order has been placed successfully!\n\nDelivery Address:\n${address.name}\n${displayAddress}\n\nTotal: ₹${finalTotal}\nDelivery: 1-2 days\n\nThank you for shopping with NVS Rice Mall!`,
                [
                  {
                    text: 'Continue Shopping',
                    onPress: () => clearCart()
                  }
                ]
              );
            }
          },
          {
            text: 'Pay Online (Razorpay)',
            onPress: () => handleRazorpayPayment(address)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }, 300);
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add some products.');
      return;
    }
    if (!cart.isDeliveryAvailable) {
      Alert.alert('Delivery Not Available', 'Please check delivery availability for your area.');
      return;
    }

    // Fetch addresses first, then show modal
    await fetchAddresses();
    setShowAddressModal(true);
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonItem}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonPrice} />
            <View style={styles.skeletonQuantity} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={{marginBottom: 64}}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{strings?.cart?.title || 'Shopping Cart'}</Text>
          <View style={styles.headerButtons}>
            {auth?.user && (
              <TouchableOpacity
                onPress={handleSyncCart}
                style={styles.syncButton}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#007bff" />
                ) : (
                  <Icon name="sync" size={20} color="#007bff" />
                )}
              </TouchableOpacity>
            )}
            {cart.items.length > 0 && (
              <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
                <Icon name="delete-sweep" size={20} color="#f44336" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sync Error Message */}
        {syncError && (
          <View style={styles.errorContainer}>
            <Icon name="error" size={16} color="#f44336" />
            <Text style={styles.errorText}>{syncError}</Text>
            <TouchableOpacity onPress={() => setSyncError('')}>
              <Icon name="close" size={16} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}

        {/* Sync Status */}
        {isSyncing && (
          <View style={styles.syncStatusContainer}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.syncStatusText}>Syncing cart data from server...</Text>
          </View>
        )}

        {cart.items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{strings?.cart?.empty || 'Your cart is empty'}</Text>
            <Text style={styles.emptySubtext}>{strings?.cart?.emptyMessage || 'Add some rice products to get started!'}</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Cart Items */}
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <FlatList
                  data={cart.items}
                  renderItem={({ item }) => (
                    <CartItem
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  )}
                  keyExtractor={(item) => item.product.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContainer}
                />
              )}

          

              {/* Delivery Section */}
            
            </ScrollView>

            {/* Bottom Section - Price Breakdown & Checkout */}
            <View style={styles.bottomContainer}>
              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal ({cart.items.length} items)</Text>
                  <Text style={styles.priceValue}>₹{subtotal}</Text>
                </View>
                {totalDiscount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Product Discount</Text>
                    <Text style={[styles.priceValue, { color: '#4CAF50' }]}>-₹{totalDiscount}</Text>
                  </View>
                )}
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Charges</Text>
                  <Text style={styles.priceValue}>
                    {deliveryCharges > 0 ? `₹${deliveryCharges}` : 'FREE'}
                  </Text>
                </View>
                {couponDiscount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Coupon Discount ({cart.couponCode})</Text>
                    <Text style={[styles.priceValue, { color: '#4CAF50' }]}>-₹{couponDiscount}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>₹{finalTotal}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.checkoutButton, (!cart.isDeliveryAvailable || isLoading) && styles.disabledButton]}
                onPress={handleCheckout}
                disabled={!cart.isDeliveryAvailable || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.checkoutButtonText}>
                    {cart.isDeliveryAvailable ? `Place Order - ₹${finalTotal}` : 'Check Delivery Area'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Success Wave Animation */}
        {showSuccessWave && (
          <Animated.View style={[styles.successWaveContainer, { opacity: fadeAnimation }]}>
            <Animated.View
              style={[
                styles.wave,
                {
                  transform: [
                    {
                      scale: waveAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 2],
                      }),
                    },
                    {
                      rotate: waveAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.successContent}>
              <Icon name="check-circle" size={60} color="#4CAF50" />
              <Text style={styles.successText}>Payment Successful!</Text>
            </View>
          </Animated.View>
        )}

        {/* Address Selection Modal */}
        {showAddressModal && (
     
          <View style={styles.modalOverlay}>
            <View style={styles.addressModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Delivery Location</Text>
                <TouchableOpacity
                  onPress={() => setShowAddressModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {isLoadingAddresses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#28a745" />
                  <Text style={styles.loadingText}>Loading delivery locations...</Text>
                </View>
              ) : (
                <ScrollView style={styles.addressList} showsVerticalScrollIndicator={false}>
                  {savedAddresses.length > 0 ? (
                    savedAddresses.map((location) => {
                      const displayAddress = location.formattedAddress ||
                        `${location.area ? location.area + ', ' : ''}${location.city}, ${location.district}, ${location.state} - ${location.pincode}`;
                      
                      return (
                        <TouchableOpacity
                          key={location.id}
                          style={[
                            styles.addressCard,
                            selectedAddress?.id === location.id && styles.selectedAddressCard
                          ]}
                          onPress={() => handleAddressSelect(location)}
                        >
                          <View style={styles.addressHeader}>
                            <View style={styles.addressNameContainer}>
                              <Text style={styles.addressName}>{location.name}</Text>
                              {location.isDefault && (
                                <View style={styles.defaultBadge}>
                                  <Text style={styles.defaultBadgeText}>Default</Text>
                                </View>
                              )}
                            </View>
                            <Icon
                              name={selectedAddress?.id === location.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                              size={24}
                              color={selectedAddress?.id === location.id ? '#28a745' : '#ccc'}
                            />
                          </View>
                          
                          <Text style={styles.addressText}>{displayAddress}</Text>
                          <Text style={styles.addressText}>Pincode: {location.pincode}</Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.noAddressesContainer}>
                      <Icon name="location-off" size={48} color="#ccc" />
                      <Text style={styles.noAddressesText}>No delivery locations available</Text>
                      <Text style={styles.noAddressesSubtext}>Please try again later</Text>
                    </View>
                  )}
                </ScrollView>
              )}
              
              {selectedAddress && !isLoadingAddresses && (
                <TouchableOpacity
                  style={styles.confirmAddressButton}
                  onPress={() => handleAddressSelect(selectedAddress)}
                >
                  <Text style={styles.confirmAddressText}>
                    Deliver to: {selectedAddress.name}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#f44336',
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  syncStatusText: {
    fontSize: 14,
    color: '#1976d2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    backgroundColor: '#007bff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6c757d',
    textDecorationLine: 'line-through',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  couponContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  applyButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  appliedCouponText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 8,
    fontWeight: '500',
  },
  deliveryContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  pincodeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pincodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  checkButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  checkButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  deliveryStatus: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  priceBreakdown: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom:24
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Skeleton Loading Styles
  skeletonContainer: {
    padding: 16,
  },
  skeletonItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonPrice: {
    height: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    width: '60%',
    marginBottom: 8,
  },
  skeletonQuantity: {
    height: 32,
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    width: '80%',
  },
  // Success Wave Animation Styles
  successWaveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4CAF50',
    opacity: 0.3,
  },
  successContent: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  // Address Modal Styles
  modalOverlay: {
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
  addressModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  addressList: {
    maxHeight: 400,
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAddressCard: {
    borderColor: '#28a745',
    backgroundColor: '#f1f8f4',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    lineHeight: 18,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    marginTop: 8,
    gap: 8,
  },
  addAddressText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmAddressButton: {
    backgroundColor: '#28a745',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmAddressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading and Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noAddressesContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAddressesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  noAddressesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CartScreen;