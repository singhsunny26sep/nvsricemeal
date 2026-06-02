import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/apiService';
import { theme } from '../constants/theme';
import { Header } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

// Types for order data (enhanced with optional fields from API)
interface OrderItem {
  _id: string;
  cartId?: string;
  locationId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product: {
      _id: string;
      name: string;
      brand: string;
      generalPrice: number;
      SKU: string;
      weightInKg: number;
      image: string | null;
      isActive: boolean;
      isDeleted: boolean;
    };
  }>;
  distanceKm?: number;
  deliveryCharge?: number;
  subTotal: number;
  payableAmount: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

// API response structure
interface OrdersApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    data: OrderItem[];
  };
}

export default function OrderHistoryScreen() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID once and store it
  const fetchUserId = useCallback(async () => {
    if (userId) return userId;
    try {
      const profileResponse = await apiService.getUserProfile();
      const id = profileResponse.data.id;
      setUserId(id);
      return id;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw new Error('Unable to fetch user profile');
    }
  }, [userId]);

  // Fetch orders with pagination support
  const fetchOrders = useCallback(async (page: number, shouldAppend: boolean = false) => {
    try {
      const uid = await fetchUserId();
      if (!uid) throw new Error('User ID not found');

      // Assuming apiService.getOrdersByUserId accepts userId, page, limit
      const response = await apiService.getOrdersByUserId(uid, page, 10);
      
      console.log(`📦 Orders API response (page ${page}):`, response);
      
      if (response.success && response.data?.data?.data) {
        const newOrders = response.data.data.data;
        const totalPagesFromApi = response.data.data.totalPages || 1;
        
        setTotalPages(totalPagesFromApi);
        setCurrentPage(page);
        
        if (shouldAppend) {
          setOrders(prevOrders => [...prevOrders, ...newOrders]);
        } else {
          setOrders(newOrders);
        }
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch orders');
        if (!shouldAppend) setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('An error occurred while fetching orders');
      if (!shouldAppend) setOrders([]);
    }
  }, [fetchUserId]);

  // Initial load
  useEffect(() => {
    const loadInitialOrders = async () => {
      setLoading(true);
      await fetchOrders(1, false);
      setLoading(false);
    };
    loadInitialOrders();
  }, [fetchOrders]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders(1, false);
    setRefreshing(false);
  }, [fetchOrders]);

  // Load more handler for pagination
  const loadMoreOrders = useCallback(async () => {
    if (loadingMore || currentPage >= totalPages) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchOrders(nextPage, true);
    setLoadingMore(false);
  }, [currentPage, totalPages, loadingMore, fetchOrders]);

  // Helper: Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Helper: Get status style
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return { bg: '#FFF3E0', text: theme.colors.gold || '#FF9800' };
      case 'CONFIRMED':
        return { bg: '#E8F5E9', text: theme.colors.success || '#4CAF50' };
      case 'PROCESSING':
        return { bg: '#E3F2FD', text: theme.colors.secondary || '#2196F3' };
      case 'DELIVERED':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'CANCELLED':
        return { bg: '#FFEBEE', text: theme.colors.error || '#F44336' };
      case 'RETURNED':
        return { bg: '#FFF3E0', text: '#FF9800' };
      default:
        return { bg: '#F5F5F5', text: theme.colors.textSecondary || '#757575' };
    }
  };

  // Render product images strip
  const renderProductImages = (items: OrderItem['items']) => {
    const displayItems = items.slice(0, 3);
    const remainingCount = items.length - 3;
    
    return (
      <View style={styles.imagesContainer}>
        {displayItems.map((item, index) => (
          <View key={index} style={styles.productImageWrapper}>
            {item.product.image ? (
              <Image
                source={{ uri: item.product.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No img</Text>
              </View>
            )}
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={styles.moreItemsBadge}>
            <Text style={styles.moreItemsText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  // Render single order card
  const renderOrder = ({ item }: { item: OrderItem }) => {
    const { date, time } = formatDateTime(item.createdAt);
    const totalItems = item.items.reduce((sum, i) => sum + i.quantity, 0);
    const statusStyle = getStatusStyle(item.status);
    const hasDeliveryInfo = item.distanceKm !== undefined && item.deliveryCharge !== undefined;

    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.card}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order #</Text>
            <Text style={styles.orderId}>{item._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Date & Items Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          <View style={styles.itemsCountContainer}>
            <Text style={styles.itemsCount}>{totalItems}</Text>
            <Text style={styles.itemsLabel}>item{totalItems !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Product Images Strip */}
        {renderProductImages(item.items)}

        {/* Pricing & Delivery Info */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{item.subTotal}</Text>
          </View>
          {hasDeliveryInfo && item.deliveryCharge ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Delivery {'('}{(item.distanceKm || 0).toFixed(1)} km{')'}
              </Text>
              <Text style={styles.priceValue}>₹{item.deliveryCharge}</Text>
            </View>
          ) : null}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{item.payableAmount}</Text>
          </View>
        </View>

        {/* Payment Method Footer */}
        <View style={styles.paymentFooter}>
          <Text style={styles.paymentMethodText}>
            💳 {item.paymentMethod === 'COD' ? 'Cash on Delivery' : item.paymentMethod}
          </Text>
          {item.paymentStatus && (
            <Text style={styles.paymentStatusText}>
              {item.paymentStatus === 'NOT_REQUIRED' ? '✓ No payment required' : item.paymentStatus}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Footer loader for pagination
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more orders...</Text>
      </View>
    );
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>When you place an order, it will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <Text style={{
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.large,
      }}>
        Your Orders
      </Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMoreOrders}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#F8F9FA',
  },
  listContent: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    backgroundColor: theme.colors.background || '#F8F9FA',
  },
  // Card Styles
  card: {
    backgroundColor: theme.colors.card || '#FFFFFF',
    borderRadius: 20,
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  orderIdLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  orderId: {
    fontSize: theme.fonts.size.medium,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    paddingBottom: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF0F2',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  timeText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  itemsCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  itemsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  itemsLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  // Product Images
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.medium,
    gap: 8,
  },
  productImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F2F3F5',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8EAED',
  },
  placeholderText: {
    fontSize: 10,
    color: '#9AA0A6',
  },
  moreItemsBadge: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Price Section
  priceSection: {
    backgroundColor: '#F8F9FC',
    borderRadius: 16,
    padding: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: theme.fonts.size.small,
    fontWeight: '500',
    color: theme.colors.text,
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  paymentStatusText: {
    fontSize: 12,
    color: theme.colors.success || '#2E7D32',
    fontWeight: '500',
  },
  // Footer Loader
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.large,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
  },
  // Loading / Error / Empty
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.medium,
  },
  errorText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: theme.spacing.small,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: theme.fonts.size.medium,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.medium,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  emptySubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});