// Test to debug token issues
const testTokenDebug = async () => {
  console.log('🔍 Token Debug Test Starting...');
  
  try {
    // Import AsyncStorage for testing
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    // Check if token exists
    const token = await AsyncStorage.getItem('userToken');
    
    console.log('📱 Token Status:');
    console.log('- Token exists:', !!token);
    console.log('- Token length:', token ? token.length : 0);
    if (token) {
      console.log('- Token preview:', token.substring(0, 20) + '...');
      console.log('- Full token:', token);
    }
    
    // Try to test the API without token first
    console.log('\n🧪 Testing API without token...');
    const response = await fetch('https://api.nvsricemart.com/nvs-rice-mart/locations/getAll?country=india', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('- API Response without token:');
    console.log('  Status:', response.status);
    console.log('  Success:', data.success);
    console.log('  Message:', data.message);
    
    if (!data.success) {
      console.log('\n💡 This endpoint requires authentication!');
      console.log('💡 User needs to login first to get a token');
      
      // Check if we can access a public endpoint
      console.log('\n🧪 Testing if there are any public endpoints...');
      try {
        const publicResponse = await fetch('https://api.nvsricemart.com/', {
          method: 'GET',
        });
        console.log('- Public endpoint status:', publicResponse.status);
      } catch (error) {
        console.log('- Public endpoint failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Token debug test failed:', error);
  }
};

testTokenDebug();