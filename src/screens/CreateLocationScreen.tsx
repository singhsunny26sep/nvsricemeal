import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../constants/theme';
import { apiService } from '../utils/apiService';
import { useNavigation, useRoute } from '@react-navigation/native';
import Statusbar from '../constants/Statusbar';
import { locationService, LocationData } from '../utils/locationService';

interface LocationFormData {
  name: string;
  shopOrBuildingNumber: string;
  address: string;
  city: string;
  district: string;
  zipcode: string;
  state: string;
  area: string;
  country: string;
  coordinates: [number, number] | null;
}

export default function CreateLocationScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    shopOrBuildingNumber: '',
    address: '',
    city: '',
    district: '',
    zipcode: '',
    state: '',
    area: '',
    country: 'India',
    coordinates: null,
  });
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    const initialData = route.params?.initialLocationData;
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        shopOrBuildingNumber: initialData.shopOrBuildingNumber || '',
        address: initialData.address || '',
        city: initialData.city || '',
        district: initialData.district || '',
        zipcode: initialData.zipcode || '',
        state: initialData.state || '',
        area: initialData.area || '',
        country: initialData.country || 'India',
        coordinates: initialData.coordinates || null,
      });
      if (initialData.coordinates) {
        setLatitude(initialData.coordinates[0].toString());
        setLongitude(initialData.coordinates[1].toString());
      }
    }
  }, [route.params?.initialLocationData]);

  // Update formData.coordinates when latitude or longitude changes
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData(prev => ({ ...prev, coordinates: [lat, lng] }));
      } else {
        setFormData(prev => ({ ...prev, coordinates: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, coordinates: null }));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const profileResponse = await apiService.getUserProfile();
      if (profileResponse.success && profileResponse.data) {
        const uid = profileResponse.data.id;
        setUserId(uid);
        console.log('✅ User ID fetched:', uid);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user ID:', error);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      console.log('Getting current location...');
      
      // Request permission and get location
      const hasPermission = await locationService.requestLocationPermission('create_location');
      
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to set your location. Please enable location services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: getCurrentLocation }
          ]
        );
        return;
      }

      // Get current position
      const location: LocationData | null = await locationService.getCurrentPosition('create_location');
      
      if (location) {
        // Set latitude and longitude
        setLatitude(location.latitude.toString());
        setLongitude(location.longitude.toString());
        
        Alert.alert(
          'Location Found! 📍',
          `GPS coordinates obtained successfully!\n\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`
        );
        
        console.log('Location obtained:', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please check your location services and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: getCurrentLocation }
          ]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Failed to get location. Please ensure location services are enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Location name is required';
    if (!formData.shopOrBuildingNumber.trim()) return 'Shop/Building number is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.district.trim()) return 'District is required';
    if (!formData.zipcode.trim()) return 'Zipcode is required';
    if (!formData.state.trim()) return 'State is required';
    if (!formData.coordinates) return 'Coordinates are required. Use "Get Current Location" or enter latitude/longitude manually.';
    return null;
  };

   const handleCreateLocation = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    const effectiveUserId = route.params?.userId || userId;

    if (!effectiveUserId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    setLoading(true);

    try {
      console.log('=== CREATE LOCATION REQUEST ===');
      console.log('Form data:', formData);
      console.log('User ID:', userId);

      const locationData = {
        userId: effectiveUserId,
        name: formData.name.trim(),
        shopOrBuildingNumber: formData.shopOrBuildingNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        zipcode: formData.zipcode.trim(),
        state: formData.state.trim(),
        area: formData.area.trim(),
        country: formData.country.trim(),
        coordinates: formData.coordinates || undefined,
      };

      const response = await apiService.createLocation(locationData);
      console.log('Create location response:', response);
      if (response.success) {
        Alert.alert(
          'Success',
          'Location created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create location');
      }
    } catch (error) {
      console.error('❌ Error creating location:', error);
      Alert.alert('Error', 'An error occurred while creating location');
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    field: keyof LocationFormData,
    label: string,
    placeholder: string,
    iconName: string,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => {
    const fieldValue = formData[field];
    const stringValue = typeof fieldValue === 'string' ? fieldValue : '';
    return (
      <View style={styles.inputContainer} key={field}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
          <Icon name={iconName} size={20} color={theme.colors.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={stringValue}
            onChangeText={text => handleInputChange(field, text)}
            keyboardType={keyboardType}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Creating location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Statusbar />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Location</Text>
          </View>

          <View style={styles.formContainer}>
            {renderInputField('name', 'Location Name', 'e.g., Main Shop, Home', 'storefront')}
            {renderInputField('shopOrBuildingNumber', 'Shop/Building Number', 'e.g., 12A', 'location-city')}
            {renderInputField('address', 'Address', 'e.g., Near Market Road', 'map-marker')}
            {renderInputField('area', 'Area', 'e.g., Davanagere Taluku', 'map-marker')}
            {renderInputField('city', 'City', 'e.g., Davanagere', 'city')}
            {renderInputField('district', 'District', 'e.g., Davanagere', 'account-balance')}
            {renderInputField('zipcode', 'Zipcode', 'e.g., 577007', 'local-post-office', 'numeric')}
            {renderInputField('state', 'State', 'e.g., Karnataka', 'public')}
            {renderInputField('country', 'Country', 'e.g., India', 'public')}

            {/* Current Location Button */}
            <TouchableOpacity 
              style={[
                styles.currentBtn,
                loading && styles.currentBtnLoading
              ]}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Icon 
                name="my-location" 
                size={20} 
                color="white" 
                style={styles.gpsIcon} 
              />
              <Text style={styles.currentBtnText}>
                {loading ? 'Getting Location...' : 'Get Current Location'}
              </Text>
              {loading && (
                <View style={styles.loadingSpinner}>
                  <Icon name="refresh" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Latitude and Longitude Inputs */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <View style={styles.inputWrapper}>
                <Icon name="gps-fixed" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter latitude"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <View style={styles.inputWrapper}>
                <Icon name="gps-fixed" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter longitude"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateLocation}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>Create Location</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: theme.spacing.medium,
  },
  headerTitle: {
    fontSize: theme.fonts.size.xlarge,
    fontWeight: theme.fonts.weight.bold,
    color: theme.colors.text,
  },
  formContainer: {
    padding: theme.spacing.medium,
  },
  inputContainer: {
    marginBottom: theme.spacing.medium,
  },
  inputLabel: {
    fontSize: theme.fonts.size.medium,
    fontWeight: theme.fonts.weight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: theme.spacing.small,
  },
  inputIcon: {
    marginRight: theme.spacing.small,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fonts.size.medium,
    color: theme.colors.text,
    paddingVertical: theme.spacing.medium,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.medium,
    marginBottom: 90,
    ...theme.shadows.card,
  },
   createButtonText: {
     color: 'white',
     fontSize: theme.fonts.size.medium,
     fontWeight: theme.fonts.weight.bold,
   },

   /* Current Location Button */
   currentBtn: {
     flexDirection: 'row',
     backgroundColor: theme.colors.primary,
     marginTop: 20,
     padding: 16,
     borderRadius: 16,
     alignItems: 'center',
     justifyContent: 'center',
     elevation: 4,
     shadowColor: theme.colors.primary,
     shadowOpacity: 0.3,
     shadowRadius: 8,
     shadowOffset: { width: 0, height: 4 },
     borderWidth: 1,
     borderColor: 'rgba(255, 255, 255, 0.2)',
     marginBottom: 12,
   },
   currentBtnLoading: {
     backgroundColor: '#6c757d',
   },
   gpsIcon: {
     marginRight: 8,
   },
   loadingSpinner: {
     marginLeft: 8,
   },
   currentBtnText: {
     fontSize: 16,
     fontWeight: '700',
     color: 'white',
     fontFamily: theme.fonts.family.bold,
   }
});