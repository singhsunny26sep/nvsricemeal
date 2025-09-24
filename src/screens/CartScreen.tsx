import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { Product } from '../constants/products';
import { theme } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
const { width } = Dimensions.get('window');

interface CartItemProps {
  item: { product: Product; quantity: number; addedAt: Date };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onSaveForLater: (productId: string) => void;
}

const deliverySlots = [
  'Today (2-4 PM)',
  'Today (4-6 PM)',
  'Today (6-8 PM)',
  'Tomorrow (10 AM-12 PM)',
  'Tomorrow (2-4 PM)',
  'Tomorrow (4-6 PM)',
  'Day after tomorrow (10 AM-12 PM)',
];

const addresses = [
  {
    id: 1,
    type: 'Home',
    name: 'John Doe',
    address: '123 Main Street, Mumbai',
    pincode: '400001',
    phone: '+91 9876543210',
  },
  {
    id: 2,
    type: 'Office',
    name: 'John Doe',
    address: '456 Business District, Mumbai',
    pincode: '400002',
    phone: '+91 9876543210',
  },
];

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove, onSaveForLater }) => {
  const totalPrice = item.product.price * item.quantity;
  const discountAmount = item.product.discount ? (item.product.price * item.product.discount / 100) * item.quantity : 0;
  const finalPrice = totalPrice - discountAmount;

  return (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.cartImage}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=200&h=200&fit=crop&crop=center' }}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>₹{item.product.price} each</Text>
        {item.product.discount && (
          <Text style={styles.discountText}>{item.product.discount}% OFF</Text>
        )}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
            onPress={() => item.quantity > 1 && onUpdateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity >= 10 && styles.disabledButton]}
            onPress={() => item.quantity < 10 && onUpdateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= 10}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.totalPrice}>Total: ₹{finalPrice}</Text>
        {!item.product.inStock && (
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveForLaterButton}
            onPress={() => onSaveForLater(item.product.id)}
          >
            <Text style={styles.saveForLaterText}>Save for Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(item.product.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>

        {/* Product Specifications */}
        <View style={styles.specsContainer}>
          <Text style={styles.specsText}>📦 {item.product.weight} • ⭐ {item.product.rating} ({item.product.reviewCount} reviews)</Text>
          {item.product.specifications && (
            <Text style={styles.specsText}>🌾 Origin: {item.product.specifications.origin}</Text>
          )}
          {item.product.nutritionInfo && (
            <Text style={styles.specsText}>🔥 {item.product.nutritionInfo.calories} per serving</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const CartScreen: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCart,
    applyCoupon,
    removeCoupon,
    setPincode,
    clearCart
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState(cart.pincode);
  const [giftMessage, setGiftMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState('');
  const [showDeliverySlots, setShowDeliverySlots] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Calculate price breakdown
  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalDiscount = cart.items.reduce((sum, item) => {
    const discountAmount = item.product.discount ? (item.product.price * item.product.discount / 100) * item.quantity : 0;
    return sum + discountAmount;
  }, 0);
  const totalAfterDiscount = subtotal - totalDiscount;
  const tax = Math.round(totalAfterDiscount * 0.18); // 18% GST
  const giftCharges = isGift ? 25 : 0;
  const finalTotal = totalAfterDiscount + cart.deliveryCharges + tax - cart.couponDiscount + giftCharges;

  const handleApplyCoupon = () => {
    if (couponInput.toUpperCase() === 'SAVE10') {
      applyCoupon('SAVE10', 50);
      Alert.alert('Success', 'Coupon applied successfully!');
    } else if (couponInput.toUpperCase() === 'RICE20') {
      applyCoupon('RICE20', Math.round(totalAfterDiscount * 0.2));
      Alert.alert('Success', 'Coupon applied successfully!');
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid coupon code.');
    }
    setCouponInput('');
  };

  const handlePincodeCheck = () => {
    if (pincodeInput.length === 6) {
      // Simulate pincode validation
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

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add some products.');
    } else if (!cart.isDeliveryAvailable) {
      Alert.alert('Delivery Not Available', 'Please check delivery availability for your area.');
    } else {
      showPaymentOptions();
    }
  };

  const showPaymentOptions = () => {
    Alert.alert(
      'Choose Payment Method',
      `Order Total: ₹${finalTotal}\n\nSelect your preferred payment method:`,
      [
        {
          text: 'Cash on Delivery',
          onPress: () => processOrder('Cash on Delivery')
        },
        {
          text: 'Online Payment',
          onPress: () => showOnlinePaymentOptions()
        },
        {
          text: 'Wallet Payment',
          onPress: () => processOrder('Wallet Payment')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const showOnlinePaymentOptions = () => {
    Alert.alert(
      'Online Payment',
      'Choose payment method:',
      [
        {
          text: 'Credit/Debit Card',
          onPress: () => processOrder('Credit/Debit Card')
        },
        {
          text: 'Net Banking',
          onPress: () => processOrder('Net Banking')
        },
        {
          text: 'UPI',
          onPress: () => processOrder('UPI')
        },
        {
          text: 'Paytm',
          onPress: () => processOrder('Paytm')
        },
        {
          text: 'PhonePe',
          onPress: () => processOrder('PhonePe')
        },
        {
          text: 'Google Pay',
          onPress: () => processOrder('Google Pay')
        },
        {
          text: 'Back',
          style: 'cancel'
        }
      ]
    );
  };

  const processOrder = (paymentMethod: string) => {
    const giftCharges = isGift ? 25 : 0;
    const finalTotalWithGift = finalTotal + giftCharges;

    const orderSummary = `
Order placed successfully! 🎉

Payment Method: ${paymentMethod}
Order Total: ₹${finalTotalWithGift}

Items:
${cart.items.map(item => `${item.product.name} x${item.quantity} - ₹${item.product.price * item.quantity}`).join('\n')}

${isGift ? `🎁 Gift Message: ${giftMessage || 'No message'}` : ''}
${specialInstructions ? `📝 Special Instructions: ${specialInstructions}` : ''}

Delivery Address: ${cart.pincode || 'Not specified'}
Expected Delivery: ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Thank you for shopping with NVS Rice Mall!
Your order will be processed within 24 hours.
    `;

    Alert.alert(
      'Order Confirmed! 🎉',
      orderSummary,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            clearCart();
            setIsGift(false);
            setGiftMessage('');
            setSpecialInstructions('');
          }
        },
        {
          text: 'View Order History',
          onPress: () => {
            clearCart();
            setIsGift(false);
            setGiftMessage('');
            setSpecialInstructions('');
            // Navigate to order history (you can implement navigation here)
          }
        }
      ]
    );
  };

  const handleShareCart = () => {
    const cartSummary = cart.items.map(item =>
      `${item.product.name} (Qty: ${item.quantity}) - ₹${item.product.price * item.quantity}`
    ).join('\n');
    Alert.alert('Share Cart', `Check out my cart:\n\n${cartSummary}\n\nTotal: ₹${finalTotal}`);
  };

  const handleDeliverySlotSelect = (slot: string) => {
    setSelectedDeliverySlot(slot);
    setShowDeliverySlots(false);
    Alert.alert('Delivery Slot Selected', `Your order will be delivered ${slot}`);
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddress(addressId);
    setShowAddressModal(false);
    Alert.alert('Address Selected', 'Delivery address updated successfully');
  };

  const renderDeliverySlotModal = () => (
    <Modal
      visible={showDeliverySlots}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDeliverySlots(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Delivery Slot</Text>
          <FlatList
            data={deliverySlots}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.slotItem}
                onPress={() => handleDeliverySlotSelect(item)}
              >
                <Text style={styles.slotText}>{item}</Text>
                <Icon name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowDeliverySlots(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAddressModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Delivery Address</Text>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressItem,
                selectedAddress === address.id && styles.selectedAddressItem,
              ]}
              onPress={() => handleAddressSelect(address.id)}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressType}>{address.type}</Text>
                <Icon
                  name={selectedAddress === address.id ? "radio-button-checked" : "radio-button-unchecked"}
                  size={20}
                  color={selectedAddress === address.id ? "#4CAF50" : "#666"}
                />
              </View>
              <Text style={styles.addressName}>{address.name}</Text>
              <Text style={styles.addressDetails}>{address.address}</Text>
              <Text style={styles.addressDetails}>{address.pincode}</Text>
              <Text style={styles.addressPhone}>{address.phone}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAddressModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderProductRecommendations = () => {
    if (!showRecommendations || cart.items.length === 0) return null;

    const recommendedProducts = [
      {
        id: 'rec1',
        name: 'Premium Basmati Rice',
        price: 120,
        image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=200&h=200&fit=crop&crop=center',
        rating: 4.5,
        reviewCount: 128,
      },
      {
        id: 'rec2',
        name: 'Organic Brown Rice',
        price: 95,
        image: 'https://images.unsplash.com/photo-1559054663-e431ec5e6e13?w=200&h=200&fit=crop&crop=center',
        rating: 4.3,
        reviewCount: 89,
      },
    ];

    return (
      <View style={styles.recommendationsContainer}>
        <View style={styles.recommendationsHeader}>
          <Text style={styles.recommendationsTitle}>You might also like</Text>
          <TouchableOpacity onPress={() => setShowRecommendations(false)}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={recommendedProducts}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recommendationItem}>
              <Image source={{ uri: item.image }} style={styles.recommendationImage} />
              <Text style={styles.recommendationName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.recommendationPrice}>₹{item.price}</Text>
              <View style={styles.recommendationRating}>
                <Icon name="star" size={12} color="#FFD700" />
                <Text style={styles.recommendationRatingText}>{item.rating}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendationsList}
        />
      </View>
    );
  };

  return (
    <ScrollView  style={styles.container}>
      <Text style={styles.header}>Shopping Cart</Text>

      {cart.items.length === 0 && cart.savedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some rice products to get started!</Text>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          {cart.items.length > 0 && (
            <>
              <Text style={[styles.header, { fontSize: 18, marginTop: 10, marginBottom: 5 }]}>Cart Items ({cart.items.length})</Text>
              <FlatList
                data={cart.items}
                renderItem={({ item }) => (
                  <CartItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    onSaveForLater={saveForLater}
                  />
                )}
                keyExtractor={(item) => item.product.id}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
              />
            </>
          )}

          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <Text style={[styles.header, { fontSize: 18, marginBottom: 15 }]}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal ({cart.items.length} items)</Text>
              <Text style={styles.priceValue}>₹{subtotal}</Text>
            </View>
            {totalDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Discount</Text>
                <Text style={[styles.priceValue, { color: '#4CAF50' }]}>-₹{totalDiscount}</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Charges</Text>
              <Text style={styles.priceValue}>₹{cart.deliveryCharges}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (GST 18%)</Text>
              <Text style={styles.priceValue}>₹{tax}</Text>
            </View>
            {cart.couponDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Coupon ({cart.couponCode})</Text>
                <Text style={[styles.priceValue, { color: '#4CAF50' }]}>-₹{cart.couponDiscount}</Text>
              </View>
            )}
            {giftCharges > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Gift Wrapping</Text>
                <Text style={styles.priceValue}>₹{giftCharges}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{finalTotal}</Text>
            </View>
          </View>

        
          {/* Delivery Section */}
          <View style={styles.deliveryContainer}>
            <Text style={[styles.header, { fontSize: 16, marginBottom: 10 }]}>Delivery Details</Text>
            <TextInput
              style={styles.pincodeInput}
              placeholder="Enter pincode"
              value={pincodeInput}
              onChangeText={setPincodeInput}
              keyboardType="numeric"
              maxLength={6}
            />
            <TouchableOpacity style={styles.applyButton} onPress={handlePincodeCheck}>
              <Text style={styles.applyButtonText}>Check Delivery</Text>
            </TouchableOpacity>
            <Text style={styles.deliveryText}>
              {cart.pincode ? `Pincode: ${cart.pincode}` : 'Enter pincode to check delivery availability'}
            </Text>
            <Text style={[styles.deliveryText, { color: cart.isDeliveryAvailable ? '#4CAF50' : '#f44336' }]}>
              {cart.isDeliveryAvailable ? '✓ Delivery available' : '✗ Delivery not available'}
            </Text>

            {/* Delivery Slot Selection */}
            {cart.isDeliveryAvailable && (
              <TouchableOpacity
                style={styles.deliverySlotButton}
                onPress={() => setShowDeliverySlots(true)}
              >
                <Text style={styles.deliverySlotText}>
                  {selectedDeliverySlot || 'Select Delivery Slot'}
                </Text>
                <Icon name="schedule" size={20} color="#666" />
              </TouchableOpacity>
            )}

            {/* Address Selection */}
            <TouchableOpacity
              style={styles.addressButton}
              onPress={() => setShowAddressModal(true)}
            >
              <Text style={styles.addressButtonText}>Select Delivery Address</Text>
              <Icon name="location-on" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* Gift Options */}
          <View style={styles.deliveryContainer}>
            
            {isGift && (
              <>
                <TextInput
                  style={[styles.couponInput, { marginTop: 10 }]}
                  placeholder="Gift message (optional)"
                  value={giftMessage}
                  onChangeText={setGiftMessage}
                  multiline
                  numberOfLines={2}
                  maxLength={100}
                />
                <Text style={styles.deliveryText}>
                  Gift wrapping charges: ₹25 (will be added to total)
                </Text>
              </>
            )}
          </View>

          {/* Special Instructions */}
          <View style={styles.deliveryContainer}>
            <Text style={[styles.header, { fontSize: 16, marginBottom: 10 }]}>Special Instructions</Text>
            <TextInput
              style={[styles.couponInput, { height: 60 }]}
              placeholder="Any special delivery instructions..."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.deliveryText}>
              {200 - specialInstructions.length} characters remaining
            </Text>
          </View>

          {/* Saved Items */}
          {cart.savedItems.length > 0 && (
            <View style={styles.savedItemsContainer}>
              <Text style={styles.savedItemsHeader}>Saved for Later ({cart.savedItems.length})</Text>
              {cart.savedItems.map((savedItem) => (
                <View key={savedItem.product.id} style={styles.savedItem}>
                  <Image
                    source={{ uri: savedItem.product.image }}
                    style={[styles.cartImage, { width: 50, height: 50 }]}
                  />
                  <View style={styles.savedItemInfo}>
                    <Text style={styles.savedItemName}>{savedItem.product.name}</Text>
                    <Text style={styles.savedItemPrice}>₹{savedItem.product.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moveToCartButton}
                    onPress={() => moveToCart(savedItem.product.id)}
                  >
                    <Text style={styles.moveToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Product Recommendations */}
          {renderProductRecommendations()}

          {/* Action Buttons */}
          <View style={[styles.totalContainer, { position: 'relative', marginTop: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <TouchableOpacity
                style={[styles.checkoutButton, { flex: 1, marginRight: 10 }]}
                onPress={handleShareCart}
              >
                <Text style={styles.checkoutButtonText}>Share Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkoutButton, { flex: 1, marginLeft: 10, backgroundColor: '#FF9800' }]}
                onPress={clearCart}
              >
                <Text style={styles.checkoutButtonText}>Clear Cart</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Delivery Slot Modal */}
      {renderDeliverySlotModal()}

      {/* Address Selection Modal */}
      {renderAddressModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginBottom:100
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: '#ddd',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  outOfStockText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  saveForLaterButton: {
    backgroundColor: '#2196F3',
    padding: 6,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveForLaterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceBreakdown: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  couponContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  couponInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  couponText: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  deliveryContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  pincodeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  deliveryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  savedItemsContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  savedItemsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  savedItemInfo: {
    flex: 1,
  },
  savedItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  savedItemPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moveToCartButton: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 4,
    marginLeft: 10,
  },
  moveToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  specsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  specsText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  giftToggle: {
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    maxHeight: '70%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  slotText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addressItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedAddressItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationItem: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  recommendationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    height: 32,
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  recommendationRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationRatingText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  recommendationsList: {
    paddingHorizontal: 5,
  },
  deliverySlotButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
  },
  deliverySlotText: {
    fontSize: 14,
    color: '#333',
  },
  addressButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: '#F1F8E9',
  },
  addressButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default CartScreen;