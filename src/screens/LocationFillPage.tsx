import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  KeyboardTypeOptions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { locationService, LocationData } from '../utils/locationService';
import { locationLogger } from '../utils/locationLogger';
import GoogleMapComponent from '../components/GoogleMapComponent';

const { width } = Dimensions.get('window');

export default function LocationFillPage() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [shopOrBuildingNumber, setShopOrBuildingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [area, setArea] = useState('');
  const [country, setCountry] = useState('India');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false); // Load only when user requests

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // NOTE: Auto-fetch removed for performance - maps load only when needed
  }, []);

  const autoFetchCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      console.log('Auto-fetching current location...');
      
      // Request permission and get location automatically
      const hasPermission = await locationService.requestLocationPermission('auto_location');
      
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to set your delivery address. Please enable location services.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Retry', onPress: autoFetchCurrentLocation }
          ]
        );
        return;
      }

      // Get current position
      const location: LocationData | null = await locationService.getCurrentPosition('auto_location');
      
      if (location) {
        // Convert LocationData to [number, number] format
        const coords: [number, number] = [location.latitude, location.longitude];
        setCoordinates(coords);
        
        // Auto-fill address fields with location data
        setAddress('Current Location Address');
        setCity('Current City');
        setDistrict('Current District');
        setState('Current State');
        setZipCode('000000');
        setArea('Current Area');
        
        Alert.alert(
          '📍 Location Detected!',
          `Your GPS coordinates have been automatically captured:\n\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\n\nAddress fields have been pre-filled. You can modify them if needed.`
        );
        
        console.log('Auto location obtained:', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
        
        // Log the auto-fetch
        const recentLogs = await locationLogger.getRecentLogs(2);
        console.log('Auto location logs:', recentLogs);
        
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check your location services and try again.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Retry', onPress: autoFetchCurrentLocation }
          ]
        );
      }
    } catch (error) {
      console.error('Error auto-fetching location:', error);
      Alert.alert(
        'Location Error',
        'Failed to automatically get your location. Please check your location services.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: autoFetchCurrentLocation }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      console.log('Getting current location...');
      
      // Use the real location service with logging context
      const location: LocationData | null = await locationService.getLocation('current_location');
      
      if (location) {
        // Convert LocationData to [number, number] format
        const coords: [number, number] = [location.latitude, location.longitude];
        setCoordinates(coords);
        
        // Update form with location data
        setAddress('Current Location Address');
        setCity('Current City');
        setDistrict('Current District');
        setState('Current State');
        setZipCode('000000');
        setArea('Current Area');
        
        Alert.alert(
          'Success! 📍',
          `GPS coordinates obtained successfully!\n\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\n\n📊 Location logged for analytics`
        );
        
        console.log('Location obtained:', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
        
        // Show recent logs (optional debug info)
        const recentLogs = await locationLogger.getRecentLogs(3);
        console.log('Recent location logs:', recentLogs);
        
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please check permissions and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: handleCurrentLocation }
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
      setIsLoading(false);
    }
  };

  // Handle manual coordinate input
  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Input', 'Please enter valid latitude and longitude values');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Invalid Range', 'Latitude must be between -90 and 90, Longitude between -180 and 180');
      return;
    }
    
    setCoordinates([lat, lng]);
    Alert.alert('Success', `Coordinates set:\nLat: ${lat.toFixed(6)}\nLng: ${lng.toFixed(6)}`);
  };

  // Toggle location watching
  const toggleLocationWatching = async () => {
    if (isWatchingLocation) {
      locationService.stopWatching();
      setIsWatchingLocation(false);
      Alert.alert('Location Tracking', 'Stopped continuous location tracking\n\n📊 Live tracking stopped and logged');
    } else {
      const hasPermission = await locationService.requestLocationPermission('live_tracking');
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is required for tracking');
        return;
      }
      
      setIsWatchingLocation(true);
      Alert.alert('Location Tracking', 'Started continuous location tracking\n\n📊 Live tracking started and logged');
      
      locationService.watchPosition((location: LocationData) => {
        const coords: [number, number] = [location.latitude, location.longitude];
        setCoordinates(coords);
        
        // Log each live update
        locationLogger.logLocationRetrieved(coords, 'live_tracking');
        
        console.log('Live location update:', location);
      });
    }
  };

  // Handle loading the map when needed
  const handleLoadMap = () => {
    setShouldLoadMap(true);
    Alert.alert(
      '🗺️ Map Loading',
      'Google Maps is loading... You can now interact with the map to select your location.'
    );
  };

  const handleSaveLocation = async () => {
    // Validate required fields
    if (!coordinates && (!address || !city || !district || !zipCode || !state)) {
      Alert.alert('Error', 'Please provide coordinates OR all required address details');
      return;
    }

    setIsLoading(true);
    try {
      const locationData = {
        coordinates: coordinates || [0, 0],
        ...(name && { name }),
        ...(shopOrBuildingNumber && { shopOrBuildingNumber }),
        ...(address && { address }),
        ...(city && { city }),
        ...(district && { district }),
        ...(zipCode && { zipCode }),
        ...(state && { state }),
        ...(area && { area }),
        ...(country && { country }),
      };

      // Use enhanced location service with logging
      const success = await locationService.saveLocation(locationData, 'save_location');
      
      if (success) {
        Alert.alert('Success! 💾', 'Location saved successfully with logging enabled!');
        
        // Display recent location logs for user awareness
        const recentLogs = await locationLogger.getRecentLogs(2);
        if (recentLogs.length > 0) {
          console.log('Recent location activity logged:', recentLogs);
        }
        
        console.log('Location saved with logging:', locationData);
      } else {
        Alert.alert('Error', 'Failed to save location. Please try again.');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputWithIcon: React.FC<{
    icon: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
  }> = ({ icon, label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputIconContainer}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View 
          style={[
            styles.headerBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerInner}>
            <View style={styles.iconContainer}>
              <Icon name="location-on" size={60} color="white" />
            </View>
            <Text style={styles.bannerTitle}>Add Your Location</Text>
            <Text style={styles.bannerSubtitle}>
              Help us deliver your orders to the correct address
            </Text>
          </View>
        </Animated.View>

        {/* Floating Map Card */}
        <Animated.View 
          style={[
            styles.mapShadowWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.mapCard}>
            {shouldLoadMap ? (
              <GoogleMapComponent
                coordinates={coordinates}
                onLocationSelect={(coords) => {
                  setCoordinates(coords);
                  Alert.alert(
                    'Location Updated! 📍',
                    `Coordinates updated:\nLat: ${coords[0].toFixed(6)}\nLng: ${coords[1].toFixed(6)}`
                  );
                }}
                height={180}
                editable={true}
                showUserLocation={true}
              />
            ) : (
              <TouchableOpacity style={styles.mapLoadingButton} onPress={handleLoadMap}>
                <Icon name="map" size={80} color="#e0e0e0" />
                <Text style={styles.mapText}>Click to Load Map</Text>
                <Text style={styles.mapSubText}>Tap to open Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Form Card */}
        <Animated.View 
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.formHeader}>
            <Icon name="edit-location" size={24} color={theme.colors.primary} />
            <Text style={styles.formTitle}>Location Details</Text>
          </View>

          <View style={styles.formInstructions}>
            <Text style={styles.instructionsText}>
              Fill in your location details. You can either use GPS coordinates or provide address details.
            </Text>
          </View>

          <InputWithIcon
            icon="person"
            label="Location Name (Optional)"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Main Shop, Home, Office"
          />

          <InputWithIcon
            icon="store"
            label="Shop/Building Number (Optional)"
            value={shopOrBuildingNumber}
            onChangeText={setShopOrBuildingNumber}
            placeholder="e.g., 12A, Shop No. 5"
          />

          <InputWithIcon
            icon="home"
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street name, Area, Landmark"
          />

          <InputWithIcon
            icon="location-city"
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
          />

          <InputWithIcon
            icon="apartment"
            label="District"
            value={district}
            onChangeText={setDistrict}
            placeholder="Enter district"
          />

          <InputWithIcon
            icon="public"
            label="State"
            value={state}
            onChangeText={setState}
            placeholder="Enter state"
          />

          <InputWithIcon
            icon="local-post-office"
            label="Zip Code"
            value={zipCode}
            onChangeText={setZipCode}
            placeholder="Enter zipcode"
            keyboardType="numeric"
          />

          <InputWithIcon
            icon="place"
            label="Area (Optional)"
            value={area}
            onChangeText={setArea}
            placeholder="e.g., MG Road, Downtown"
          />

          <InputWithIcon
            icon="flag"
            label="Country (Optional)"
            value={country}
            onChangeText={setCountry}
            placeholder="Enter country"
          />

          {/* Current Location Button */}
          <TouchableOpacity 
            style={[
              styles.currentBtn,
              isLoading && styles.currentBtnLoading
            ]}
            onPress={handleCurrentLocation}
            disabled={isLoading}
          >
            <Icon 
              name="my-location" 
              size={20} 
              color="white" 
              style={styles.gpsIcon} 
            />
            <Text style={styles.currentBtnText}>
              {isLoading ? 'Getting Location...' : 'Get Current Location'}
            </Text>
            {isLoading && (
              <View style={styles.loadingSpinner}>
                <Icon name="refresh" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Live Location Tracking Toggle */}
          <TouchableOpacity 
            style={[
              styles.trackingBtn,
              isWatchingLocation && styles.trackingBtnActive
            ]}
            onPress={() => {
              if (isWatchingLocation) {
                locationService.stopWatching();
                setIsWatchingLocation(false);
                Alert.alert('Location Tracking', 'Stopped continuous location tracking');
              } else {
                locationService.requestLocationPermission().then(hasPermission => {
                  if (!hasPermission) {
                    Alert.alert('Permission Required', 'Location permission is required for tracking');
                    return;
                  }
                  
                  setIsWatchingLocation(true);
                  Alert.alert('Location Tracking', 'Started continuous location tracking');
                  
                  locationService.watchPosition((location: LocationData) => {
                    const coords: [number, number] = [location.latitude, location.longitude];
                    setCoordinates(coords);
                    console.log('Live location update:', location);
                  });
                });
              }
            }}
          >
            <Icon 
              name={isWatchingLocation ? "gps-off" : "gps-fixed"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.trackingBtnText}>
              {isWatchingLocation ? 'Stop Live Tracking' : 'Start Live Tracking'}
            </Text>
          </TouchableOpacity>

          {/* Coordinates Display Section */}
          <View style={styles.coordinatesSection}>
            <View style={styles.coordinatesHeader}>
              <Icon name="gps-fixed" size={20} color={theme.colors.primary} />
              <Text style={styles.coordinatesHeaderText}>GPS Coordinates</Text>
            </View>
            
            {coordinates ? (
              <View style={styles.coordinatesDisplay}>
                <View style={styles.coordinateItem}>
                  <Text style={styles.coordinateLabel}>Latitude:</Text>
                  <Text style={styles.coordinateValue}>{coordinates[0].toFixed(6)}</Text>
                </View>
                <View style={styles.coordinateItem}>
                  <Text style={styles.coordinateLabel}>Longitude:</Text>
                  <Text style={styles.coordinateValue}>{coordinates[1].toFixed(6)}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noCoordinatesDisplay}>
                <Icon name="location-off" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.noCoordinatesText}>No coordinates set</Text>
                <Text style={styles.noCoordinatesSubtext}>
                  Use "Get Current Location" or enter coordinates manually above
                </Text>
              </View>
            )}
          </View>

        </Animated.View>

        {/* Save Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.saveBtn, !coordinates && styles.disabledSaveButton]} 
            onPress={handleSaveLocation}
            disabled={!coordinates}
            activeOpacity={0.8}
          >
            <Icon name="check-circle" size={20} color="white" />
            <Text style={styles.saveText}>
              {!coordinates ? 'Getting GPS Location...' : 'Save Location'}
            </Text>
            {!coordinates && (
              <View style={styles.loadingSpinner}>
                <Icon name="refresh" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}


/* -------------------------------------------------- */
/*                    STYLES                          */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },

  /* Header */
  headerBanner: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  headerInner: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: theme.fonts.family.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
    lineHeight: 22,
  },

  /* Floating Map Card */
  mapShadowWrapper: {
    marginTop: -35,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mapCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 24,
    padding: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  mapLoadingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 12,
    fontFamily: theme.fonts.family.bold,
  },
  mapSubText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
  },

  /* Form Card */
  formCard: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: 12,
    fontFamily: theme.fonts.family.bold,
  },

  /* Enhanced Input Fields */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontFamily: theme.fonts.family.medium,
  },
  input: {
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
    fontFamily: theme.fonts.family.regular,
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
  },

  /* Buttons Container */
  buttonContainer: {
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 40,
  },

  /* Save Button */
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: theme.colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledSaveButton: {
    backgroundColor: '#6c757d',
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 12,
    fontFamily: theme.fonts.family.bold,
  },

  /* Secondary Button */
  secondaryBtn: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.family.medium,
  },

  /* Coordinates Display */
  coordinatesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  coordinatesText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 8,
    fontFamily: theme.fonts.family.medium,
    fontWeight: '500',
  },

  /* Enhanced Coordinates Section */
  coordinatesSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  coordinatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coordinatesHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: 8,
    fontFamily: theme.fonts.family.bold,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.family.medium,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.family.bold,
  },
  noCoordinatesDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCoordinatesText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: theme.fonts.family.medium,
  },
  noCoordinatesSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
    lineHeight: 16,
  },

  /* Form Instructions */
  formInstructions: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 117, 125, 0.2)',
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
    lineHeight: 20,
  },

  /* Manual Coordinates Section */
  manualCoordsSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  manualCoordsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: theme.fonts.family.bold,
  },
  coordInputsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  coordInputWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  coordInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontFamily: theme.fonts.family.medium,
  },
  coordInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: '#e9ecef',
    textAlign: 'center',
    fontFamily: theme.fonts.family.regular,
  },
  setCoordsBtn: {
    flexDirection: 'row',
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCoordsBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: theme.fonts.family.bold,
  },

  /* Live Location Tracking */
  trackingBtn: {
    flexDirection: 'row',
    backgroundColor: '#9c27b0',
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingBtnActive: {
    backgroundColor: '#d32f2f',
  },
  trackingBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: theme.fonts.family.bold,
  },
});
