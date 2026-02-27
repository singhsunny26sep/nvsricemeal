import React, { useState, useEffect } from 'react';
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
import { locationService, LocationData } from '../utils/locationService';

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
  const [autoLoading, setAutoLoading] = useState(true);
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

  // UseEffect to handle initial location setup with coordinates
  useEffect(() => {
    // Automatically set the provided coordinates and create location
    handleLocationWithCoordinates();
  }, []);

  // Function to handle location with provided coordinates and create location via API
  const handleLocationWithCoordinates = async () => {
    console.log('========================================');
    console.log('🌍 LOCATION CREATION PROCESS STARTED');
    console.log('========================================');
    
    // Step 1: Request location permission
    console.log('\n📋 Step 1: Requesting location permission...');
    const hasPermission = await locationService.requestLocationPermission('create_location');
    
    console.log('📍 Permission Status:', hasPermission ? '✅ GRANTED' : '❌ DENIED');
    
    if (!hasPermission) {
      console.log('⚠️ Location permission denied. Will still try with provided coordinates.');
    }
    
    // Step 2: Use provided coordinates
    const providedCoordinates: [number, number] = [23.399907222595825, 85.3436458825527];
    
    console.log('\n📍 Step 2: Using provided coordinates');
    console.log('   Latitude:', providedCoordinates[0]);
    console.log('   Longitude:', providedCoordinates[1]);
    
    setCoordinates(providedCoordinates);
    
    // Step 3: Create location via API
    console.log('\n🚀 Step 3: Creating location via API...');
    console.log('   API Endpoint: https://nvs-rice-mart.onrender.com/nvs-rice-mart/locations/create');
    console.log('   Request Payload:', JSON.stringify({
      coordinates: providedCoordinates,
      name: 'Test Location',
      country: 'India'
    }, null, 2));
    
    try {
      const response = await apiService.createLocation({
        coordinates: providedCoordinates,
        name: 'Test Location',
        country: 'India'
      });
      
      console.log('\n📥 API Response Received:');
      console.log('   Success:', response.success);
      console.log('   Data:', JSON.stringify(response.data, null, 2));
      console.log('   Message:', response.message);
      console.log('   Error:', response.error);
      
      if (response.success) {
        console.log('\n✅ ✅ ✅ LOCATION CREATED SUCCESSFULLY! ✅ ✅ ✅');
        Alert.alert(
          'Success! 🎉',
          `Location created successfully!\n\nCoordinates:\nLat: ${providedCoordinates[0]}\nLng: ${providedCoordinates[1]}`
        );
      } else {
        console.log('\n❌ LOCATION CREATION FAILED');
        Alert.alert('Error', response.error || 'Failed to create location');
      }
    } catch (error) {
      console.log('\n🚨 EXCEPTION OCCURRED:');
      console.log('   Error:', error);
      console.log('   Error Message:', error instanceof Error ? error.message : 'Unknown error');
      Alert.alert('Error', 'An unexpected error occurred');
    }
    
    console.log('\n========================================');
    console.log('🏁 LOCATION CREATION PROCESS COMPLETED');
    console.log('========================================\n');
    
    setAutoLoading(false);
  };

  // Auto-fetch current GPS location
  const autoFetchLocation = async () => {
    setAutoLoading(true);
    try {
      // Request location permission
      const hasPermission = await locationService.requestLocationPermission('create_location');

      if (hasPermission) {
        // Get current position
        const location: LocationData | null = await locationService.getCurrentPosition('create_location');

        if (location) {
          const coords: [number, number] = [location.latitude, location.longitude];
          setCoordinates(coords);

          console.log('📍 Auto GPS Coordinates obtained:');
          console.log('   Latitude:', location.latitude);
          console.log('   Longitude:', location.longitude);

          Alert.alert(
            '📍 GPS Location Found!',
            `Your current location:

      Latitude: ${location.latitude.toFixed(6)}
       Longitude: ${location.longitude.toFixed(6)}

          These coordinates will be sent to create your location.`
          );
        } else {
          console.log('⚠️ Could not get GPS location');
        }
      } else {
        console.log('⚠️ Location permission denied');
      }
    } catch (error) {
      console.error('Error auto-fetching location:', error);
    } finally {
      setAutoLoading(false);
    }
  };

  // Handle coordinate input
  const handleCoordinatesChange = (text: string) => {
    try {
      const coords = text.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && coords.every(coord => !isNaN(coord))) {
        console.log('📝 Manual coordinates updated:', coords);
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

    console.log('========================================');
    console.log('📤 SUBMITTING LOCATION FORM');
    console.log('========================================');

    try {
      const locationData: CreateLocationRequest = {};

      if (useCoordinates && coordinates) {
        locationData.coordinates = coordinates;
        // Optional fields when using coordinates
        if (name.trim()) locationData.name = name.trim();
        if (shopOrBuildingNumber.trim()) locationData.shopOrBuildingNumber = shopOrBuildingNumber.trim();
        if (country.trim()) locationData.country = country.trim();
        
        console.log('📍 Using Coordinates Mode:');
        console.log('   Coordinates:', coordinates);
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
        
        console.log('📝 Using Manual Entry Mode:');
        console.log('   Address:', locationData.address);
        console.log('   City:', locationData.city);
        console.log('   District:', locationData.district);
      }

      console.log('\n📦 Full Form Data:', JSON.stringify(locationData, null, 2));
      console.log('\n🚀 Calling createLocation API...');

      const response = await apiService.createLocation(locationData);

      console.log('\n📥 API Response:');
      console.log('   Success:', response.success);
      console.log('   Data:', JSON.stringify(response.data, null, 2));
      console.log('   Error:', response.error);

      if (response.success) {
        console.log('\n✅ ✅ ✅ LOCATION CREATED SUCCESSFULLY! ✅ ✅ ✅');
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
      console.log('========================================\n');
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

            {/* Auto-fetched coordinates display */}
            {autoLoading ? (
              <View style={styles.autoFetchContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.autoFetchText}>Getting GPS location...</Text>
              </View>
            ) : coordinates ? (
              <View style={styles.coordinatesDisplay}>
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Latitude:</Text>
                  <Text style={styles.coordinateValue}>{coordinates[0].toFixed(6)}</Text>
                </View>
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Longitude:</Text>
                  <Text style={styles.coordinateValue}>{coordinates[1].toFixed(6)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={autoFetchLocation}
                >
                  <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
                </TouchableOpacity>
              </View>
            ) : null}

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
  autoFetchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.medium,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  autoFetchText: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    marginLeft: theme.spacing.small,
  },
  coordinatesDisplay: {
    padding: theme.spacing.medium,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  coordinateLabel: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weight.medium,
  },
  coordinateValue: {
    fontSize: theme.fonts.size.medium,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weight.bold,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.small,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.small,
    fontWeight: theme.fonts.weight.medium,
  },
});