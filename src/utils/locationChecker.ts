import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedLocation {
  _id: string;
  coordinates: [number, number];
  name?: string;
  shopOrBuildingNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  state?: string;
  area?: string;
  country?: string;
  createdAt: string;
}

export class LocationChecker {
  private static readonly LOCATIONS_STORAGE_KEY = '@nvs_user_locations';

  /**
   * Check if user has any saved locations
   * @returns Promise<boolean> - true if user has saved locations
   */
  static async hasSavedLocations(): Promise<boolean> {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        console.log('LocationChecker: No user token found');
        return false;
      }

      const response = await fetch('https://nvs-rice-mart.onrender.com/locations/getAll?country=india', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.data?.data && data.data.data.length > 0) {
        console.log('LocationChecker: Found saved locations:', data.data.data.length);
        return true;
      }

      console.log('LocationChecker: No saved locations found');
      return false;
    } catch (error) {
      console.error('LocationChecker: Error checking saved locations:', error);
      return false;
    }
  }

  /**
   * Get all saved locations for the user
   * @returns Promise<SavedLocation[] | null> - Array of saved locations or null if error
   */
  static async getSavedLocations(): Promise<SavedLocation[] | null> {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        console.log('LocationChecker: No user token found');
        return null;
      }

      const response = await fetch('https://nvs-rice-mart.onrender.com/locations/getAll?country=india', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.data?.data) {
        console.log('LocationChecker: Retrieved saved locations:', data.data.data.length);
        return data.data.data;
      }

      console.log('LocationChecker: No saved locations found');
      return [];
    } catch (error) {
      console.error('LocationChecker: Error getting saved locations:', error);
      return null;
    }
  }

  /**
   * Get the most recently used or primary saved location
   * @returns Promise<SavedLocation | null> - The primary saved location or null
   */
  static async getPrimaryLocation(): Promise<SavedLocation | null> {
    try {
      const locations = await this.getSavedLocations();
      if (locations && locations.length > 0) {
        // Sort by createdAt (most recent first) and return the first one
        const sortedLocations = locations.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('LocationChecker: Primary location found:', sortedLocations[0].name || sortedLocations[0].address);
        return sortedLocations[0];
      }
      return null;
    } catch (error) {
      console.error('LocationChecker: Error getting primary location:', error);
      return null;
    }
  }
}

export default LocationChecker;