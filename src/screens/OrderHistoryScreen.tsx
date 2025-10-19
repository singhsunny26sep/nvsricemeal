import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { PDFGenerator } from '../utils/pdfGenerator';

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled';
  total: number;
  items: string[];
  hasReview?: boolean;
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
}

interface Review {
  rating: number;
  comment: string;
}

const OrderHistoryScreen: React.FC = () => {
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewData, setReviewData] = useState<Review>({ rating: 5, comment: '' });
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'delivered',
      total: 450,
      items: ['Basmati Rice 5kg', 'Brown Rice 2kg'],
      hasReview: true,
      review: {
        rating: 5,
        comment: 'Excellent quality rice! Very satisfied with the purchase.',
        date: '2024-01-16',
      },
    },
    {
      id: 'ORD002',
      date: '2024-01-10',
      status: 'shipped',
      total: 320,
      items: ['Sona Masoori Rice 10kg'],
    },
    {
      id: 'ORD003',
      date: '2024-01-05',
      status: 'processing',
      total: 280,
      items: ['Jasmine Rice 3kg', 'Parboiled Rice 5kg'],
    },
    {
      id: 'ORD004',
      date: '2024-01-01',
      status: 'delivered',
      total: 380,
      items: ['Thai Jasmine Rice 5kg', 'Organic Brown Rice 2kg'],
    },
  ]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return '#4CAF50';
      case 'shipped':
        return '#2196F3';
      case 'processing':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'shipped':
        return 'local-shipping';
      case 'processing':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const handleReviewPress = (order: Order) => {
    setSelectedOrder(order);
    setReviewData({ rating: 5, comment: '' });
    setReviewModalVisible(true);
  };

  const handleSubmitReview = () => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          hasReview: true,
          review: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            date: new Date().toISOString().split('T')[0],
          },
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    setReviewModalVisible(false);
    setSelectedOrder(null);

    Alert.alert('Success', 'Thank you for your review!');
  };

  const handleDownloadPDF = async (order: Order) => {
    try {
      Alert.alert(
        'Generating PDF',
        'Please wait while we generate your invoice...',
        [{ text: 'OK' }]
      );

      // Mock customer info - in real app, get from user context or API
      const customerInfo = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        address: '123 Main Street, City, State - 123456',
      };

      const pdfPath = await PDFGenerator.generateOrderHistoryPDF(order, customerInfo);

      Alert.alert(
        'PDF Generated',
        `Invoice saved successfully!\n\nPath: ${pdfPath}`,
        [
          { text: 'OK' },
          {
            text: 'Share',
            onPress: () => PDFGenerator.sharePDF(pdfPath, order.id)
          }
        ]
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Failed to generate PDF. Please try again.'
      );
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => interactive && setReviewData({ ...reviewData, rating: i + 1 })}
            disabled={!interactive}
          >
            <Icon
              name={i < rating ? 'star' : 'star-border'}
              size={interactive ? 32 : 20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Icon name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsLabel}>Items:</Text>
        {item.items.map((product, index) => (
          <Text key={index} style={styles.itemName}>• {product}</Text>
        ))}
      </View>

      {/* Review Section */}
      {item.hasReview && item.review && (
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <Icon name="star" size={16} color={theme.colors.primary} />
            <Text style={styles.reviewLabel}>Your Review</Text>
            <Text style={styles.reviewDate}>({item.review.date})</Text>
          </View>
          {renderStars(item.review.rating)}
          <Text style={styles.reviewComment}>{item.review.comment}</Text>
        </View>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Total: ₹{item.total}</Text>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={() => handleDownloadPDF(item)}
          >
            <Icon name="picture-as-pdf" size={16} color={theme.colors.primary} />
            <Text style={styles.pdfButtonText}>Download PDF</Text>
          </TouchableOpacity>
          {item.status === 'delivered' && !item.hasReview && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewPress(item)}
            >
              <Icon name="star-border" size={16} color={theme.colors.primary} />
              <Text style={styles.reviewButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
        <Text style={styles.subtitle}>Track your rice orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-bag" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Start shopping to see your order history</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write Review</Text>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  How would you rate your order #{selectedOrder.id}?
                </Text>

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Rating:</Text>
                  {renderStars(reviewData.rating, true)}
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Comment:</Text>
                  <TextInput
                    style={styles.commentInput}
                    multiline
                    numberOfLines={4}
                    value={reviewData.comment}
                    onChangeText={(text) => setReviewData({ ...reviewData, comment: text })}
                    placeholder="Share your experience with this order..."
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setReviewModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitReview}
                  >
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: theme.fonts.size.header,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.card,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  subtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.card,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: theme.fonts.family.regular,
  },
  ordersList: {
    padding: theme.spacing.medium,
  },
  orderCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  orderDate: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.small,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.small,
  },
  statusText: {
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  orderItems: {
    marginBottom: theme.spacing.medium,
  },
  itemsLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  itemName: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontFamily: theme.fonts.family.regular,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalText: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    marginRight: theme.spacing.small,
    fontFamily: theme.fonts.family.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
  },
  emptyText: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.large,
    fontFamily: theme.fonts.family.bold,
  },
  emptySubtext: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: theme.spacing.small,
  },
  reviewSection: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  reviewLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  reviewDate: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  reviewComment: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 20,
    fontFamily: theme.fonts.family.regular,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.medium,
    flexWrap: 'wrap',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  reviewButtonText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.primary,
    marginLeft: theme.spacing.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  pdfButtonText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.primary,
    marginLeft: theme.spacing.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: 0,
    margin: theme.spacing.medium,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.card,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  closeButton: {
    padding: theme.spacing.small,
  },
  modalBody: {
    padding: theme.spacing.large,
  },
  modalSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    fontFamily: theme.fonts.family.regular,
  },
  ratingSection: {
    marginBottom: theme.spacing.large,
  },
  ratingLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  commentSection: {
    marginBottom: theme.spacing.large,
  },
  commentLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.medium,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  submitButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.card,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.card,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
});

export default OrderHistoryScreen;