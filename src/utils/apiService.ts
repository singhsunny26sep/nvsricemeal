import { API_CONFIG, buildUrl } from '../constants/config';

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
}

class ApiService {
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

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

    return this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // New login method with enhanced structure
  async login(request: NewLoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.LOGIN;

    return this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Register new user
  async register(request: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.REGISTER;

    return this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Send OTP to email or phone
  async sendOTP(request: LoginRequest): Promise<ApiResponse<{ otpSent: boolean }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.SEND_OTP;

    return this.request<{ otpSent: boolean }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Verify OTP and login
  async verifyOTP(request: OTPRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP;

    return this.request<{ user: User; token: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get user profile
  async getUserProfile(token: string): Promise<ApiResponse<User>> {
    const endpoint = API_CONFIG.ENDPOINTS.USER.PROFILE;

    return this.request<User>(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Logout
  async logout(token: string): Promise<ApiResponse<{ loggedOut: boolean }>> {
    const endpoint = API_CONFIG.ENDPOINTS.AUTH + '/logout';

    return this.request<{ loggedOut: boolean }>(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;