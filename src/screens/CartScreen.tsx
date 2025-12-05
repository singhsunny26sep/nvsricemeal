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
} from 'react-native';
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
  const { cart, removeFromCart, updateQuantity, applyCoupon, setPincode, clearCart } = useCart();
  const { auth } = useAuth();
  const { strings } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState(cart.pincode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessWave, setShowSuccessWave] = useState(false);

  // Animation refs
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

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
  const handleRazorpayPayment = () => {
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
          Alert.alert(
            'Payment Successful! 🎉',
            `Payment ID: ${data.razorpay_payment_id}\n\nYour order has been placed successfully!\n\nTotal: ₹${finalTotal}\nDelivery: 1-2 days\n\nThank you for shopping with NVS Rice Mall!`,
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

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add some products.');
      return;
    }
    if (!cart.isDeliveryAvailable) {
      Alert.alert('Delivery Not Available', 'Please check delivery availability for your area.');
      return;
    }

    Alert.alert(
      'Choose Payment Method',
      `Order Total: ₹${finalTotal}\n\nSelect your preferred payment method:`,
      [
        {
          text: 'Cash on Delivery',
          onPress: () => {
            Alert.alert(
              'Order Confirmed! 🎉',
              `Your order has been placed successfully!\n\nTotal: ₹${finalTotal}\nDelivery: 1-2 days\n\nThank you for shopping with NVS Rice Mall!`,
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
          onPress: handleRazorpayPayment
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{strings?.cart?.title || 'Shopping Cart'}</Text>
          {cart.items.length > 0 && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Icon name="delete-sweep" size={20} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>

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

              {/* Coupon Section */}
              <View style={styles.couponContainer}>
                <Text style={styles.sectionTitle}>Have a coupon?</Text>
                <View style={styles.couponInputContainer}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.applyButton} onPress={handleApplyCoupon}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
                {cart.couponCode && (
                  <Text style={styles.appliedCouponText}>
                    Applied: {cart.couponCode} (-₹{cart.couponDiscount})
                  </Text>
                )}
              </View>

              {/* Delivery Section */}
              <View style={styles.deliveryContainer}>
                <Text style={styles.sectionTitle}>Delivery Details</Text>
                <View style={styles.pincodeContainer}>
                  <TextInput
                    style={styles.pincodeInput}
                    placeholder="Enter pincode"
                    value={pincodeInput}
                    onChangeText={setPincodeInput}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity style={styles.checkButton} onPress={handlePincodeCheck}>
                    <Text style={styles.checkButtonText}>Check</Text>
                  </TouchableOpacity>
                </View>
                {cart.pincode && (
                  <Text style={[styles.deliveryStatus, { color: cart.isDeliveryAvailable ? '#4CAF50' : '#f44336' }]}>
                    {cart.isDeliveryAvailable ? '✓ Delivery available' : '✗ Delivery not available'}
                  </Text>
                )}
              </View>
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
});

export default CartScreen;