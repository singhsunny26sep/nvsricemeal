import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'update' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
  discount?: string;
}

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #ORD001 has been delivered successfully.',
      time: '2 hours ago',
      read: false,
      orderId: 'ORD001',
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Special Offer!',
      message: 'Get 20% off on all Basmati rice varieties. Limited time offer!',
      time: '1 day ago',
      read: false,
      discount: '20%',
    },
    {
      id: '3',
      type: 'update',
      title: 'App Updated',
      message: 'New features added! Check out the improved rice categories.',
      time: '2 days ago',
      read: true,
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Restock Reminder',
      message: 'Your favorite Brown Rice is back in stock!',
      time: '3 days ago',
      read: true,
    },
    {
      id: '5',
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD002 has been shipped and is on the way.',
      time: '1 week ago',
      read: true,
      orderId: 'ORD002',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(true);

  const categories = [
    { id: 'all', label: 'All', icon: 'notifications' },
    { id: 'order', label: 'Orders', icon: 'shopping-bag' },
    { id: 'promotion', label: 'Offers', icon: 'local-offer' },
    { id: 'update', label: 'Updates', icon: 'system-update' },
    { id: 'reminder', label: 'Reminders', icon: 'alarm' },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'shopping-bag';
      case 'promotion':
        return 'local-offer';
      case 'update':
        return 'system-update';
      case 'reminder':
        return 'alarm';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '#4CAF50';
      case 'promotion':
        return '#FF9800';
      case 'update':
        return '#2196F3';
      case 'reminder':
        return '#9C27B0';
      default:
        return theme.colors.primary;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedCategory === 'all') return true;
    return notification.type === selectedCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationLeft}>
        <View style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationColor(item.type) + '20' }
        ]}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={24}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              !item.read && styles.unreadText
            ]}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
          <Text style={[
            styles.notificationMessage,
            !item.read && styles.unreadText
          ]}>
            {item.message}
          </Text>
          {item.orderId && (
            <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
          )}
          {item.discount && (
            <View style={styles.discountTag}>
              <Text style={styles.discountText}>{item.discount} OFF</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Icon name="delete" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Icon
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? 'white' : theme.colors.textSecondary}
      />
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.categoryButtonTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Stay updated with your orders and offers
        </Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        style={styles.categoriesList}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Mark All as Read Button */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Icon name="done-all" size={20} color={theme.colors.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-none" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>
            You're all caught up! Check back later for updates.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Notification Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="notifications" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications on your device</Text>
            </View>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={pushNotifications ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="email" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via email</Text>
            </View>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={emailNotifications ? theme.colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="sms" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.settingTitle}>SMS Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via SMS</Text>
            </View>
          </View>
          <Switch
            value={smsNotifications}
            onValueChange={setSmsNotifications}
            trackColor={{ false: '#767577', true: theme.colors.primary + '50' }}
            thumbColor={smsNotifications ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
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
    alignItems: 'center',
    position: 'relative',
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
  unreadBadge: {
    position: 'absolute',
    top: theme.spacing.large,
    right: theme.spacing.large,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  categoriesList: {
    marginTop: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
  },
  categoriesContainer: {
    paddingBottom: theme.spacing.small,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    marginRight: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.card,
    ...theme.shadows.card,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.medium,
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.medium,
    marginHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 2,
  },
  markAllText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    marginLeft: theme.spacing.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  notificationsList: {
    paddingHorizontal: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.medium,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  notificationTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  unreadText: {
    color: theme.colors.text,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  notificationTime: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  notificationMessage: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  orderId: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.bold,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  discountTag: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  deleteButton: {
    padding: theme.spacing.small,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
    paddingHorizontal: theme.spacing.large,
  },
  emptyText: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.large,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  emptySubtext: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  settingsSection: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.large,
    fontFamily: theme.fonts.family.bold,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginLeft: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  settingDescription: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.medium,
    marginTop: 2,
    fontFamily: theme.fonts.family.regular,
  },
});

export default NotificationScreen;