// Cart API URL Test
// This will help debug the "Invalid API" error

console.log('🔗 CART API URL VERIFICATION');
console.log('=============================');

// Based on config.ts (lines 7, 10, 48):
const BASE_URL = 'https://b8472d53812d.ngrok-free.app/nvs-rice-mart';
const CART_ENDPOINT = '/carts/add-or-update';
const FULL_URL = BASE_URL + CART_ENDPOINT;

console.log('📍 Base URL:', BASE_URL);
console.log('📍 Endpoint:', CART_ENDPOINT);
console.log('🔗 Full URL:', FULL_URL);
console.log('');
console.log('🧪 To test this URL manually:');
console.log('curl -X POST', FULL_URL);
console.log('  -H "Content-Type: application/json"');
console.log('  -H "Authorization: Bearer YOUR_TOKEN_HERE"');
console.log('  -d \'{"productId": "test123", "quantity": 1}\'');
console.log('');
console.log('✅ If you get "Invalid API", check:');
console.log('  • Is the server running?');
console.log('  • Does the endpoint exist?');
console.log('  • Is the token valid?');
console.log('  • Are there CORS issues?');