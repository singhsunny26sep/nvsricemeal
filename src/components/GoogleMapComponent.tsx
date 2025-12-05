import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GOOGLE_MAPS_CONFIG } from '../constants/googleMapsConfig';

// Define types for the map component
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Define types for the map component
interface GoogleMapComponentProps {
  coordinates?: [number, number] | null;
  onRegionChange?: (region: Region) => void;
  onLocationSelect?: (coordinates: [number, number]) => void;
  height?: number;
  editable?: boolean;
  showUserLocation?: boolean;
  region?: Region;
}

export default function GoogleMapComponent({
  coordinates = null,
  onRegionChange,
  onLocationSelect,
  height = 200,
  editable = false,
  showUserLocation = true,
  region
}: GoogleMapComponentProps) {
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(coordinates);

  // Update selected coordinates when props change
  useEffect(() => {
    if (coordinates) {
      setSelectedCoordinates(coordinates);
    }
  }, [coordinates]);

  // Handle location selection (placeholder functionality)
  const handleLocationSelection = () => {
    if (editable && onLocationSelect && selectedCoordinates) {
      onLocationSelect(selectedCoordinates);
    }
  };

  // Validate if API key is configured
  const isApiKeyConfigured = () => {
    return GOOGLE_MAPS_CONFIG.API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
  };

  // Fallback map region if no coordinates provided
  const displayRegion = region || {
    latitude: selectedCoordinates ? selectedCoordinates[0] : GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION.latitude,
    longitude: selectedCoordinates ? selectedCoordinates[1] : GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION.longitude,
    latitudeDelta: GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION.latitudeDelta,
    longitudeDelta: GOOGLE_MAPS_CONFIG.DEFAULT_LOCATION.longitudeDelta,
  };

  // Show API key warning if not configured
  if (!isApiKeyConfigured()) {
    return (
      <View style={[styles.container, styles.apiKeyWarning, { height }]}>
        <View style={styles.warningContent}>
          <Icon name="warning" size={40} color="#ffc107" style={styles.warningIcon} />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Google Maps API Key Required</Text>
            <Text style={styles.warningSubtitle}>
              Please configure your Google Maps API key in src/constants/googleMapsConfig.ts
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.setupButton}
          onPress={() => {
            Alert.alert(
              'Setup Instructions',
              '1. Get API key from Google Cloud Console\n2. Enable Maps SDK for Android/iOS\n3. Update src/constants/googleMapsConfig.ts',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.setupButtonText}>View Setup Guide</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {/* Map Placeholder with Location Info */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapHeader}>
          <Icon name="map" size={60} color="#e0e0e0" />
          <Text style={styles.mapTitle}>
            {selectedCoordinates ? '📍 Location Selected' : '🗺️ Interactive Map'}
          </Text>
          <Text style={styles.mapSubtitle}>
            {selectedCoordinates 
              ? `Lat: ${selectedCoordinates[0].toFixed(6)}, Lng: ${selectedCoordinates[1].toFixed(6)}`
              : 'Google Maps will appear here when configured'
            }
          </Text>
        </View>
        
        {/* Location Actions */}
        <View style={styles.locationActions}>
          {selectedCoordinates && (
            <TouchableOpacity 
              style={styles.coordButton}
              onPress={handleLocationSelection}
            >
              <Icon name="my-location" size={16} color="#4285F4" />
              <Text style={styles.coordButtonText}>Use These Coordinates</Text>
            </TouchableOpacity>
          )}
          
          {editable && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                Alert.alert(
                  'Edit Location',
                  'Full map editing will be available once Google Maps is fully configured.'
                );
              }}
            >
              <Icon name="edit-location" size={16} color="#4CAF50" />
              <Text style={styles.editButtonText}>Edit on Map</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Coordinates Display */}
      {selectedCoordinates && (
        <View style={styles.coordinatesDisplay}>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>Latitude:</Text>
            <Text style={styles.coordValue}>{selectedCoordinates[0].toFixed(6)}</Text>
          </View>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>Longitude:</Text>
            <Text style={styles.coordValue}>{selectedCoordinates[1].toFixed(6)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  
  // API Key Warning Styles
  apiKeyWarning: {
    borderWidth: 2,
    borderColor: '#ffc107',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 16,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  warningSubtitle: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  setupButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setupButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  
  // Map Placeholder Styles
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginTop: 12,
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Location Actions Styles
  locationActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  coordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  coordButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4285F4',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  
  // Coordinates Display Styles
  coordinatesDisplay: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  coordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  coordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  coordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
});