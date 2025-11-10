import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildUrl, TEST_TOKEN } from '../constants/config';

// Types for API responses
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginRequest {
  email?: string;
  phone?: string;
  mobile?: string;
  type: 'email' | 'phone';
}

interface EmailPasswordLoginRequest {
  email: string;
  password: string;
}

interface NewLoginRequest {
  type: 'email' | 'mobile';
  email?: string;
  mobile?: string;
  password: string;
  role?: string;
  fcmToken: string;
}

interface OTPRequest {
  identifier: string; // email or phone
  otp: string;
  type: 'email' | 'phone';
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  token?: string;
  avatar?: string;
  bio?: string;
  address?: string;
}

interface OTPSessionData {
  sessionId: string;
  mobile: string;
  otpData: any;
  isFirst: boolean;
}

class ApiService {
  private currentSession: OTPSessionData | null = null;

  // Store OTP session data
  storeOTPSession(sessionData: OTPSessionData): void {
    this.currentSession = sessionData;
    console.log('✅ OTP Session STORED:', sessionData);
    console.log('✅ Session ID stored:', sessionData.sessionId);
  }

  // Get current OTP session data
  getOTPSession(): OTPSessionData | null {
    console.log('🔍 Getting OTP session:', this.currentSession);
    return this.currentSession;
  }

  // Clear OTP session data
  clearOTPSession(): void {
    console.log('🗑️ Clearing OTP session:', this.currentSession);
    this.currentSession = null;
    console.log('✅ OTP Session cleared');
  }

  // Debug method to check current session (for testing)
  debugGetCurrentSession(): OTPSessionData | null {
    console.log('🔍 DEBUG: Current session data:', this.currentSession);
    return this.currentSession;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log('=== API REQUEST DEBUG ===');
    console.log('Full URL:', url);
    console.log('Method:', config.method || 'GET');
    console.log('Headers:', config.headers);
    console.log('Body:', config.body);

    try {
      const response = await fetch(url, config);
      const responseText = await response.text();
      console.log('=== API RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response parsed successfully:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.log('Raw response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        console.error('API Error Response:', data);
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.log('✅ API Response successful, returning data');
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Login with email and password
  async loginWithEmailPassword(request: EmailPasswordLoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.LOGIN;

    const response = await this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Store token in AsyncStorage if login is successful
    if (response.success && response.data?.token) {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('userToken', response.data.token);
      console.log('✅ Token stored in AsyncStorage after email login');
    }

    return response;
  }

  // New login method with enhanced structure
  async login(request: NewLoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.LOGIN;

    const response = await this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Store token in AsyncStorage if login is successful
    if (response.success && response.data?.token) {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('userToken', response.data.token);
      console.log('✅ Token stored in AsyncStorage after login');
    }

    return response;
  }

  // Mobile login method - Simple format with just mobile number
  async loginWithMobile(request: { mobile: string; role?: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.LOGIN_MOBILE;

    console.log('=== MOBILE LOGIN DEBUG ===');
    console.log('Mobile number:', request.mobile);

    const response = await this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: request.mobile,
        // role is optional, server defaults to 'user'
      }),
    });

    // Store token in AsyncStorage if login is successful
    if (response.success && response.data?.token) {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('userToken', response.data.token);
      console.log('✅ Token stored in AsyncStorage after mobile login');
    }

    return response;
  }

  // Register new user
  async register(request: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.REGISTER;

    const response = await this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Store token in AsyncStorage if registration is successful
    if (response.success && response.data?.token) {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('userToken', response.data.token);
      console.log('✅ Token stored in AsyncStorage after registration');
    }

    return response;
  }

  // Send OTP to email or phone
  async sendOTP(request: LoginRequest): Promise<ApiResponse<{ data: { otpData: any; isFirst: boolean } }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.SEND_OTP;
    const url = buildUrl(endpoint);

    console.log('=== SEND OTP DEBUG INFO ===');
    console.log('Request data:', request);
    console.log('API URL:', url);
    console.log('Full URL with base:', url);

    // Convert 'phone' field to 'mobile' for API compatibility
    const apiRequest = { ...request };
    if (apiRequest.phone && !apiRequest.mobile) {
      apiRequest.mobile = apiRequest.phone;
      delete apiRequest.phone;
    }

    console.log('Converted request for API:', apiRequest);

