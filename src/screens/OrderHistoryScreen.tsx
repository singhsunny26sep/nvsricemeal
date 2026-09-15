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
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/apiService';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

// ---------- Types ----------
interface ProductSnapshot {
  name: string;
  brand: string;
  SKU: string;
  image: string | null;
  weightInKg: number;
}

interface OrderProduct {
  _id: string;
  name: string;
  brand: string;
  generalPrice: number;
  SKU: string;
  weightInKg: number;
  image: string | null;
  isActive: boolean;
  isDeleted: boolean;
}

interface OrderLineItem {
  productId: string;
  quantity: number;
  price: number;
  productSnapshot?: ProductSnapshot;
  product: OrderProduct;
}

interface StatusHistoryEntry {
  status: string;
  changedBy?: string;
  changedByRole?: string;
  at: string;
  note?: string;
}

interface OrderItem {
  _id: string;
  orderNumber?: string;
  cartId?: string;
  locationId?: string;
  items: OrderLineItem[];
  distanceKm?: number;
  deliveryCharge?: number;
  subTotal: number;
  payableAmount: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  statusHistory?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  vendor?: { _id: string; shopName: string };
  deliveryLocation?: {
    name?: string;
    formattedAddress?: string;
    city?: string;
    zipcode?: string;
  };
}

