import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';

interface AddToCartModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (zipCode: string) => void;
  productName: string;
  quantity: number;
  totalPrice: number;
  deliveryError?: string;
  isCheckingDelivery?: boolean;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  visible,
  onClose,
  onConfirm,
  productName,
  quantity,
  totalPrice,
  deliveryError = '',
  isCheckingDelivery = false,
}) => {
  const [zipCode, setZipCode] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');

  const validateZipCode = (code: string): boolean => {
    // Indian pincode validation (6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(code);
  };

  const handleConfirm = () => {
    if (!zipCode.trim()) {
      setZipCodeError('Please enter your delivery pincode');
      return;
    }

    if (!validateZipCode(zipCode)) {
      setZipCodeError('Please enter a valid 6-digit pincode');
      return;
    }

    setZipCodeError('');
    onConfirm(zipCode.trim());
  };

  const handleZipCodeChange = (text: string) => {
    // Only allow digits and limit to 6 characters
    const filteredText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setZipCode(filteredText);
    if (zipCodeError) {
      setZipCodeError('');
    }
  };

  const handleClose = () => {
    setZipCode('');
    setZipCodeError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Icon name="shopping-cart" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Add to Cart</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {/* Product Summary */}
          <View style={styles.productSummary}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.quantityText}>Quantity: {quantity}</Text>
              <Text style={styles.totalPrice}>₹{totalPrice}</Text>
            </View>
          </View>

          {/* Zip Code Section */}
          <View style={styles.zipCodeSection}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <Text style={styles.sectionSubtitle}>
              Please enter your delivery pincode to check service availability
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Delivery Pincode</Text>
              <View style={[
                styles.inputWrapper,
                zipCodeError && styles.inputWrapperError
              ]}>
                <Icon 
                  name="location-on" 
                  size={20} 
                  color={zipCodeError ? theme.colors.error : theme.colors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={zipCode}
                  onChangeText={handleZipCodeChange}
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              {zipCodeError && (
                <Text style={styles.errorText}>{zipCodeError}</Text>
              )}
              {/* Delivery Error Display */}
              {deliveryError && (
                <View style={styles.deliveryErrorContainer}>
                  <Icon name="error" size={16} color={theme.colors.error} />
                  <Text style={styles.deliveryErrorText}>{deliveryError}</Text>
                </View>
              )}
            </View>
            <View style={styles.infoBox}>
              <Icon name="info" size={16} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                We'll use this to calculate delivery charges and confirm service availability in your area.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, (!zipCode || isCheckingDelivery) && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!zipCode || isCheckingDelivery}
            >
              {isCheckingDelivery ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="add-shopping-cart" size={20} color="white" />
              )}
              <Text style={styles.confirmButtonText}>
                {isCheckingDelivery ? 'Checking Delivery...' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    ...theme.shadows.card,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.medium,
  },
  title: {
    flex: 1,
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.bold,
  },
  closeButton: {
    padding: theme.spacing.small,
  },
  productSummary: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing.medium,
    marginTop: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  productName: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.regular,
  },
  totalPrice: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
  },
  zipCodeSection: {
    padding: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  sectionSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large,
    lineHeight: 20,
    fontFamily: theme.fonts.family.regular,
  },
  inputContainer: {
    marginBottom: theme.spacing.medium,
  },
  inputLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.medium,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    marginRight: theme.spacing.small,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: theme.fonts.size.large,
    color: theme.colors.text,
    fontFamily: theme.fonts.family.regular,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fonts.size.small,
    marginTop: theme.spacing.small,
    fontFamily: theme.fonts.family.regular,
  },
  deliveryErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    marginTop: theme.spacing.small,
  },
  deliveryErrorText: {
    flex: 1,
    fontSize: theme.fonts.size.small,
    color: theme.colors.error,
    marginLeft: theme.spacing.small,
    lineHeight: 18,
    fontFamily: theme.fonts.family.regular,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fonts.size.small,
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
    lineHeight: 18,
    fontFamily: theme.fonts.family.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: theme.spacing.large,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: theme.spacing.medium,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
  },
  cancelButtonText: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.bold,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.card,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    marginLeft: theme.spacing.small,
    fontFamily: theme.fonts.family.bold,
  },
});

export default AddToCartModal;