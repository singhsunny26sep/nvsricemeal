import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../utils/apiService';
import LanguageSelector from '../components/LanguageSelector';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { strings } = useLanguage();
  const { auth, logout } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    console.log('Fetching profile...');

    try {
      const response = await apiService.getUserProfile();
      console.log('Profile API response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);

      if (response.success && response.data) {
        console.log('Profile data received:', response.data);
        console.log('Profile data type:', typeof response.data);
        console.log('Profile data keys:', Object.keys(response.data));
        setUserProfile(response.data);
      } else if (response.success && (response.data as any)?.data) {
        // Handle nested data structure from API
        console.log('Profile data received (nested):', (response.data as any).data);
        setUserProfile((response.data as any).data);
      } else if (response.success && (response.data as any)?.data?.data) {
        // Handle deeply nested data structure from API
        console.log('Profile data received (deeply nested):', (response.data as any).data.data);
        setUserProfile((response.data as any).data.data);
      } else {
        console.error('Profile API failed:', response.error);
        console.log('Full response object:', JSON.stringify(response, null, 2));
        Alert.alert(
          strings?.common?.error || 'Error',
          response.error || 'Failed to load profile'
        );
      }
    } catch (error) {
      console.error('Profile API error:', error);
      console.log('Error details:', error);
      Alert.alert(
        strings?.common?.error || 'Error',
        'Network error occurred while loading profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Use auth user data as fallback if API fails
  const user = userProfile || auth.user || {
    name: 'User',
    email: '',
    phone: '',
  };

  // Debug logging
  console.log('ProfileScreen Debug:', {
    isLoading,
    hasToken: !!auth.user?.token,
    userProfile,
    authUser: auth.user,
    finalUser: user
  });

  const handleLogout = () => {
    Alert.alert(
      strings?.profile?.logout || 'Logout',
      strings?.profile?.logoutConfirm || 'Are you sure you want to logout?',
      [
        {
          text: strings?.common?.cancel || 'Cancel',
          style: 'cancel',
        },
        {
          text: strings?.profile?.logout || 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleOrdersPress = () => {
    navigation.navigate('OrderHistory' as never);
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy' as never);
  };
  const handleSavedLocations = () => {
    navigation.navigate('SaveLocation' as never);
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
  const handleLanguageSelection = () => {
    setShowLanguageSelector(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchUserProfile();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color={theme.colors.card} />
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: userProfile?.avatar || user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.bio}>{userProfile?.bio || user.bio || 'Premium Rice Enthusiast'}</Text>
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
          <Text style={styles.value}>{user.email || 'Not available'}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.labelContainer}>
            <Icon name="phone" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.label}>Phone</Text>
          </View>
          <Text style={styles.value}>{user.phone || 'Not available'}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.labelContainer}>
            <Icon name="location-on" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.label}>Address</Text>
          </View>
          <Text style={styles.value}>{userProfile?.address || 'Not available'}</Text>
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
        <TouchableOpacity style={styles.menuItem} onPress={handleSavedLocations}>
          <View style={styles.menuItemLeft}>
            <Icon name="location-on" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Saved Locations</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLanguageSelection}>
          <View style={styles.menuItemLeft}>
            <Icon name="language" size={24} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>{strings?.profile?.language || 'ಭಾಷೆ'}</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color={theme.colors.card} />
        <Text style={styles.logoutButtonText}>{strings?.profile?.logout || 'ಲಾಗ್‌ಔಟ್'}</Text>
      </TouchableOpacity>
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fonts.size.large,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  header: {
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    padding: theme.spacing.xlarge,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
    position: 'relative',
  },
  headerTop: {
    position: 'absolute',
    top: theme.spacing.medium,
    right: theme.spacing.medium,
    zIndex: 1,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
    elevation: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.medium,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  name: {
    fontSize: theme.fonts.size.title,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontFamily: theme.fonts.family.bold,
    marginBottom: theme.spacing.small,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bio: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.regular,
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
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: theme.spacing.medium,
    marginBottom: 100,
    ...theme.shadows.card,
    elevation: 4,
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoutButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    fontFamily: theme.fonts.family.bold,
    letterSpacing: 0.5,
    marginLeft: theme.spacing.small,
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
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    marginLeft: theme.spacing.medium,
    fontFamily: theme.fonts.family.medium,
    fontWeight: '500',
  },
});

export default ProfileScreen;