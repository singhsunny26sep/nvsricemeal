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

const TermsConditionsScreen: React.FC = () => {
  const handleCallPress = () => {
    Linking.openURL('tel:7337777705').catch(() => {
      Alert.alert('Error', 'Unable to make call');
    });
  };

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using NVS Rice Mart, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.',
      icon: 'check-circle',
    },
    {
      title: 'Minimum Order Policy',
      content: '📦 All orders must be a minimum of 26 kg of premium quality rice. This policy ensures you receive the best value and quality. Orders below 26 kg will not be processed or delivered.',
      icon: 'inventory',
    },
    {
      title: 'Payment Terms',
      content: '💰 We accept ONLY Cash on Delivery (COD). No online payment options are available. Full payment must be made in cash at the time of delivery. Please keep exact change ready as delivery partners may not carry change.',
      icon: 'payments',
    },
    {
      title: 'Delivery Policy',
      content: '🚚 Delivery is available only in selected areas of Davanagere (Pincodes: 577001, 577002, 577003, 577004, 577005, 577006). Delivery time is 2-4 business days. Free delivery on orders above ₹1499. A nominal delivery charge of ₹99 applies for orders below ₹1499.',
      icon: 'local-shipping',
    },
    {
      title: 'Product Quality Guarantee',
      content: 'We guarantee premium quality rice sourced directly from trusted farmers. Each batch is quality tested before delivery. If you receive damaged or poor quality rice, please contact us within 24 hours of delivery.',
      icon: 'verified',
    },
    {
      title: 'Returns and Refunds',
      content: 'Returns are accepted only for damaged or defective products within 24 hours of delivery. As this is a food product, returns for non-quality issues are not accepted. Refunds will be processed as cash refund on next delivery or bank transfer within 7 business days.',
      icon: 'replay',
    },
    {
      title: 'Cancellation Policy',
      content: 'Orders can be cancelled within 2 hours of placement. To cancel an order, please call us at 7337777705. Once the order is dispatched for delivery, cancellations are not possible.',
      icon: 'cancel',
    },
    {
      title: 'User Account Responsibility',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. Please inform us immediately of any unauthorized use.',
      icon: 'account-circle',
    },
    {
      title: 'Pricing Policy',
      content: 'All prices are subject to change without notice. Prices displayed are final and include all taxes. We reserve the right to modify or discontinue products without notice.',
      icon: 'currency-rupee',
    },
    {
      title: 'Limitation of Liability',
      content: 'NVS Rice Mart shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of our services. Our maximum liability is limited to the amount paid for the product.',
      icon: 'gavel',
    },
    {
      title: 'Contact Information',
      content: 'For questions about these Terms and Conditions, please contact us:',
      icon: 'contact-support',
      isContact: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="gavel" size={50} color={theme.colors.card} />
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>Agreement for using our services</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.introCard}>
          <Icon name="description" size={48} color={theme.colors.primary} />
          <Text style={styles.introText}>
            Please read these terms and conditions carefully before using NVS Rice Mart services.
            By placing an order, you agree to all terms mentioned below.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name={section.icon} size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
            
            {section.isContact && (
              <View style={styles.contactContainer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleCallPress}>
                  <Icon name="phone" size={24} color={theme.colors.primary} />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Call Us</Text>
                    <Text style={styles.contactValue}>+91 7337777705</Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => Linking.openURL('mailto:nvsricemart@gmail.com')}
                >
                  <Icon name="email" size={24} color={theme.colors.primary} />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Email Us</Text>
                    <Text style={styles.contactValue}>nvsricemart@gmail.com</Text>
                  </View>
                  <Icon name="arrow-forward-ios" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Key Terms Summary Card */}
        <View style={styles.summaryCard}>
          <Icon name="info" size={32} color={theme.colors.primary} />
          <Text style={styles.summaryTitle}>Key Terms Summary</Text>
          <View style={styles.summaryItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.summaryText}>Minimum order: 26 kg rice</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.summaryText}>Payment: Cash on Delivery only</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.summaryText}>Delivery: 24 hours </Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.summaryText}>Return window: 48 hours for damaged products</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="check-circle" size={18} color={theme.colors.success} />
            <Text style={styles.summaryText}>Cancellation: Within 2 hours of order</Text>
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
    gap: 12,
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
    gap: theme.spacing.small,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    gap: theme.spacing.medium,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: theme.fonts.size.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  contactValue: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  summaryCard: {
    backgroundColor: '#FFF8E1',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.card,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
    gap: 10,
  },
  summaryText: {
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

export default TermsConditionsScreen;