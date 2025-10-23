// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: 'https://nvs-rice-mart.onrender.com/nvs-rice-mart',

  // Development URL (for local development)
  DEV_BASE_URL: 'https://nvs-rice-mart.onrender.com/nvs-rice-mart',

  // Production URL
  PROD_BASE_URL: 'https://nvs-rice-mart.onrender.com/nvs-rice-mart',

  // Image base URL
  IMAGE_BASE_URL: 'https://your-cdn.com/images',

  // API Endpoints
  ENDPOINTS: {
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    ORDERS: '/api/orders',
    USER: {
      PROFILE: '/users/get',
      UPDATE: '/users/update',
    },
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/loginOrSignin-with-email',
      LOGIN_MOBILE: '/auth/loginOrSignin-with-mobile',
      SEND_OTP: '/auth/loginOrSignin-with-mobile',
      VERIFY_OTP: '/auth/verify-otp',
      VERIFY_OTP_MOBILE: '/auth/verify-otp-mobile',
      LOGOUT: '/auth/logout',
    },
  },

  // API Keys (if needed)
  API_KEYS: {
    // Add your API keys here
    // GOOGLE_MAPS: 'your_google_maps_key',
    // STRIPE_PUBLISHABLE_KEY: 'your_stripe_key',
  },

  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,

  // Retry configuration
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
};

// Environment detection
export const getBaseUrl = (): string => {
  // You can modify this logic based on your environment detection needs
  // For React Native, you might want to use __DEV__ global variable
  // or check the app configuration

  // For now, defaulting to development URL
  // You can modify this based on your build configuration
  const isProduction = false; // Change this based on your build

  return isProduction ? API_CONFIG.PROD_BASE_URL : API_CONFIG.DEV_BASE_URL;
};

// Helper function to build full URLs
export const buildUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Export commonly used URLs
export const API_URLS = {
  PRODUCTS: buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS),
  CATEGORIES: buildUrl(API_CONFIG.ENDPOINTS.CATEGORIES),
  ORDERS: buildUrl(API_CONFIG.ENDPOINTS.ORDERS),
  USER_PROFILE: buildUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
  USER_UPDATE: buildUrl(API_CONFIG.ENDPOINTS.USER.UPDATE),
  REGISTER: buildUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
  LOGIN: buildUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
  LOGIN_MOBILE: buildUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN_MOBILE),
  SEND_OTP: buildUrl(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP),
  VERIFY_OTP: buildUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP),
  VERIFY_OTP_MOBILE: buildUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP_MOBILE),
  LOGOUT: buildUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
};