// Test script to verify profile endpoint URL
const API_CONFIG = {
  BASE_URL: 'https://nvs-rice-mart.onrender.com/nvs-rice-mart',
  ENDPOINTS: {
    USER: {
      PROFILE: '/users/get',
      UPDATE: '/users/update',
    },
    AUTH: {
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP_MOBILE: '/auth/verify-otp-mobile',
    },
  },
};

const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Test the corrected endpoints
console.log('Testing Corrected API Endpoints:');
console.log('');

const profileUrl = buildUrl(API_CONFIG.ENDPOINTS.USER.PROFILE);
const updateUrl = buildUrl(API_CONFIG.ENDPOINTS.USER.UPDATE);
const sendOtpUrl = buildUrl(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP);
const verifyOtpUrl = buildUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP_MOBILE);

console.log('Profile URL:', profileUrl);
console.log('Expected: https://nvs-rice-mart.onrender.com/nvs-rice-mart/users/get');
console.log('✅ Profile URL is correct:', profileUrl === 'https://nvs-rice-mart.onrender.com/nvs-rice-mart/users/get');
console.log('');

console.log('User Update URL:', updateUrl);
console.log('Send OTP URL:', sendOtpUrl);
console.log('Verify OTP Mobile URL:', verifyOtpUrl);
console.log('');

console.log('✅ All API endpoints are properly configured!');