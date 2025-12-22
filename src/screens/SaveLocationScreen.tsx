import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardTypeOptions,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { locationService, LocationData } from '../utils/locationService';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { apiService } from '../utils/apiService';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// API Response types
interface ApiLocation {
  _id: string;
  name: string | null;
  address: string;
  area: string;
  city: string;
  district: string;
  state: string;
  country: string;
  formattedAddress: string;
  zipcode: string;
  coordinates: [number, number];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiLocationResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    data: ApiLocation[];
  };
}

// Local storage type for saved locations (for add/edit functionality)
interface SavedLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  zipCode: string;
  area: string;
  coordinates: [number, number] | null;
  isDefault: boolean;
}

export default function SaveLocationScreen() {
  const navigation = useNavigation();
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]); // For user-added locations
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [area, setArea] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      setRequiresAuth(false);
      console.log('🔍 Fetching locations from API...');
      
      const response = await apiService.getLocations('india');
      
      if (response.success && response.data) {
        const locationData = response.data as ApiLocationResponse;
        if (locationData.success && locationData.data.data) {
          setLocations(locationData.data.data);
          console.log('✅ Locations fetched successfully:', locationData.data.data.length, 'locations');
        } else {
          setApiError('Invalid response format from server');
          console.error('❌ Invalid response format:', response.data);
        }
      } else {
        // Handle authentication error
        if (response.error && (response.error.includes('authorization') || response.error.includes('Access Denied'))) {
          setRequiresAuth(true);
          setApiError('Please login to view available locations.');
        } else {
          setApiError(response.error || 'Failed to fetch locations');
        }
        console.error('❌ API Error:', response.error);
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
      setApiError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  React.useEffect(() => {
    if (showAddForm) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [showAddForm]);

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location: LocationData | null = await locationService.getLocation('save_location');
      if (location) {
        const coords: [number, number] = [location.latitude, location.longitude];
        setCoordinates(coords);
        Alert.alert('📍 Location Captured', 'Your current location has been captured successfully!', [
          { text: 'OK' }
        ]);
      } else {
        Alert.alert('Location Error', 'Unable to access your location. Please check your permissions.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = () => {
    // Validate required fields
    const requiredFields = [
      { field: address, name: 'Address' },
      { field: city, name: 'City' },
      { field: state, name: 'State' },
    ];

    const missingFields = requiredFields.filter(f => !f.field.trim());
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in: ${missingFields.map(f => f.name).join(', ')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (zipCode && !/^\d{6}$/.test(zipCode)) {
      Alert.alert('Invalid PIN Code', 'Please enter a valid 6-digit PIN code.');
      return;
    }

    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name: locationName.trim() || (savedLocations.length === 0 ? 'Home' : 'Location ' + (savedLocations.length + 1)),
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      area: area.trim(),
      coordinates: coordinates,
      isDefault: savedLocations.length === 0,
    };

    setSavedLocations([...savedLocations, newLocation]);
    
    // Reset form
    resetForm();
    
    Alert.alert(
      '✅ Location Saved!',
      'Your location has been saved successfully.',
      [
        { 
          text: 'Add More', 
          onPress: () => setShowAddForm(true),
          style: 'default'
        },
        { 
          text: 'View Locations', 
          onPress: () => setShowAddForm(false),
          style: 'cancel'
        }
      ]
    );
  };

  const resetForm = () => {
    setLocationName('');
    setAddress('');
    setCity('');
    setDistrict('');
    setState('');
    setZipCode('');
    setArea('');
    setCoordinates(null);
    setShouldLoadMap(false);
    setIsFormDirty(false);
  };

  const handleDeleteLocation = (locationId: string) => {
    const locationToDelete = savedLocations.find(loc => loc.id === locationId);
    
    Alert.alert(
      '🗑️ Delete Location',
      `Are you sure you want to delete "${locationToDelete?.name}"?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSavedLocations(savedLocations.filter(loc => loc.id !== locationId));
            Alert.alert('Deleted', 'Location has been removed.');
          }
        }
      ]
    );
  };

  const handleSetDefault = (locationId: string) => {
    setSavedLocations(savedLocations.map(loc => ({
      ...loc,
      isDefault: loc.id === locationId
    })));
  };

  const handleLogin = () => {
    Alert.alert(
      'Login Required',
      'Please login to view available locations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Login', 
          onPress: () => {
            // Navigate to login screen
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const InputField: React.FC<{
    icon: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    required?: boolean;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
  }> = ({ 
    icon, 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    required = false, 
    keyboardType = 'default',
    multiline = false 
  }) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputIcon, value ? styles.inputIconActive : null]}>
        <Icon 
          name={icon} 
          size={20} 
          color={value ? theme.colors.primary : '#999'} 
        />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setIsFormDirty(true);
          }}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
    </View>
  );

  const LocationCard = ({ location }: { location: ApiLocation }) => (
    <View style={styles.locationCard}>
      <View style={styles.locationCardHeader}>
        <View style={styles.locationIconContainer}>
          <Icon 
            name={location.name ? "home" : "location-on"} 
            size={24} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationTitleRow}>
            <Text style={styles.locationName}>
              {location.name || 'Unnamed Location'}
            </Text>
            {location.isActive && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.locationAddress} numberOfLines={2}>
            {location.formattedAddress}
          </Text>
          <View style={styles.locationDetails}>
            <Text style={styles.locationDetailText}>
              {location.city}, {location.state}, {location.country}
            </Text>
            {location.zipcode && (
              <Text style={styles.zipCode}>PIN: {location.zipcode}</Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.locationActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            Alert.alert('Location Details', 
              `Address: ${location.formattedAddress}\n` +
              `City: ${location.city}\n` +
              `District: ${location.district}\n` +
              `State: ${location.state}\n` +
              `Country: ${location.country}\n` +
              `PIN: ${location.zipcode}\n` +
              `Coordinates: ${location.coordinates[0]}, ${location.coordinates[1]}`
            );
          }}
        >
          <Icon name="visibility" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, styles.viewButtonText]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SavedLocationCard = ({ location }: { location: SavedLocation }) => (
    <View style={styles.locationCard}>
      <View style={styles.locationCardHeader}>
        <View style={styles.locationIconContainer}>
          <Icon 
            name={location.isDefault ? "home" : "location-on"} 
            size={24} 
            color={location.isDefault ? "#FFB300" : theme.colors.primary} 
          />
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationTitleRow}>
            <Text style={styles.locationName}>{location.name}</Text>
            {location.isDefault && (
              <View style={styles.defaultBadge}>
                <Icon name="star" size={12} color="white" />
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.locationAddress} numberOfLines={2}>
            {location.address}
          </Text>
          <View style={styles.locationDetails}>
            <Text style={styles.locationDetailText}>
              {[location.area, location.city, location.state].filter(Boolean).join(', ')}
            </Text>
            {location.zipCode && (
              <Text style={styles.zipCode}>PIN: {location.zipCode}</Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.locationActions}>
        {!location.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, styles.setDefaultButton]}
            onPress={() => handleSetDefault(location.id)}
          >
            <Icon name="star-outline" size={16} color="#FFB300" />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            // TODO: Implement edit functionality
            Alert.alert('Edit Location', 'Edit functionality coming soon!');
          }}
        >
          <Icon name="edit" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteLocation(location.id)}
        >
          <Icon name="delete-outline" size={16} color="#ff4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAuthenticationRequired = () => (
    <View style={styles.authRequiredContainer}>
      <View style={styles.authRequiredIcon}>
        <Icon name="lock" size={64} color="#ff9800" />
      </View>
      <Text style={styles.authRequiredTitle}>Login Required</Text>
      <Text style={styles.authRequiredSubtitle}>
        You need to login to view available locations from the server.
      </Text>
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleLogin}
      >
        <Icon name="login" size={20} color="white" />
        <Text style={styles.loginButtonText}>Login Now</Text>
      </TouchableOpacity>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <TouchableOpacity 
        style={styles.addLocationButton}
        onPress={() => setShowAddForm(true)}
      >
        <Icon name="add-location" size={20} color={theme.colors.primary} />
        <Text style={styles.addLocationButtonText}>Add Your Own Location</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSavedLocations = () => (
    <Animated.View style={[styles.savedLocationsContainer, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="location-on" size={28} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>
            Available Locations
            <Text style={styles.locationCount}> ({locations.length})</Text>
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Icon name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.mainLoadingSpinner} />
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : requiresAuth ? (
        renderAuthenticationRequired()
      ) : apiError ? (
        <View style={styles.errorState}>
          <View style={styles.errorStateIcon}>
            <Icon name="error-outline" size={64} color="#ff4444" />
          </View>
          <Text style={styles.errorStateTitle}>Error Loading Locations</Text>
          <Text style={styles.errorStateSubtitle}>
            {apiError}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchLocations}
          >
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : locations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Icon name="location-off" size={64} color="#e0e0e0" />
          </View>
          <Text style={styles.emptyStateTitle}>No Locations Available</Text>
          <Text style={styles.emptyStateSubtitle}>
            No locations found for the specified criteria
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => setShowAddForm(true)}
          >
            <Icon name="add-location" size={20} color="white" />
            <Text style={styles.emptyStateButtonText}>Add Your First Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.locationsList}
        >
          {locations.map((location) => (
            <LocationCard key={location._id} location={location} />
          ))}
        </ScrollView>
      )}

      {/* Saved Locations Section */}
      {savedLocations.length > 0 && (
        <View style={styles.savedLocationsSection}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="bookmark" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>
              Your Saved Locations
              <Text style={styles.locationCount}> ({savedLocations.length})</Text>
            </Text>
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.locationsList}
          >
            {savedLocations.map((location) => (
              <SavedLocationCard key={location.id} location={location} />
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );

  const renderAddForm = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View 
        style={[
          styles.addFormContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formScrollContent}
          >
            <View style={styles.formHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  if (isFormDirty) {
                    Alert.alert(
                      'Discard Changes?',
                      'You have unsaved changes. Are you sure you want to go back?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Discard', style: 'destructive', onPress: () => {
                          resetForm();
                          setShowAddForm(false);
                        }}
                      ]
                    );
                  } else {
                    setShowAddForm(false);
                  }
                }}
              >
                <Icon name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.formTitle}>Add New Location</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Map Section */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionLabel}>Pin Your Location</Text>
              {shouldLoadMap ? (
                <GoogleMapComponent
                  coordinates={coordinates}
                  onLocationSelect={(coords) => {
                    setCoordinates(coords);
                    setIsFormDirty(true);
                  }}
                  height={180}
                  editable={true}
                  showUserLocation={true}
                />
              ) : (
                <TouchableOpacity 
                  style={styles.mapPlaceholder}
                  onPress={() => setShouldLoadMap(true)}
                >
                  <View style={styles.mapPlaceholderIcon}>
                    <Icon name="map" size={48} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.mapPlaceholderTitle}>Tap to Open Map</Text>
                  <Text style={styles.mapPlaceholderSubtitle}>
                    Pinpoint your exact location on the map
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Location Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Location Details</Text>
              
              <InputField
                icon="label"
                label="Location Name"
                value={locationName}
                onChangeText={setLocationName}
                placeholder="Home, Office, Shop, etc."
              />

              <InputField
                icon="home"
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="House no., Building, Street, Area"
                required={true}
                multiline={true}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <InputField
                    icon="location-city"
                    label="City"
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter city"
                    required={true}
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    icon="apartment"
                    label="District"
                    value={district}
                    onChangeText={setDistrict}
                    placeholder="Enter district"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <InputField
                    icon="public"
                    label="State"
                    value={state}
                    onChangeText={setState}
                    placeholder="Enter state"
                    required={true}
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    icon="local-post-office"
                    label="PIN Code"
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="6-digit PIN"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <InputField
                icon="place"
                label="Area/Locality"
                value={area}
                onChangeText={setArea}
                placeholder="Neighborhood or locality name"
              />
            </View>

            {/* Current Location Button */}
            <TouchableOpacity
              style={[styles.currentLocationBtn, isLoading && styles.currentLocationBtnDisabled]}
              onPress={handleGetCurrentLocation}
              disabled={isLoading}
            >
              <View style={styles.currentLocationIcon}>
                <Icon 
                  name={isLoading ? "refresh" : "my-location"} 
                  size={20} 
                  color="white" 
                />
                {isLoading && <View style={styles.secondaryLoadingSpinner} />}
              </View>
              <Text style={styles.currentLocationText}>
                {isLoading ? 'Getting Your Location...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  if (isFormDirty) {
                    Alert.alert(
                      'Discard Changes?',
                      'You have unsaved changes. Are you sure you want to cancel?',
                      [
                        { text: 'Continue Editing', style: 'cancel' },
                        { text: 'Discard', style: 'destructive', onPress: resetForm }
                      ]
                    );
                  } else {
                    resetForm();
                  }
                }}
              >
                <Icon name="close" size={20} color={theme.colors.textSecondary} />
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!address.trim() || !city.trim() || !state.trim()) && styles.saveBtnDisabled
                ]}
                onPress={handleSaveLocation}
                disabled={!address.trim() || !city.trim() || !state.trim()}
              >
                <Icon name="check" size={20} color="white" />
                <Text style={styles.saveText}>Save Location</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={showAddForm ? "#ffffff" : "#f8f9ff"} 
      />
      
      {/* Header - Only show when not in add form mode */}
      {!showAddForm && (
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Locations</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowAddForm(true)}
          >
            <Icon name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        {showAddForm ? renderAddForm() : renderSavedLocations()}
      </View>

      {/* Floating Action Button - Only show when in list view and has locations */}
      {!showAddForm && (locations.length > 0 || savedLocations.length > 0) && (
        <TouchableOpacity
          style={styles.floatingAddBtn}
          onPress={() => setShowAddForm(true)}
          activeOpacity={0.9}
        >
          <View style={styles.floatingAddBtnContent}>
            <Icon name="add-location" size={24} color="white" />
            <Text style={styles.floatingAddBtnText}>Add Location</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },

  // Saved Locations Styles
  savedLocationsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  locationCount: {
    color: theme.colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  mainLoadingSpinner: {
    width: 40,
    height: 40,
    borderWidth: 4,
    borderColor: '#f0f0f0',
    borderTopColor: theme.colors.primary,
    borderRadius: 20,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  
  // Authentication Required Styles
  authRequiredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  authRequiredIcon: {
    marginBottom: 24,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  authRequiredSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    maxWidth: 200,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 16,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  addLocationButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorStateIcon: {
    marginBottom: 24,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  errorStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 250,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 250,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  savedLocationsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  locationsList: {
    paddingBottom: 30,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  locationCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB300',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationDetailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  zipCode: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  setDefaultButton: {
    backgroundColor: '#FFF8E1',
  },
  viewButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  editButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButtonText: {
    color: theme.colors.primary,
  },
  editButtonText: {
    color: theme.colors.primary,
  },
  deleteButtonText: {
    color: '#ff4444',
  },

  // Add Form Styles
  addFormContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  formScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  mapSection: {
    marginBottom: 32,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapPlaceholderIcon: {
    marginBottom: 12,
  },
  mapPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  mapPlaceholderSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  inputIconActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
    minHeight: 24,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  required: {
    color: '#ff4444',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 32,
    elevation: 3,
  },
  currentLocationBtnDisabled: {
    opacity: 0.7,
  },
  currentLocationIcon: {
    marginRight: 10,
    position: 'relative',
  },
  secondaryLoadingSpinner: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: 12,
  },
  currentLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginLeft: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.success,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
    elevation: 0,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Floating Action Button
  floatingAddBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  floatingAddBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  floatingAddBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});