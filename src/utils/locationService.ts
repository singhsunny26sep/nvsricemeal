import GetLocation from 'react-native-get-location';
import { PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationLogger } from './locationLogger';

export interface LocationData {
  latitude: number;
  longitude: number;
}

class LocationService {
  private watchId: number | null = null;

  // Request location permission
  async requestLocationPermission(context: string = 'general'): Promise<boolean> {
    try {
      await locationLogger.logPermissionRequested(context, 'manual');

      if (Platform.OS === 'android') {
        const hasFineLocation = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (hasFineLocation) {
          await locationLogger.logPermissionResult('granted', context);
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show nearby stores and set delivery address.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const result =
          granted === PermissionsAndroid.RESULTS.GRANTED
            ? 'granted'
            : granted === PermissionsAndroid.RESULTS.DENIED
            ? 'denied'
            : 'blocked';
        await locationLogger.logPermissionResult(result, context);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        const mappedResult =
          result === RESULTS.GRANTED
            ? 'granted'
            : result === RESULTS.DENIED
            ? 'denied'
            : 'blocked';

        await locationLogger.logPermissionResult(mappedResult, context);
        return result === RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting location permission:', err);
      await locationLogger.logPermissionResult('unavailable', context);
      return false;
    }
  }

  // Get current position
  async getCurrentPosition(context: string = 'general'): Promise<LocationData> {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      console.log('Current position:', {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      locationLogger.logLocationRetrieved(
        [location.latitude, location.longitude],
        context,
      );
      return { latitude: location.latitude, longitude: location.longitude };
    } catch (error) {
      console.error('Error getting current position:', error);
      locationLogger.logLocationSaveFailed(
        `Failed to retrieve location: ${error}`,
        context,
      );
      throw error;
    }
  }

  // Reverse geocode coordinates to address using Google Maps API
  async reverseGeocode(latitude: number, longitude: number): Promise<{
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
    area?: string;
  }> {
    try {
      const apiKey = 'AIzaSyBjOyQJKvI37gg2PKY7HJmdJohZbdqYZq4';
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        let street = '';
        let city = '';
        let state = '';
        let country = 'India';
        let zipcode = '';
        let area = '';

        addressComponents.forEach((component: any) => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('route')) {
            street = component.long_name;
          } else if (types.includes('sublocality') || types.includes('neighborhood')) {
            area = component.long_name;
          } else if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('postal_code')) {
            zipcode = component.long_name;
          } else if (types.includes('country')) {
            country = component.long_name;
          }
        });

        const fullAddress = result.formatted_address;
        
        console.log('Reverse geocode result:', {
          address: fullAddress,
          street,
          city,
          state,
          country,
          zipcode,
          area
        });

        return {
          address: fullAddress,
          city,
          state,
          country,
          zipcode,
          area,
        };
      }

      console.warn('No geocode results found');
      return {};
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {};
    }
  }

  // Get location with permission check
  async getLocation(context: string = 'general'): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission(context);
      if (!hasPermission) {
        console.log('Location permission denied');
        return null;
      }

      const location = await this.getCurrentPosition(context);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // Save location data to API with logging
  async saveLocation(locationData: any, context: string = 'general'): Promise<boolean> {
    try {
      console.log('Saving location data:', locationData);

      // Ensure coordinates are in correct format: [latitude, longitude]
      let formattedCoordinates: [number, number] | null = null;
      if (locationData.coordinates && Array.isArray(locationData.coordinates) && locationData.coordinates.length === 2) {
        const lat = parseFloat(locationData.coordinates[0]); // latitude
        const lng = parseFloat(locationData.coordinates[1]);  // longitude

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error('Invalid coordinates format');
        }

        // Check if coordinates are within valid ranges
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error('Coordinates out of valid range');
        }

        formattedCoordinates = [lat, lng];
      }

      // Prepare API request body with coordinates as priority
      const apiRequestBody = {
        coordinates: formattedCoordinates, // [latitude, longitude] format as required
        ...(locationData.name && { name: locationData.name }),
        ...(locationData.shopOrBuildingNumber && { shopOrBuildingNumber: locationData.shopOrBuildingNumber }),
        ...(locationData.address && { address: locationData.address }),
        ...(locationData.city && { city: locationData.city }),
        ...(locationData.district && { district: locationData.district }),
        ...(locationData.state && { state: locationData.state }),
        ...(locationData.zipCode && { zipcode: locationData.zipCode }),
        ...(locationData.area && { area: locationData.area }),
        ...(locationData.country && { country: locationData.country }),
      };

      console.log('Formatted API request body:', apiRequestBody);

      // Log the save attempt
      if (formattedCoordinates) {
        await locationLogger.logLocationSaved(
          formattedCoordinates,
          locationData.address || locationData.name,
          context
        );
      }

      // Send to locations/create endpoint
      const response = await fetch('https://api.nvsricemart.com/nvs-rice-mart/locations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // Add your auth token
        },
        body: JSON.stringify(apiRequestBody),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Location saved successfully:', result);
        // Log successful save
        if (formattedCoordinates) {
          await locationLogger.logLocationSaved(
            formattedCoordinates,
            locationData.address || locationData.name,
            'api_success'
          );
        }

        return true;
      } else {
        const errorMessage = `Failed to save location: ${response.status} - ${response.statusText}`;
        console.error('API Error:', errorMessage);
        await locationLogger.logLocationSaveFailed(errorMessage, context);
        return false;
      }
    } catch (error) {
      const errorMessage = `Save location error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('Error saving location:', error);
      await locationLogger.logLocationSaveFailed(errorMessage, context);
      return false;
    }
  }

  // Watch position changes (not supported by react-native-get-location)
  watchPosition(_callback: (location: LocationData) => void): void {
    console.warn(
      'watchPosition is not supported with react-native-get-location. Use getCurrentPosition instead.',
    );
  }

  // Stop watching position (no-op)
  stopWatching(): void {}
}

export const locationService = new LocationService();
export default locationService;