import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

const HelpSupportScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const categories = [
    {
      id: 'orders',
      title: 'Order Issues',
      icon: 'shopping-bag',
      description: 'Questions about your orders, delivery, or returns',
    },
    {
      id: 'products',
      title: 'Product Information',
      icon: 'info',
      description: 'Questions about rice varieties, quality, or specifications',
    },
    {
      id: 'payment',
      title: 'Payment & Billing',
      icon: 'payment',
      description: 'Issues with payments, refunds, or billing',
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'person',
      description: 'Account settings, login issues, or profile updates',
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: 'computer',
      description: 'App issues, bugs, or technical difficulties',
    },
  ];

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by going to the Order History section in your profile and clicking on "View Details" for any order.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for items in new, unused condition with original packaging.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 2-5 business days depending on your location. You will receive tracking information once your order ships.',
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer special pricing for bulk orders. Please contact our support team for custom quotes.',
    },
  ];

  const handleSubmitSupport = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }
    Alert.alert('Success', 'Your message has been sent. We will get back to you within 24 hours.');
    setMessage('');
  };

  const handleCallSupport = () => {
    Alert.alert('Call Support', 'Call us at +91-9876543210 for immediate assistance.');
  };

  const handleEmailSupport = () => {
    Alert.alert('Email Support', 'Send us an email at support@nvsricemall.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>We're here to help you</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
              <Icon name="phone" size={24} color={theme.colors.card} />
              <Text style={styles.contactButtonText}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
              <Icon name="email" size={24} color={theme.colors.card} />
              <Text style={styles.contactButtonText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

        <View style={styles.supportForm}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Describe your issue or question..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitSupport}>
            <Text style={styles.submitButtonText}>Send Message</Text>
            <Icon name="send" size={20} color={theme.colors.card} />
          </TouchableOpacity>
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
  contactCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.large,
    ...theme.shadows.card,
    elevation: 3,
  },
  contactTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
    fontFamily: theme.fonts.family.bold,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    flex: 0.45,
    ...theme.shadows.card,
    elevation: 2,
  },
  contactButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fonts.family.bold,
  },
  faqItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  faqAnswer: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    lineHeight: 20,
    fontFamily: theme.fonts.family.regular,
  },
  supportForm: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    ...theme.shadows.card,
    elevation: 2,
  },
  messageInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    fontFamily: theme.fonts.family.regular,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    ...theme.shadows.card,
    elevation: 3,
  },
  submitButtonText: {
    color: theme.colors.card,
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    marginRight: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
});

export default HelpSupportScreen;