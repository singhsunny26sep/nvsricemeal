import Geolocation from '@react-native-community/geolocation';
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
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide better services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        const result = granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 
                      granted === PermissionsAndroid.RESULTS.DENIED ? 'denied' : 'blocked';
        
        await locationLogger.logPermissionResult(result, context);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        
        const mappedResult = result === RESULTS.GRANTED ? 'granted' : 
                           result === RESULTS.DENIED ? 'denied' : 'blocked';
        
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
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Current position:', { latitude, longitude });
          
          // Log successful location retrieval
          locationLogger.logLocationRetrieved([latitude, longitude], context);
          
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting current position:', error);
          
          // Log failed location retrieval
          locationLogger.logLocationSaveFailed(`Failed to retrieve location: ${error.message}`, context);
          
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
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
      const response = await fetch('https://nvs-rice-mart.onrender.com/locations/create', {
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

  // Watch position changes
  watchPosition(callback: (location: LocationData) => void): void {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        callback({ latitude, longitude });
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
      }
    );
  }

  // Stop watching position
  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

export const locationService = new LocationService();
export default locationService;