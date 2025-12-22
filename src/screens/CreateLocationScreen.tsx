import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  StatusBar,
} from 'react-native';
import { theme } from '../constants/theme';
import { apiService } from '../utils/apiService';
import { useNavigation } from '@react-navigation/native';

// Types for location creation
interface CreateLocationRequest {
  coordinates?: [number, number];
  userId?: string;
  name?: string;
  shopOrBuildingNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  zipcode?: string;
  state?: string;
  area?: string;
  country?: string;
}

export default function CreateLocationScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [useCoordinates, setUseCoordinates] = useState(true);
  
  // Form fields
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [name, setName] = useState('');
  const [shopOrBuildingNumber, setShopOrBuildingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [state, setState] = useState('');
  const [area, setArea] = useState('');
  const [country, setCountry] = useState('India');

  // Handle coordinate input
  const handleCoordinatesChange = (text: string) => {
    try {
      const coords = text.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && coords.every(coord => !isNaN(coord))) {
        setCoordinates([coords[0], coords[1]]);
      } else {
        setCoordinates(null);
      }
    } catch {
      setCoordinates(null);
    }
  };

  // Validate form
  const validateForm = (): string | null => {
    if (useCoordinates) {
      if (!coordinates) {
        return 'Please enter valid coordinates (format: latitude, longitude)';
      }
    } else {
      if (!address.trim()) return 'Address is required';
      if (!city.trim()) return 'City is required';
      if (!district.trim()) return 'District is required';
      if (!zipcode.trim()) return 'ZIP code is required';
      if (!state.trim()) return 'State is required';
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setLoading(true);

    try {
      const locationData: CreateLocationRequest = {};

      if (useCoordinates && coordinates) {
        locationData.coordinates = coordinates;
        // Optional fields when using coordinates
        if (name.trim()) locationData.name = name.trim();
        if (shopOrBuildingNumber.trim()) locationData.shopOrBuildingNumber = shopOrBuildingNumber.trim();
        if (country.trim()) locationData.country = country.trim();
      } else {
        // Required fields when not using coordinates
        locationData.address = address.trim();
        locationData.city = city.trim();
        locationData.district = district.trim();
        locationData.zipcode = zipcode.trim();
        locationData.state = state.trim();
        // Optional fields
        if (name.trim()) locationData.name = name.trim();
        if (shopOrBuildingNumber.trim()) locationData.shopOrBuildingNumber = shopOrBuildingNumber.trim();
        if (area.trim()) locationData.area = area.trim();
        if (country.trim()) locationData.country = country.trim();
      }

      console.log('🆕 Creating location with data:', locationData);

      const response = await apiService.createLocation(locationData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Location created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setName('');
                setShopOrBuildingNumber('');
                setAddress('');
                setCity('');
                setDistrict('');
                setZipcode('');
                setState('');
                setArea('');
                setCountry('India');
                setCoordinates(null);
                // Go back to save location screen and refresh
                // @ts-ignore - TypeScript navigation issue
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create location');
      }
    } catch (error) {
      console.log('🚨 Error creating location:', error);
      Alert.alert('Error', 'An error occurred while creating location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Location</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          Add a new delivery location
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Input Method Toggle */}
        <View style={styles.inputMethodContainer}>
          <Text style={styles.inputMethodLabel}>Location Input Method:</Text>
          <View style={styles.toggleContainer}>
            <Text style={[
              styles.toggleText,
              useCoordinates ? styles.activeToggleText : styles.inactiveToggleText
            ]}>
              Coordinates
            </Text>
            <Switch
              value={!useCoordinates}
              onValueChange={(value) => setUseCoordinates(!value)}
              trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
              thumbColor={useCoordinates ? theme.colors.card : theme.colors.primary}
            />
            <Text style={[
              styles.toggleText,
              !useCoordinates ? styles.activeToggleText : styles.inactiveToggleText
            ]}>
              Manual Entry
            </Text>
          </View>
        </View>

        {/* Coordinate Input */}
        {useCoordinates && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coordinates (Priority)</Text>
            <Text style={styles.sectionDescription}>
              Enter coordinates in format: latitude, longitude (e.g., 22.3060, 74.3558)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="22.3060, 74.3558"
              placeholderTextColor={theme.colors.textSecondary}
              onChangeText={handleCoordinatesChange}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        )}

        {/* Manual Entry Fields */}
        {!useCoordinates && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details (Required)</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter address"
                placeholderTextColor={theme.colors.textSecondary}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor={theme.colors.textSecondary}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>District *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter district"
                placeholderTextColor={theme.colors.textSecondary}
                value={district}
                onChangeText={setDistrict}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter state"
                placeholderTextColor={theme.colors.textSecondary}
                value={state}
                onChangeText={setState}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ZIP Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ZIP code"
                placeholderTextColor={theme.colors.textSecondary}
                value={zipcode}
                onChangeText={setZipcode}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Optional Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optional Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name/Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Main Shop, Home, Office"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop/House Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12A, Shop No. 5"
              placeholderTextColor={theme.colors.textSecondary}
              value={shopOrBuildingNumber}
              onChangeText={setShopOrBuildingNumber}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., MG Road, Downtown"
              placeholderTextColor={theme.colors.textSecondary}
              value={area}
              onChangeText={setArea}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Country"
              placeholderTextColor={theme.colors.textSecondary}
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Location</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.small,
  },
  backButton: {
    padding: theme.spacing.small,
  },
  backButtonText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.medium,
  },
  placeholder: {
    width: 50, // Same width as back button area for centering
  },
  headerTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  headerSubtitle: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.medium,
  },
  inputMethodContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
  },
  inputMethodLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    flex: 1,
  },
  activeToggleText: {
    color: theme.colors.primary,
  },
  inactiveToggleText: {
    color: theme.colors.textSecondary,
  },
  section: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  sectionDescription: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: theme.spacing.medium,
  },
  inputLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    backgroundColor: '#FAFAFA',
  },
  buttonContainer: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.large,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.large,
    fontWeight: theme.fonts.weight.bold,
  },
});