import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

const PrivacyPolicyScreen: React.FC = () => {
  const handleCallPress = () => {
    Linking.openURL('tel:7337777705').catch(() => {
      Alert.alert('Error', 'Unable to make call');
    });
  };

  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, delivery address, and order details.',
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to process your orders, provide customer support, send you updates about your orders, and improve our services. We may also use your information to send you updates about new rice varieties and special offers.',
    },
    {
      title: 'Minimum Order Policy',
      content: '📦 NVS Rice Mart delivers a minimum of 26 kg of premium quality rice per order. This ensures you get the best value and quality for your purchase. For bulk orders or special requirements, please contact us directly.',
    },
    {
      title: 'Payment Policy',
      content: '💰 We accept ONLY Cash on Delivery (COD) for all orders. No online payment options are available at this time. Please keep the exact cash amount ready at the time of delivery. This policy helps us serve you better with zero payment processing hassles.',
    },
    {
      title: 'Delivery Policy',
      content: '🚚 We deliver premium quality rice directly to your doorstep. Delivery is available in selected areas. Please confirm delivery availability for your pincode before placing an order. Minimum order quantity: 26 kg.',
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted delivery partners who assist us in delivering your orders.',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All your data is stored securely on our servers.',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal information. You may also opt out of receiving promotional messages from us at any time by contacting our support team.',
    },
    {
      title: 'Contact Us',
      content: 'For any questions, orders, or support, please contact us:',
      contact: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="privacy-tip" size={50} color={theme.colors.card} />
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>How we protect and use your information</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.introCard}>
          <Icon name="security" size={48} color={theme.colors.primary} />
          <Text style={styles.introText}>
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.title === 'Minimum Order Policy' && (
                <Icon name="inventory" size={24} color={theme.colors.primary} />
              )}
              {section.title === 'Payment Policy' && (
                <Icon name="payments" size={24} color={theme.colors.primary} />
              )}
              {section.title === 'Delivery Policy' && (
                <Icon name="local-shipping" size={24} color={theme.colors.primary} />
              )}
              {section.title === 'Contact Us' && (
                <Icon name="contact-support" size={24} color={theme.colors.primary} />
              )}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
            
            {section.contact && (
              <View style={styles.contactContainer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleCallPress}>
                  <Icon name="phone" size={24} color={theme.colors.primary} />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Phone Number</Text>
                    <Text style={styles.contactValue}>+91 7337777705</Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                
                <View style={styles.contactInfo}>
                  <Icon name="email" size={20} color={theme.colors.primary} />
                  <Text style={styles.emailText}>ricemartnvs@gmail.com</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Important Information Card */}
        <View style={styles.importantCard}>
          <Icon name="info" size={32} color={theme.colors.primary} />
          <Text style={styles.importantTitle}>Important Information</Text>
          <View style={styles.importantItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.importantText}>Minimum order: 26 kg rice</Text>
          </View>
          <View style={styles.importantItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.importantText}>Only Cash on Delivery (COD)</Text>
          </View>
          
          <View style={styles.importantItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.importantText}>Premium quality rice directly from farmers</Text>
          </View>
        </View>

        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated: January 15, 2024
          </Text>
          <Text style={styles.versionText}>
            NVS Rice Mart - Premium Rice Delivery
          </Text>
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingTop: theme.spacing.xlarge + 10,
    paddingBottom: theme.spacing.xlarge,
  },
  title: {
    fontSize: theme.fonts.size.header,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.card,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
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
  content: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.xlarge,
  },
  introCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 3,
  },
  introText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
    lineHeight: 22,
    fontFamily: theme.fonts.family.regular,
  },
  section: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    gap: 10,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
    flex: 1,
  },
  sectionContent: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 22,
    fontFamily: theme.fonts.family.regular,
  },
  contactContainer: {
    marginTop: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.medium,
  },
  contactLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  contactValue: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: theme.spacing.small,
  },
  emailText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.medium,
  },
  importantCard: {
    backgroundColor: '#FFF8E1',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.card,
    elevation: 2,
  },
  importantTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  importantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
    gap: 10,
  },
  importantText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
    flex: 1,
  },
  lastUpdated: {
    alignItems: 'center',
    paddingVertical: theme.spacing.large,
  },
  lastUpdatedText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    fontFamily: theme.fonts.family.regular,
  },
  versionText: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
});

export default PrivacyPolicyScreen;