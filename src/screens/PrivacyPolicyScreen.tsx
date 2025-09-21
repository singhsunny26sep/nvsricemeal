import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

const PrivacyPolicyScreen: React.FC = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, delivery address, and payment information.',
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to process your orders, provide customer support, send you updates about your orders, and improve our services. We may also use your information to send you promotional emails about our products and special offers.',
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted third parties who assist us in operating our website, conducting our business, or servicing you.',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal information. You may also opt out of receiving promotional emails from us at any time by following the unsubscribe instructions in those emails.',
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions about this Privacy Policy, please contact us at privacy@nvsricemall.com or call us at +91-9876543210.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
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

export default PrivacyPolicyScreen;