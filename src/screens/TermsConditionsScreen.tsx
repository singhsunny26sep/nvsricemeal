import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

const TermsConditionsScreen: React.FC = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using NVS Rice Mall, you accept and agree to be bound by the terms and provision of this agreement.',
    },
    {
      title: 'Use License',
      content: 'Permission is granted to temporarily access the materials on NVS Rice Mall for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
    },
    {
      title: 'Product Information',
      content: 'We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.',
    },
    {
      title: 'Pricing and Payment',
      content: 'All prices are subject to change without notice. Payment is due at the time of order placement. We accept various payment methods as indicated on our website.',
    },
    {
      title: 'Shipping and Delivery',
      content: 'We will make every effort to deliver your order within the estimated timeframe. However, delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery to the carrier.',
    },
    {
      title: 'Returns and Refunds',
      content: 'We offer returns within 7 days of delivery for most items in new, unused condition with original packaging. Refunds will be processed within 5-7 business days after we receive the returned item.',
    },
    {
      title: 'User Account',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.',
    },
    {
      title: 'Limitation of Liability',
      content: 'In no event shall NVS Rice Mall or its suppliers be liable for any damages arising out of the use or inability to use our products or services.',
    },
    {
      title: 'Contact Information',
      content: 'For questions about these Terms and Conditions, please contact us at support@nvsricemall.com or call us at +91-9876543210.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>Agreement for using our services</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.introCard}>
          <Icon name="description" size={48} color={theme.colors.primary} />
          <Text style={styles.introText}>
            Please read these terms and conditions carefully before using NVS Rice Mall services.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>
            Last updated: January 15, 2024
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
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
  content: {
    padding: theme.spacing.medium,
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
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  sectionContent: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 22,
    fontFamily: theme.fonts.family.regular,
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
});

export default TermsConditionsScreen;