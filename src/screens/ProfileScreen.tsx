import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  // Hardcoded user info for demo
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    address: '123 Main St, Mumbai, India',
    avatar: 'https://via.placeholder.com/100',
    bio: 'Premium Rice Enthusiast',
  };

  const handleLogout = () => {
    // Demo logout logic
    Alert.alert('Logout', 'Logged out successfully!');
  };

  const handleOrdersPress = () => {
    navigation.navigate('OrderHistory' as never);
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy' as never);
  };

  const handleTermsConditions = () => {
    navigation.navigate('TermsConditions' as never);
  };

  const handleHelpSupport = () => {
    navigation.navigate('HelpSupport' as never);
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications' as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Icon name="person-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>Personal Information</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.labelContainer}>
            <Icon name="email" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.label}>Email</Text>
          </View>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.labelContainer}>
            <Icon name="phone" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.label}>Phone</Text>
          </View>
          <Text style={styles.value}>{user.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.labelContainer}>
            <Icon name="location-on" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.label}>Address</Text>
          </View>
          <Text style={styles.value}>{user.address}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleOrdersPress}>
          <View style={styles.menuItemLeft}>
            <Icon name="shopping-bag" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Order History</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleHelpSupport}>
          <View style={styles.menuItemLeft}>
            <Icon name="help" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
          <View style={styles.menuItemLeft}>
            <Icon name="notifications" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Legal</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
          <View style={styles.menuItemLeft}>
            <Icon name="security" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleTermsConditions}>
          <View style={styles.menuItemLeft}>
            <Icon name="description" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Terms & Conditions</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Icon name="notifications" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Icon name="language" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Language</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color={theme.colors.card} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    padding: theme.spacing.xlarge,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.medium,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  name: {
    fontSize: theme.fonts.size.title,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontFamily: theme.fonts.family.bold,
    marginBottom: theme.spacing.small,
  },
  bio: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  cardTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    backgroundColor: theme.colors.background + '10',
    borderRadius: theme.borderRadius.small,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: theme.fonts.family.medium,
  },
  value: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    textAlign: 'right',
    flex: 1,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
  },
  actionButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  logoutButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
  },
  menuSection: {
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  menuSectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  menuItem: {
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    marginLeft: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
  },
});

export default ProfileScreen;