// ---------- Colorful Status Config ----------
const ORDER_FLOW = ['PENDING', 'ACCEPTED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

interface StatusMeta {
  label: string;
  shortLabel: string;
  bg: string;        // light background
  border: string;    // strong border/accent
  text: string;      // strong text color
  solid: string;     // solid filled color (for nodes, pills, buttons)
  soft: string;      // soft tint (for tracker filled lines)
  icon: string;
  emoji: string;
  description: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  PENDING: {
    label: 'Order Placed',
    shortLabel: 'Placed',
    bg: '#FFF4E5',
    border: '#FF9800',
    text: '#B26500',
    solid: '#FF9800',
    soft: '#FFB74D',
    icon: '⏳',
    emoji: '🟠',
    description: 'Your order has been placed successfully',
  },
  ACCEPTED: {
    label: 'Order Accepted',
    shortLabel: 'Accepted',
    bg: '#E7F6EC',
    border: '#2E7D32',
    text: '#1B5E20',
    solid: '#2E7D32',
    soft: '#66BB6A',
    icon: '✅',
    emoji: '🟢',
    description: 'Seller has accepted your order',
  },
  PACKED: {
    label: 'Packed',
    shortLabel: 'Packed',
    bg: '#E5F0FF',
    border: '#1565C0',
    text: '#0D47A1',
    solid: '#1565C0',
    soft: '#42A5F5',
    icon: '📦',
    emoji: '🔵',
    description: 'Your order has been packed and is ready to ship',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    shortLabel: 'Shipped',
    bg: '#F1E7FF',
    border: '#6A1B9A',
    text: '#4A148C',
    solid: '#6A1B9A',
    soft: '#AB47BC',
    icon: '🚚',
    emoji: '🟣',
    description: 'Your order is out for delivery',
  },
  DELIVERED: {
    label: 'Delivered',
    shortLabel: 'Delivered',
    bg: '#DDF7E1',
    border: '#1B5E20',
    text: '#0B3D0B',
    solid: '#2E7D32',
    soft: '#81C784',
    icon: '✔️',
    emoji: '✅',
    description: 'Your order has been delivered',
  },
  CANCELLED: {
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    bg: '#FFE5E5',
    border: '#C62828',
    text: '#8E0000',
    solid: '#C62828',
    soft: '#EF5350',
    icon: '❌',
    emoji: '🔴',
    description: 'This order has been cancelled',
  },
  RETURNED: {
    label: 'Returned',
    shortLabel: 'Returned',
    bg: '#FFEFD5',
    border: '#E65100',
    text: '#8C3A00',
    solid: '#E65100',
    soft: '#FFA726',
    icon: '↩️',
    emoji: '🟠',
    description: 'This order has been returned',
  },
};

const getStatusMeta = (status: string): StatusMeta =>
  STATUS_META[status?.toUpperCase()] || {
    label: status || 'Unknown',
    shortLabel: status || 'Unknown',
    bg: '#F5F5F5',
    border: '#9E9E9E',
    text: '#424242',
    solid: '#9E9E9E',
    soft: '#CFCFCF',
    icon: '•',
    emoji: '⚪',
    description: '',
  };

const isTerminalFailure = (status: string) =>
  ['CANCELLED', 'RETURNED'].includes(status?.toUpperCase());

const isCancellable = (status: string) =>
  ['PENDING', 'ACCEPTED', 'PACKED'].includes(status?.toUpperCase());

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
  const [cancellingOrderIds, setCancellingOrderIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // -------- Fetch user id --------
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

  // -------- Fetch orders --------
  const fetchOrders = useCallback(
    async (page: number, shouldAppend: boolean = false) => {
      try {
        const uid = await fetchUserId();
        if (!uid) throw new Error('User ID not found');

        const response = await apiService.getOrdersByUserId(uid, page, 10);

        if (response.success && response.data?.data?.data) {
          const newOrders = response.data.data.data;
          const totalPagesFromApi = response.data.data.totalPages || 1;

          setTotalPages(totalPagesFromApi);
          setCurrentPage(page);

          if (shouldAppend) {
            setOrders((prev) => [...prev, ...newOrders]);
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
    },
    [fetchUserId]
  );

  useEffect(() => {
    const loadInitialOrders = async () => {
      setLoading(true);
      await fetchOrders(1, false);
      setLoading(false);
    };
    loadInitialOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders(1, false);
    setRefreshing(false);
  }, [fetchOrders]);

  const loadMoreOrders = useCallback(async () => {
    if (loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await fetchOrders(nextPage, true);
    setLoadingMore(false);
  }, [currentPage, totalPages, loadingMore, fetchOrders]);

  const handleCancelPress = async (orderId: string) => {
    setCancellingOrderIds((prev) => new Set(prev).add(orderId));
    try {
      const response = await apiService.updateOrderStatus(orderId, 'CANCELLED');
      if (response.success) {
        await fetchOrders(currentPage, false);
      } else {
        throw new Error(response.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(
        'Failed to cancel order: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setCancellingOrderIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // -------- Helpers --------
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return (
      d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
  };

  const getDisplayOrderNumber = (item: OrderItem) =>
    item.orderNumber || item._id.slice(-8).toUpperCase();

  const getTotalQty = (items: OrderLineItem[]) =>
    items.reduce((sum, i) => sum + i.quantity, 0);

  const getPrimaryImage = (item: OrderItem) =>
    item.items?.[0]?.product?.image ||
    item.items?.[0]?.productSnapshot?.image ||
    null;

  const getProgressIndex = (status: string) => {
    const s = status?.toUpperCase();
    if (isTerminalFailure(s)) return -1;
    const idx = ORDER_FLOW.indexOf(s);
    return idx >= 0 ? idx : 0;
  };

  // -------- Colorful Status Tracker --------
  const renderStatusTracker = (status: string, compact: boolean = true) => {
    const meta = getStatusMeta(status);

    // Failure state — colored banner
    if (isTerminalFailure(status)) {
      return (
        <View
          style={[
            styles.failureBanner,
            { backgroundColor: meta.bg, borderColor: meta.border },
          ]}
        >
          <View style={[styles.failureIconWrap, { backgroundColor: meta.solid }]}>
            <Text style={styles.failureIcon}>{meta.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.failureTitle, { color: meta.text }]}>
              {meta.label}
            </Text>
            <Text style={styles.failureDesc}>{meta.description}</Text>
          </View>
        </View>
      );
    }

    const progress = getProgressIndex(status);

    return (
      <View style={styles.trackerWrap}>
        {ORDER_FLOW.map((step, idx) => {
          const done = idx <= progress;
          const current = idx === progress;
          const stepMeta = getStatusMeta(step);
          const isLast = idx === ORDER_FLOW.length - 1;
          const lineDone = idx < progress;

          return (
            <React.Fragment key={step}>
              {/* Node */}
              <View style={styles.trackerNodeWrap}>
                <View
                  style={[
                    styles.trackerNode,
                    done
                      ? {
                          backgroundColor: stepMeta.solid,
                          borderColor: stepMeta.border,
                        }
                      : {
                          backgroundColor: '#FFFFFF',
                          borderColor: '#D6D9DE',
                        },
                    current && {
                      borderWidth: 3,
                      borderColor: stepMeta.soft,
                      shadowColor: stepMeta.solid,
                      shadowOpacity: 0.5,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    },
                  ]}
                >
                  {done ? (
                    <Text style={styles.trackerNodeCheck}>✓</Text>
                  ) : (
                    <View style={styles.trackerNodeDot} />
                  )}
                </View>
                {!compact && (
                  <Text
                    style={[
                      styles.trackerLabel,
                      {
                        color: done ? stepMeta.text : '#9E9E9E',
                        fontWeight: current ? '800' : '600',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {stepMeta.shortLabel}
                  </Text>
                )}
              </View>

              {/* Connector line */}
              {!isLast && (
                <View
                  style={[
                    styles.trackerLine,
                    {
                      backgroundColor: lineDone
                        ? stepMeta.solid
                        : '#E2E5EA',
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  // -------- Order Card --------
  const renderOrder = ({ item }: { item: OrderItem }) => {
    const meta = getStatusMeta(item.status);
    const totalQty = getTotalQty(item.items);
    const primaryImage = getPrimaryImage(item);
    const canCancel = isCancellable(item.status);
    const isCancelling = cancellingOrderIds.has(item._id);

    return (
      <View style={[styles.card, { borderLeftColor: meta.border }]}>
        {/* Colorful top accent bar */}
        <View style={[styles.accentBar, { backgroundColor: meta.solid }]} />

        {/* Top strip: vendor + status */}
        <View style={styles.cardTop}>
          <View style={styles.vendorBadge}>
            <Text style={styles.vendorBadgeIcon}>🏪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vendorName} numberOfLines={1}>
              {item.vendor?.shopName || 'Seller'}
            </Text>
            <Text style={styles.orderNumberSmall}>
              #{getDisplayOrderNumber(item)}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: meta.bg, borderColor: meta.border },
            ]}
          >
            <Text style={styles.statusPillIcon}>{meta.icon}</Text>
            <Text style={[styles.statusPillText, { color: meta.text }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        {/* Product row */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.productRow}
          onPress={() => {
            setSelectedOrder(item);
            setDetailsVisible(true);
          }}
        >
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={[styles.productImage, { borderColor: meta.soft }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.productImage,
                styles.thumbPlaceholder,
                { borderColor: meta.soft },
              ]}
            >
              <Text style={styles.thumbPlaceholderText}>No image</Text>
            </View>
          )}

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.items[0]?.product?.name ||
                item.items[0]?.productSnapshot?.name ||
                'Product'}
            </Text>
            <Text style={styles.productMeta} numberOfLines={1}>
              {item.items[0]?.product?.brand ||
                item.items[0]?.productSnapshot?.brand ||
                ''}
              {item.items[0]?.product?.weightInKg
                ? ` • ${item.items[0].product.weightInKg} kg`
                : ''}
            </Text>
            {totalQty > 1 && (
              <Text style={styles.moreItemsText}>
                +{totalQty - 1} more item(s)
              </Text>
            )}
            <View style={styles.priceRowInline}>
              <Text style={[styles.priceText, { color: meta.solid }]}>
                ₹{item.payableAmount}
              </Text>
              <View
                style={[
                  styles.payBadge,
                  { backgroundColor: meta.bg, borderColor: meta.soft },
                ]}
              >
                <Text style={[styles.payBadgeText, { color: meta.text }]}>
                  {item.paymentMethod === 'COD' ? 'COD' : item.paymentMethod}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.chevron, { color: meta.soft }]}>›</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Status tracker */}
        <View style={styles.trackerContainer}>
          <View style={styles.trackerHeaderRow}>
            <Text style={styles.trackerHeaderText}>Order Progress</Text>
            <Text style={[styles.trackerHeaderStatus, { color: meta.text }]}>
              {meta.emoji} {meta.label}
            </Text>
          </View>
          {renderStatusTracker(item.status, true)}
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipIcon}>📅</Text>
            <Text style={styles.metaChipText}>
              {item.status?.toUpperCase() === 'DELIVERED' && item.deliveredAt
                ? `Delivered ${formatDate(item.deliveredAt)}`
                : `Placed ${formatDate(item.createdAt)}`}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              { borderColor: meta.border, backgroundColor: meta.bg },
            ]}
            onPress={() => {
              setSelectedOrder(item);
              setDetailsVisible(true);
            }}
          >
            <Text style={[styles.secondaryBtnText, { color: meta.text }]}>
              👁 View Details
            </Text>
          </TouchableOpacity>

          {canCancel && !isCancelling ? (
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={() => handleCancelPress(item._id)}
            >
              <Text style={styles.dangerBtnText}>✕ Cancel Order</Text>
            </TouchableOpacity>
          ) : isCancelling ? (
            <View style={styles.cancelLoading}>
              <ActivityIndicator size="small" color="#C62828" />
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  // -------- Colorful Details Modal --------
  const renderDetailsModal = () => {
    if (!selectedOrder) return null;
    const o = selectedOrder;
    const meta = getStatusMeta(o.status);
    const history = (o.statusHistory || [])
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    return (
      <Modal
        visible={detailsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            {/* Colorful header */}
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: meta.bg, borderBottomColor: meta.border },
              ]}
            >
              <View
                style={[styles.modalHeaderIconWrap, { backgroundColor: meta.solid }]}
              >
                <Text style={styles.modalHeaderIcon}>{meta.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: meta.text }]}>
                  {meta.label}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Order #{getDisplayOrderNumber(o)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalClose, { backgroundColor: meta.solid }]}
                onPress={() => setDetailsVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Progress tracker full */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Order Progress</Text>
                <View style={{ marginTop: 10 }}>
                  {renderStatusTracker(o.status, false)}
                </View>
                <Text style={styles.progressCaption}>{meta.description}</Text>
              </View>

              {/* Delivery address */}
              {o.deliveryLocation && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
                  <View style={styles.addressCard}>
                    <View style={styles.addressIconWrap}>
                      <Text style={styles.addressIcon}>🏠</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressName}>
                        {o.deliveryLocation.name || 'Customer'}
                      </Text>
                      <Text style={styles.addressText}>
                        {o.deliveryLocation.formattedAddress ||
                          [o.deliveryLocation.city, o.deliveryLocation.zipcode]
                            .filter(Boolean)
                            .join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Items */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  🛒 Items ({getTotalQty(o.items)})
                </Text>
                {o.items.map((it, idx) => {
                  const uri = it.product?.image || it.productSnapshot?.image;
                  const name =
                    it.product?.name || it.productSnapshot?.name || 'Product';
                  const brand =
                    it.product?.brand || it.productSnapshot?.brand || '';
                  return (
                    <View key={idx} style={styles.itemRow}>
                      {uri ? (
                        <Image
                          source={{ uri }}
                          style={[styles.itemImage, { borderColor: meta.soft }]}
                        />
                      ) : (
                        <View
                          style={[
                            styles.itemImage,
                            styles.thumbPlaceholder,
                            { borderColor: meta.soft },
                          ]}
                        >
                          <Text style={styles.thumbPlaceholderText}>
                            No image
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {name}
                        </Text>
                        <Text style={styles.itemMeta}>
                          {brand}
                          {it.product?.weightInKg
                            ? ` • ${it.product.weightInKg} kg`
                            : ''}
                        </Text>
                        <Text style={styles.itemMeta}>
                          Qty: {it.quantity} × ₹{it.price}
                        </Text>
                      </View>
                      <Text style={[styles.itemTotal, { color: meta.solid }]}>
                        ₹{it.price * it.quantity}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Price details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Price Details</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal</Text>
                  <Text style={styles.priceValue}>₹{o.subTotal}</Text>
                </View>
                {o.deliveryCharge !== undefined && o.deliveryCharge > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      Delivery
                      {o.distanceKm ? ` (${o.distanceKm.toFixed(1)} km)` : ''}
                    </Text>
                    <Text style={styles.priceValue}>₹{o.deliveryCharge}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.totalRow,
                    { borderTopColor: meta.border, backgroundColor: meta.bg },
                  ]}
                >
                  <Text style={[styles.totalLabel, { color: meta.text }]}>
                    Total
                  </Text>
                  <Text style={[styles.totalValue, { color: meta.solid }]}>
                    ₹{o.payableAmount}
                  </Text>
                </View>
              </View>

              {/* Payment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 Payment</Text>
                <View
                  style={[
                    styles.paymentCard,
                    { borderColor: meta.soft, backgroundColor: meta.bg },
                  ]}
                >
                  <Text style={styles.paymentIcon}>💳</Text>
                  <Text style={[styles.paymentLine, { color: meta.text }]}>
                    {o.paymentMethod === 'COD'
                      ? 'Cash on Delivery'
                      : o.paymentMethod}
                    {o.paymentStatus
                      ? ` • ${
                          o.paymentStatus === 'NOT_REQUIRED'
                            ? 'No payment required'
                            : o.paymentStatus
                        }`
                      : ''}
                  </Text>
                </View>
              </View>

              {/* Timeline */}
              {history.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🕐 Order Timeline</Text>
                  {history.map((h, idx) => {
                    const hm = getStatusMeta(h.status);
                    const last = idx === history.length - 1;
                    return (
                      <View key={idx} style={styles.timelineRow}>
                        <View style={styles.timelineLeft}>
                          <View
                            style={[
                              styles.timelineDot,
                              {
                                backgroundColor: last
                                  ? hm.solid
                                  : hm.soft,
                                borderColor: hm.border,
                              },
                            ]}
                          >
                            <Text style={styles.timelineDotText}>
                              {last ? '✓' : ''}
                            </Text>
                          </View>
                          {!last && (
                            <View
                              style={[
                                styles.timelineLine,
                                { backgroundColor: hm.soft },
                              ]}
                            />
                          )}
                        </View>
                        <View
                          style={[
                            styles.timelineContent,
                            {
                              backgroundColor: hm.bg,
                              borderLeftColor: hm.border,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.timelineStatus, { color: hm.text }]}
                          >
                            {hm.icon} {hm.label}
                          </Text>
                          <Text style={styles.timelineTime}>
                            {formatDateTime(h.at)}
                          </Text>
                          {h.changedByRole && (
                            <Text style={styles.timelineRole}>
                              by {h.changedByRole}
                            </Text>
                          )}
                          {h.note && (
                            <Text style={styles.timelineNote}>
                              Note: {h.note}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more orders...</Text>
      </View>
    );
  };

  // -------- States --------
  if (loading && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

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

  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          When you place an order, it will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Colorful header */}
      <View style={styles.headerBar}>
        <View style={styles.headerGradient}>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerIcon}>🧾</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} • Tap to track
            </Text>
          </View>
        </View>
      </View>

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

      {renderDetailsModal()}
    </View>
  );
}

// ---------- Styles ----------
const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF1F6',
  },

  // ------- Header -------
  headerBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E6EB',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 14,
    gap: 12,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 22 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  listContent: {
    padding: 10,
    paddingBottom: 30,
  },

  // ------- Card -------
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  vendorBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorBadgeIcon: { fontSize: 14 },
  vendorName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  orderNumberSmall: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.2,
    gap: 4,
  },
  statusPillIcon: { fontSize: 11 },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ------- Product row -------
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F2F3F5',
    borderWidth: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  productMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  moreItemsText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
    marginTop: 3,
  },
  priceRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
  },
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  payBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF0F3',
    marginHorizontal: 12,
  },

  // ------- Tracker -------
  trackerContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trackerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackerHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trackerHeaderStatus: {
    fontSize: 11,
    fontWeight: '800',
  },
  trackerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackerNodeWrap: {
    alignItems: 'center',
  },
  trackerNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  trackerNodeCheck: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  trackerNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C4C9D1',
  },
  trackerLine: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  trackerLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
  },

  // ------- Failure banner -------
  failureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  failureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failureIcon: { fontSize: 18, color: '#FFFFFF' },
  failureTitle: { fontSize: 14, fontWeight: '900' },
  failureDesc: {
    fontSize: 11,
    color: '#616161',
    marginTop: 2,
  },

  // ------- Meta + Actions -------
  metaRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  metaChipIcon: { fontSize: 11 },
  metaChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    gap: 10,
    alignItems: 'center',
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.4,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dangerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: '#C62828',
    backgroundColor: '#FFE5E5',
  },
  dangerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C62828',
  },
  cancelLoading: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  // ------- Modal -------
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
    gap: 12,
  },
  modalHeaderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderIcon: { fontSize: 22, color: '#FFFFFF' },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#616161',
    marginTop: 2,
    fontWeight: '600',
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2F3F5',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  progressCaption: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ------- Address -------
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  addressIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressIcon: { fontSize: 15 },
  addressName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  addressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

  // ------- Items -------
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F7F9',
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#F2F3F5',
    borderWidth: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },

  // ------- Price -------
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderRadius: 10,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
  },

  // ------- Payment -------
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 10,
  },
  paymentIcon: { fontSize: 18 },
  paymentLine: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  // ------- Timeline -------
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  timelineDotText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  timelineLine: {
    flex: 1,
    width: 3,
    marginTop: 2,
    borderRadius: 2,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  timelineStatus: {
    fontSize: 13,
    fontWeight: '900',
  },
  timelineTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 3,
    fontWeight: '600',
  },
  timelineRole: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
    fontStyle: 'italic',
  },
  timelineNote: {
    fontSize: 11,
    color: '#757575',
    marginTop: 3,
    fontStyle: 'italic',
  },

  // ------- Thumbnails / placeholders -------
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EAED',
  },
  thumbPlaceholderText: {
    fontSize: 9,
    color: '#9AA0A6',
    fontWeight: '600',
  },

  // ------- Footer / States -------
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    backgroundColor: '#EEF1F6',
  },
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
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: theme.fonts.size.medium,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.medium,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  emptySubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});