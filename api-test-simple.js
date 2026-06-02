// Simple API test to check token requirements
const testAPI = async () => {
  console.log('🧪 Testing Location API...');
  
  try {
    // Test without token
    console.log('\n1️⃣ Testing API without token:');
    const response1 = await fetch('https://api.nvsricemart.com/nvs-rice-mart/locations/getAll?country=india', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data1 = await response1.json();
    console.log('- Status:', response1.status);
    console.log('- Success:', data1.success);
    console.log('- Message:', data1.message);
    
    // Test with fake token
    console.log('\n2️⃣ Testing API with fake token:');
    const response2 = await fetch('https://api.nvsricemart.com/nvs-rice-mart/locations/getAll?country=india', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_token_123'
      }
    });
    
    const data2 = await response2.json();
    console.log('- Status:', response2.status);
    console.log('- Success:', data2.success);
    console.log('- Message:', data2.message);
    
    // Test base URL
    console.log('\n3️⃣ Testing base URL:');
    const response3 = await fetch('https://api.nvsricemart.com/', {
      method: 'GET',
    });
    
    console.log('- Base URL Status:', response3.status);
    
    console.log('\n📊 Summary:');
    if (!data1.success && data1.message.includes('authorization')) {
      console.log('✅ CONFIRMED: API requires authentication token');
      console.log('💡 Solution: User needs to login first to get valid token');
    } else if (data1.success) {
      console.log('✅ API works without authentication');
    } else {
      console.log('❓ API response unclear');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

testAPI();