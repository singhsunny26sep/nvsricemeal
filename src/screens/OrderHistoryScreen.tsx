import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled';
  total: number;
  items: string[];
}

const OrderHistoryScreen: React.FC = () => {
  // Mock order data
  const orders: Order[] = [
    {
      id: 'ORD001',
      date: '2024-01-15',
      status: 'delivered',
      total: 450,
      items: ['Basmati Rice 5kg', 'Brown Rice 2kg'],
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
  ];

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

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Total: ₹{item.total}</Text>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
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
});

export default OrderHistoryScreen;