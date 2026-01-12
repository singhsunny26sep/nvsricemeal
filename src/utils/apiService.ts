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

interface CreateOrderRequest {
  paymentMethod: 'COD' | 'ONLINE';
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

    // Get token from AsyncStorage for authenticated requests
    const token = await AsyncStorage.getItem('userToken');
    
    console.log('🔑 TOKEN DEBUG: Retrieved token from AsyncStorage');
    console.log('🔑 TOKEN DEBUG: Token exists:', !!token);
    console.log('🔑 TOKEN DEBUG: Token length:', token ? token.length : 0);
    if (token) {
      console.log('🔑 TOKEN DEBUG: Token preview:', token.substring(0, 20) + '...');
      console.log('🔑 TOKEN DEBUG: Full token:', token);
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };


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
      console.log('🔑 EMAIL LOGIN SUCCESS: Token stored in AsyncStorage');
      console.log('🔑 EMAIL LOGIN: Token value:', response.data.token);
      console.log('🔑 EMAIL LOGIN: Token length:', response.data.token.length);
    } else {
      console.log('❌ EMAIL LOGIN FAILED: No token received');
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
      console.log('🔑 ENHANCED LOGIN SUCCESS: Token stored in AsyncStorage');
      console.log('🔑 ENHANCED LOGIN: Token value:', response.data.token);
      console.log('🔑 ENHANCED LOGIN: Token length:', response.data.token.length);
    } else {
      console.log('❌ ENHANCED LOGIN FAILED: No token received');
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
      console.log('🔑 MOBILE LOGIN SUCCESS: Token stored in AsyncStorage');
      console.log('🔑 MOBILE LOGIN: Token value:', response.data.token);
      console.log('🔑 MOBILE LOGIN: Token length:', response.data.token.length);
    } else {
      console.log('❌ MOBILE LOGIN FAILED: No token received');
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
      console.log('🔑 REGISTER SUCCESS: Token stored in AsyncStorage');
      console.log('🔑 REGISTER: Token value:', response.data.token);
      console.log('🔑 REGISTER: Token length:', response.data.token.length);
    } else {
      console.log('❌ REGISTER FAILED: No token received');
    }

    return response;
  }

  // Send OTP to email or phone
  async sendOTP(request: LoginRequest): Promise<ApiResponse<any>> {
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

    if (response.data && (response.data as any).data && (response.data as any).data.otpData) {
      console.log('🔍 otpData type:', typeof (response.data as any).data.otpData);
      console.log('🔍 otpData keys:', Object.keys((response.data as any).data.otpData));
      console.log('🔍 otpData.Details exists:', 'Details' in (response.data as any).data.otpData);
      console.log('🔍 otpData.Details value:', (response.data as any).data.otpData.Details);
    }
    console.log('🔍 Full response data:', JSON.stringify(response.data, null, 2));
    if (response.success && response.data && (response.data as any).data) {
      console.log('✅ Response successful, extracting session data...');
      // Extract sessionId from the response structure
      const sessionId = (response.data as any)?.data?.otpData?.Details;
      console.log('🔍 Extracted sessionId:', sessionId);
      console.log('🔍 Mobile from request:', apiRequest.mobile || apiRequest.phone);
      if (sessionId) {
        const sessionData: OTPSessionData = {
          sessionId: sessionId,
          mobile: apiRequest.mobile || apiRequest.phone || '',
          otpData: (response.data as any).data.otpData,
          isFirst: (response.data as any).data.isFirst || false
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
          'data.data.otpData.Details': (response.data as any)?.data?.otpData?.Details,
          'data.data.otpData exists': !!((response.data as any)?.data?.otpData),
          'data.data exists': !!((response.data as any)?.data),
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

    console.log('Verify Mobile OTP API Response:', response);
    console.log('Full Response Data:', JSON.stringify(response, null, 2));

    // Store token in AsyncStorage if verification is successful
    if (response.success) {
      // Check for token in various possible locations in the response
      let token = null;
      if (response.data?.token) {
        token = response.data.token;
      } else if ((response.data as any)?.data?.token) {
        token = (response.data as any).data.token;
      } else if ((response.data as any)?.data?.data?.token) {
        token = (response.data as any).data.data.token;
      }

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        console.log('🔑 OTP VERIFICATION SUCCESS: Token stored in AsyncStorage');
        console.log('🔑 OTP VERIFICATION: Token preview:', token.substring(0, 20) + '...');
        console.log('🔑 OTP VERIFICATION: Full token:', token);
        console.log('🔑 OTP VERIFICATION: Token length:', token.length);

        // Verify token was stored correctly
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('🔑 OTP VERIFICATION: Token verification result');
        console.log('🔑 OTP VERIFICATION: Stored token exists:', !!storedToken);
        console.log('🔑 OTP VERIFICATION: Stored token matches:', storedToken === token);
        console.log('🔑 OTP VERIFICATION: Stored token value:', storedToken);
      } else {
        console.log('❌ OTP VERIFICATION FAILED: No token found in verification response');
        console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      }
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
    console.log('🔑 PROFILE FETCH: Profile API URL:', buildUrl(endpoint));

    const response = await this.request<any>(endpoint, {
      method: 'GET',
    });

    console.log('🔑 PROFILE FETCH: Profile API response success:', response.success);
    console.log('🔑 PROFILE FETCH: Token verification - Request succeeded:', response.success);
    
    if (response.success) {
      console.log('🔑 PROFILE FETCH: Token is VALID - User profile retrieved successfully');
    } else {
      console.log('🔑 PROFILE FETCH: Token might be INVALID or expired');
      console.log('🔑 PROFILE FETCH: Response error:', response.error);
    }

    console.log('🔑 PROFILE FETCH: Profile API response data:', response.data);

    // Transform the API response to match our User interface
    if (response.success && response.data) {
      const apiData = response.data;
      console.log('🔑 PROFILE FETCH: API data type:', typeof apiData);
      console.log('🔑 PROFILE FETCH: API data keys:', Object.keys(apiData));

      // Handle nested data structure
      const actualData = apiData.data || apiData;

      const transformedUser: User = {
        id: actualData._id || actualData.id,
        name: actualData.name || '',
        email: actualData.email || '',
        phone: actualData.mobile || actualData.phone,
        avatar: actualData.image || actualData.avatar,
        bio: actualData.bio || '',
        address: actualData.address || '',
      };

      console.log('🔑 PROFILE FETCH: Transformed user data:', transformedUser);
      console.log('🔑 PROFILE FETCH: Full API response data:', JSON.stringify(response.data, null, 2));

      return {
        success: true,
        data: transformedUser,
      };
    }

    console.log('🔑 PROFILE FETCH: Profile API failed - returning response as-is');
    return response;
  }

  // Logout
  async logout(): Promise<ApiResponse<{ loggedOut: boolean }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.LOGOUT;

    return this.request<{ loggedOut: boolean }>(endpoint, {
      method: 'POST',
    });
  }

  // Get all categories
  async getCategories(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CATEGORIES_API.GET_ALL;

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get all subcategories
  async getSubCategories(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.SUBCATEGORIES_API.GET_ALL;

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get all products
  async getProducts(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS;

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get all products using the correct endpoint
  async getAllProducts(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS_API.GET_ALL;

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get subcategories by category ID
  async getSubCategoriesByCategory(categoryId: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.SUBCATEGORIES_API.GET_ALL}?categoryId=${categoryId}`;

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get products by subcategory ID
  async getProductsBySubCategory(subCategoryId: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_API.GET_ALL}?subCategoryId=${subCategoryId}`;
    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get products by category ID
  async getProductsByCategory(categoryId: string, limit?: number): Promise<ApiResponse<any>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_API.GET_ALL}?categoryId=${categoryId}`;
    if (limit) {
      endpoint += `&limit=${limit}`;
    }

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get related products (products from same category, excluding current product)
  async getRelatedProducts(productId: string, categoryId: string, limit: number = 5): Promise<ApiResponse<any>> {
    let endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_API.GET_ALL}?categoryId=${categoryId}&exclude=${productId}&limit=${limit}`;

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get product details by ID
  async getProductById(productId: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_API.GET_BY_ID}/${productId}`;

    console.log('=== GET PRODUCT BY ID DEBUG ===');
    console.log('Product ID:', productId);
    console.log('Full URL:', buildUrl(endpoint));

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Get banners
  async getBanners(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.PRODUCTS_Banner.GET_ALL;
console.log(endpoint,"++++++++++++++++++++++++++")
    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Add or update item in cart
  async addOrUpdateToCart(request: {
    productId: string;
    quantity: number;
  }): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CART.ADD_OR_UPDATE;
    const fullUrl = buildUrl(endpoint);

    console.log('🛒 =======================================');
    console.log('🛒 API SERVICE: CART ADD/UPDATE REQUEST');
    console.log('🛒 =======================================');
    console.log('📡 API CALL: addOrUpdateToCart');
    console.log('🔗 Full API URL:', fullUrl);
    console.log('📍 Endpoint:', endpoint);
    console.log('🌐 Base URL:', fullUrl.replace(endpoint, ''));
    console.log('📦 Request Payload:', JSON.stringify(request, null, 2));
    console.log('🆔 Product ID:', request.productId);
    console.log('🔢 Quantity:', request.quantity);
    console.log('⏰ Request Time:', new Date().toISOString());
    console.log('🚀 Making POST request to cart endpoint...');

    const requestStartTime = Date.now();

    try {
      const response = await this.request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...request,
          quantity: request.quantity.toString(), // Convert quantity to string
        }),
      });
      
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.log('📥 =======================================');
      console.log('📥 API SERVICE: CART ADD/UPDATE RESPONSE');
      console.log('📥 =======================================');
      console.log('⏱️ Request Duration:', requestDuration + 'ms');
      console.log('✅ Response Success:', response.success);
      console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
      console.log('📝 Response Message:', response.message);
      console.log('❌ Response Error:', response.error);
      console.log('🕐 Response Time:', new Date().toISOString());
      
      if (response.success) {
        console.log('🎉 =======================================');
        console.log('🎉 CART ADD/UPDATE API CALL SUCCESSFUL!');
        console.log('🎉 Product added/updated successfully');
        console.log('🎉 Server response processed');
        console.log('🎉 =======================================');
      } else {
        console.log('💥 =======================================');
        console.log('💥 CART ADD/UPDATE API CALL FAILED!');
        console.log('💥 Error details:', response.error);
        console.log('💥 Request failed at server level');
        console.log('💥 =======================================');
      }
      
      return response;
    } catch (networkError) {
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.error('🚨 =======================================');
      console.error('🚨 API SERVICE: CART ADD/UPDATE NETWORK ERROR');
      console.error('🚨 =======================================');
      console.error('⏱️ Failed after:', requestDuration + 'ms');
      console.error('🌐 Network error type:', networkError instanceof Error ? networkError.constructor.name : typeof networkError);
      console.error('💬 Error message:', networkError instanceof Error ? networkError.message : 'Unknown network error');
      console.error('🔗 Failed URL:', fullUrl);
      console.error('📦 Request that failed:', JSON.stringify(request, null, 2));
      console.error('🚨 CART ADD/UPDATE FAILED - NETWORK ERROR');
      console.error('🚨 =======================================');
      
      throw networkError;
    }
  }

  // Get cart items
  async getCart(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CART.GET_CART;
    const fullUrl = buildUrl(endpoint);
    
    console.log('🛒 =======================================');
    console.log('🛒 API SERVICE: GET CART REQUEST');
    console.log('🛒 =======================================');
    console.log('📡 API CALL: getCart');
    console.log('🔗 Full API URL:', fullUrl);
    console.log('📍 Endpoint:', endpoint);
    console.log('🌐 Base URL:', fullUrl.replace(endpoint, ''));
    console.log('⏰ Request Time:', new Date().toISOString());
    console.log('🚀 Making GET request to cart endpoint...');

    const requestStartTime = Date.now();
    
    try {
      const response = await this.request<any>(endpoint, {
        method: 'GET',
      });
      
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.log('📥 =======================================');
      console.log('📥 API SERVICE: GET CART RESPONSE');
      console.log('📥 =======================================');
      console.log('⏱️ Request Duration:', requestDuration + 'ms');
      console.log('✅ Response Success:', response.success);
      console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
      console.log('📝 Response Message:', response.message);
      console.log('❌ Response Error:', response.error);
      console.log('🕐 Response Time:', new Date().toISOString());
      
      if (response.success) {
        console.log('🎉 =======================================');
        console.log('🎉 GET CART API CALL SUCCESSFUL!');
        console.log('🎉 Cart data retrieved successfully');
        console.log('🎉 Server response processed');
        console.log('🎉 =======================================');
      } else {
        console.log('💥 =======================================');
        console.log('💥 GET CART API CALL FAILED!');
        console.log('💥 Error details:', response.error);
        console.log('💥 Request failed at server level');
        console.log('💥 =======================================');
      }
      
      return response;
    } catch (networkError) {
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.error('🚨 =======================================');
      console.error('🚨 API SERVICE: GET CART NETWORK ERROR');
      console.error('🚨 =======================================');
      console.error('⏱️ Failed after:', requestDuration + 'ms');
      console.error('🌐 Network error type:', networkError instanceof Error ? networkError.constructor.name : typeof networkError);
      console.error('💬 Error message:', networkError instanceof Error ? networkError.message : 'Unknown network error');
      console.error('🔗 Failed URL:', fullUrl);
      console.error('🚨 GET CART FAILED - NETWORK ERROR');
      console.error('🚨 =======================================');
      
      throw networkError;
    }
  }

  // Remove item from cart
  async removeFromCart(productId: string, action: 'decrease' | 'remove' = 'remove'): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.CART.REMOVE_FROM_CART}/${productId}`;
    const fullUrl = buildUrl(endpoint);

    console.log('🗑️ REMOVE FROM CART API:');
    console.log('🔗 Full URL:', fullUrl);
    console.log('📦 Product ID:', productId);
    console.log('🎯 Action:', action);
    console.log('📨 Request Body:', JSON.stringify({ action }));

    return this.request<any>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CART.CLEAR_CART;

    return this.request<any>(endpoint, {
      method: 'DELETE',
    });
  }

  // Verify delivery for pincode
  async verifyDelivery(pincode: string): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CART.VERIFY_DELIVERY;

    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ zipcode: pincode }),
    });
  }

  // Check delivery availability for a product and location
  async checkDeliveryAvailability(productId: string, zipCode: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_API.CHECK_DELIVERY}/${productId}`;
    const fullUrl = buildUrl(endpoint);
    
    console.log('=== CHECK DELIVERY DEBUG ===');
    console.log('Product ID:', productId);
    console.log('Zip Code:', zipCode);
    console.log('🔗 Full URL:', fullUrl);

    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        zipCode: zipCode
      }),
    });
  }

  // Get all locations
  async getLocations(country?: string): Promise<ApiResponse<any>> {
    let endpoint = API_CONFIG.ENDPOINTS.LOCATIONS.GET_ALL;
    
    // Add country query parameter if provided
    if (country) {
      endpoint += `?country=${encodeURIComponent(country)}`;
    }

    console.log('=== GET LOCATIONS DEBUG ===');
    console.log('Country filter:', country || 'all countries');
    console.log('Full URL:', buildUrl(endpoint));

    return this.request<any>(endpoint, {
      method: 'GET',
    });
  }

  // Create new location
  async createLocation(locationData: {
    coordinates?: [number, number];
    userId?: string;
    name?: string;
    shopOrBuildingNumber?: string;
    address?: string;
    city?: string;
    district?: string;
    zipcode?: string;
    state?: string;
    area?: string;
    country?: string;
  }): Promise<ApiResponse<any>> {
    const endpoint = '/locations/create';

    console.log('=== CREATE LOCATION DEBUG ===');
    console.log('Location data:', locationData);
    console.log('Full URL:', buildUrl(endpoint));

    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // Create order
  async createOrder(request: CreateOrderRequest): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.ORDERS.CREATE;

    console.log('=== CREATE ORDER DEBUG ===');
    console.log('Order request:', request);
    console.log('Full URL:', buildUrl(endpoint));

    return this.request<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export session management methods for use in components
export const storeOTPSession = (sessionData: OTPSessionData) => apiService.storeOTPSession(sessionData);
export const getOTPSession = () => apiService.getOTPSession();
export const clearOTPSession = () => apiService.clearOTPSession();