    const response = await this.request<{ otpData: any; isFirst: boolean }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(apiRequest),
    });

    // Store session data if OTP was sent successfully
    console.log('🔍 Checking response for session storage:', response);
    console.log('🔍 Response data type:', typeof response.data);
    console.log('🔍 Response data keys:', response.data ? Object.keys(response.data) : 'No data');

    if (response.data && response.data.data && response.data.data.otpData) {
      console.log('🔍 otpData type:', typeof response.data.data.otpData);
      console.log('🔍 otpData keys:', Object.keys(response.data.data.otpData));
      console.log('🔍 otpData.Details exists:', 'Details' in response.data.data.otpData);
      console.log('🔍 otpData.Details value:', response.data.data.otpData.Details);
    }
    console.log('🔍 Full response data:', JSON.stringify(response.data, null, 2));
    if (response.success && response.data && response.data.data) {
      console.log('✅ Response successful, extracting session data...');
      // Extract sessionId from the response structure
      const sessionId = response?.data?.data?.otpData?.Details;
      console.log('🔍 Extracted sessionId:', sessionId);
      console.log('🔍 Mobile from request:', apiRequest.mobile || apiRequest.phone);
      if (sessionId) {
        const sessionData: OTPSessionData = {
          sessionId: sessionId,
          mobile: apiRequest.mobile || apiRequest.phone || '',
          otpData: response.data.data.otpData,
          isFirst: response.data.data.isFirst || false
        };
        console.log('💾 About to store session:', sessionData);
        this.storeOTPSession(sessionData);
        console.log('✅ SESSION STORED SUCCESSFULLY');
        // Verify storage worked
        const storedSession = this.getOTPSession();
        console.log('🔍 Verification - Retrieved session:', storedSession);
      } else {
        console.log('❌ No sessionId found in otpData.Details');
        console.log('Available paths:', {
          'data.data.otpData.Details': response.data?.data?.otpData?.Details,
          'data.data.otpData exists': !!response.data?.data?.otpData,
          'data.data exists': !!response.data?.data,
          'data exists': !!response.data
        });
      }
    } else {
      console.log('❌ SESSION NOT STORED - Response not successful');
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
    }

    return response;
  }

  // Verify OTP and login
  async verifyOTP(request: OTPRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP;

    return this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Verify mobile OTP and login
  async verifyMobileOTP(request: {
    mobile?: string;
    otp: string;
    sessionId?: string;
    fcmToken?: string;
    currentScreen?: string;
    role?: string;
  }): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP_MOBILE;

    console.log('=== VERIFY MOBILE OTP DEBUG ===');
    console.log('Input request:', request);

    // Use sessionId from request, fallback to stored session if not provided
    const sessionId = request.sessionId || this.getOTPSession()?.sessionId || '';
    console.log('🔍 Session ID used for verification:', sessionId);

    // Use mobile from request
    const mobileNumber = request.mobile || '';

    // Prepare the complete request body as per API specification
    const verifyRequest = {
      sessionId: sessionId,
      mobile: mobileNumber,
      otp: request.otp,
      fcmToken: request.fcmToken || '',
      currentScreen: request.currentScreen || 'LANDING',
      role: request.role || 'user',
      loginType: 'mobile'
    };

    console.log('Final verify request:', verifyRequest);
    console.log('Request body being sent to API:', JSON.stringify(verifyRequest, null, 2));

    const response = await this.request<{ user: User; token: string }>(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyRequest),
    });

    // Store token in AsyncStorage if verification is successful
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      console.log('✅ Token stored in AsyncStorage after verification:', response.data.token.substring(0, 20) + '...');
    }

    // Clear session data after successful verification
    if (response.success) {
      this.clearOTPSession();
      console.log('✅ OTP session cleared after successful verification');
    }

    return response;
  }

  // Get user profile
  async getUserProfile(): Promise<ApiResponse<User>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER.PROFILE;
    console.log('Profile API URL:', buildUrl(endpoint));

    const token = await AsyncStorage.getItem('userToken');
    console.log('Token retrieved from AsyncStorage:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('No token found in AsyncStorage');
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    console.log('Using token from AsyncStorage:', token.substring(0, 20) + '...');

    const response = await this.request<any>(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Transform the API response to match our User interface
    if (response.success && response.data) {
      const apiData = response.data;
      const transformedUser: User = {
        id: apiData._id || apiData.id,
        name: apiData.name || '',
        email: apiData.email || '',
        phone: apiData.mobile || apiData.phone,
        avatar: apiData.image || apiData.avatar,
        bio: apiData.bio || '',
        address: apiData.address || '',
      };

      console.log('Transformed user data:', transformedUser);

      return {
        success: true,
        data: transformedUser,
      };
    }

    return response;
  }

  // Logout
  async logout(): Promise<ApiResponse<{ loggedOut: boolean }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.LOGOUT;

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token retrieved from AsyncStorage:', token ? 'Token exists' : 'No token');


    if (!token) {
      console.log('No token found in AsyncStorage for logout');
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    console.log('Logging out with token from AsyncStorage');

    return this.request<{ loggedOut: boolean }>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Get all categories
  async getCategories(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CATEGORIES_API.GET_ALL;

    // Get token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token retrieved from AsyncStorage:', token ? 'Token exists' : 'No token');

      if (!token) {
        console.log('No token found in AsyncStorage for getCategories');
        // Use test token for development
        console.log('Using test token for development...');
        return this.request<any>(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`,
          },
        });
      }

      console.log('Getting categories with token from AsyncStorage');

      return this.request<any>(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error accessing AsyncStorage:', error);
      // Use test token as fallback
      console.log('Using test token due to storage error...');
      return this.request<any>(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
      });
    }
  }

  // Get all subcategories
  async getSubCategories(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.SUBCATEGORIES_API.GET_ALL;

    // Get token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token retrieved from AsyncStorage:', token ? 'Token exists' : 'No token');

      if (!token) {
        console.log('No token found in AsyncStorage for getSubCategories');
        // Use test token for development
        console.log('Using test token for development...');
        return this.request<any>(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`,
          },
        });
      }

      console.log('Getting subcategories with token from AsyncStorage');

      return this.request<any>(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error accessing AsyncStorage:', error);
      // Use test token as fallback
      console.log('Using test token due to storage error...');
      return this.request<any>(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
      });
    }
  }

  // Get all products
  async getProducts(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS;

    // Get token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token retrieved from AsyncStorage:', token ? 'Token exists' : 'No token');

      if (!token) {
        console.log('No token found in AsyncStorage for getProducts');
        // Use test token for development
        console.log('Using test token for development...');
        return this.request<any>(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`,
          },
        });
      }

      console.log('Getting products with token from AsyncStorage');

      return this.request<any>(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error accessing AsyncStorage:', error);
      // Use test token as fallback
      console.log('Using test token due to storage error...');
      return this.request<any>(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
      });
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export session management methods for use in components
export const storeOTPSession = (sessionData: OTPSessionData) => apiService.storeOTPSession(sessionData);
export const getOTPSession = () => apiService.getOTPSession();
export const clearOTPSession = () => apiService.clearOTPSession();
