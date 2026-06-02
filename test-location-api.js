// Test script to verify the location API integration
const testLocationAPI = async () => {
  console.log('🧪 Testing Location API Integration...');
  
  try {
    // Test the API endpoint directly
    const response = await fetch('https://api.nvsricemart.com/nvs-rice-mart/locations/getAll?country=india', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 API Response Structure:');
    console.log('- Success:', data.success);
    console.log('- Message:', data.message);
    console.log('- Total locations:', data.data?.total || 0);
    console.log('- Total pages:', data.data?.totalPages || 0);
    console.log('- Locations count:', data.data?.data?.length || 0);
    
    if (data.data?.data && data.data.data.length > 0) {
      console.log('\n📍 Sample Location Data:');
      const sampleLocation = data.data.data[0];
      console.log('- ID:', sampleLocation._id);
      console.log('- Name:', sampleLocation.name || 'No name');
      console.log('- Address:', sampleLocation.address || 'No address');
      console.log('- City:', sampleLocation.city);
      console.log('- State:', sampleLocation.state);
      console.log('- Country:', sampleLocation.country);
      console.log('- ZIP:', sampleLocation.zipcode);
      console.log('- Coordinates:', sampleLocation.coordinates);
      console.log('- Formatted Address:', sampleLocation.formattedAddress);
    }
    
    console.log('\n✅ Location API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Location API test failed:', error);
  }
};

// Run the test
testLocationAPI();