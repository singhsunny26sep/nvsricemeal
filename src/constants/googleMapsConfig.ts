// Google Maps Configuration
// To get your API key, visit: https://console.cloud.google.com/apis/credentials
export const GOOGLE_MAPS_CONFIG = {
  // TODO: Replace with your actual Google Maps API key
  API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
  
  // Default region/country for better results
  REGION: 'IN',
  
  // Language for map labels and directions
  LANGUAGE: 'en',
  
  // Map style configurations
  MAP_STYLES: {
    STANDARD: 'standard',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain'
  },
  
  // Map type defaults
  DEFAULT_MAP_TYPE: 'standard' as const,
  
  // Location configuration
  DEFAULT_LOCATION: {
    latitude: 12.9716, // Bangalore, India
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Accuracy settings
  LOCATION_SETTINGS: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    distanceFilter: 10,
  }
};

// Instructions for setup:
/*
STEP 1: Get Google Maps API Key
- Go to https://console.cloud.google.com/apis/credentials
- Create a new project or select existing one
- Enable these APIs:
  - Maps SDK for Android
  - Maps SDK for iOS
  - Maps JavaScript API
  - Geocoding API
- Create credentials (API Key)
- Restrict the API key to your app package names and bundle IDs

STEP 2: Configure API Key
- Android: Add to android/app/src/main/AndroidManifest.xml:
  <meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_API_KEY_HERE"/>
  
- iOS: Add to ios/nvsricemall/AppDelegate.swift:
  import GoogleMaps
  GMSServices.provideAPIKey("YOUR_API_KEY_HERE")

STEP 3: Update the API_KEY above with your actual key
*/