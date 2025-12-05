#!/usr/bin/env node

/**
 * Google Maps Integration Test Script
 * Run this script to verify your Google Maps setup is correct
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️  Google Maps Integration Test\n');

// Test 1: Check if Google Maps dependencies are installed
console.log('✅ Test 1: Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['react-native-maps'];
  
  const hasDependencies = requiredDeps.every(dep => 
    packageJson.dependencies && packageJson.dependencies[dep]
  );
  
  if (hasDependencies) {
    console.log('  ✓ Required dependencies found in package.json');
  } else {
    console.log('  ❌ Missing required dependencies. Run: npm install react-native-maps');
  }
} catch (error) {
  console.log('  ❌ Could not read package.json');
}

// Test 2: Check if configuration files exist
console.log('\n✅ Test 2: Checking configuration files...');

const configFiles = [
  'src/constants/googleMapsConfig.ts',
  'src/components/GoogleMapComponent.tsx',
  'src/screens/LocationFillPage.tsx'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} missing`);
  }
});

// Test 3: Check Android configuration
console.log('\n✅ Test 3: Checking Android configuration...');
try {
  const androidManifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
  if (androidManifest.includes('com.google.android.geo.API_KEY')) {
    console.log('  ✓ Google Maps API key meta-data found in AndroidManifest.xml');
  } else {
    console.log('  ❌ Google Maps API key meta-data missing from AndroidManifest.xml');
  }
} catch (error) {
  console.log('  ❌ Could not read AndroidManifest.xml');
}

// Test 4: Check iOS configuration
console.log('\n✅ Test 4: Checking iOS configuration...');
try {
  const appDelegate = fs.readFileSync('ios/nvsricemall/AppDelegate.swift', 'utf8');
  if (appDelegate.includes('import GoogleMaps') && appDelegate.includes('GMSServices.provideAPIKey')) {
    console.log('  ✓ Google Maps import and API key setup found in AppDelegate.swift');
  } else {
    console.log('  ❌ Google Maps setup missing from AppDelegate.swift');
  }
} catch (error) {
  console.log('  ❌ Could not read AppDelegate.swift');
}

// Test 5: Check if API key is configured
console.log('\n✅ Test 5: Checking API key configuration...');
try {
  const configContent = fs.readFileSync('src/constants/googleMapsConfig.ts', 'utf8');
  if (configContent.includes('YOUR_GOOGLE_MAPS_API_KEY_HERE')) {
    console.log('  ⚠️  Using placeholder API key. Please update with your actual Google Maps API key');
  } else if (configContent.includes('API_KEY:') && !configContent.includes('YOUR_GOOGLE_MAPS_API_KEY_HERE')) {
    console.log('  ✓ API key appears to be configured');
  } else {
    console.log('  ❌ Could not determine API key status');
  }
} catch (error) {
  console.log('  ❌ Could not read googleMapsConfig.ts');
}

// Test 6: Check if LocationFillPage uses GoogleMapComponent
console.log('\n✅ Test 6: Checking integration...');
try {
  const locationPage = fs.readFileSync('src/screens/LocationFillPage.tsx', 'utf8');
  if (locationPage.includes('GoogleMapComponent')) {
    console.log('  ✓ GoogleMapComponent is integrated in LocationFillPage.tsx');
  } else {
    console.log('  ❌ GoogleMapComponent not found in LocationFillPage.tsx');
  }
} catch (error) {
  console.log('  ❌ Could not read LocationFillPage.tsx');
}

// Final instructions
console.log('\n📋 NEXT STEPS:');
console.log('\n1. Get your Google Maps API key from: https://console.cloud.google.com/apis/credentials');
console.log('2. Update the API key in:');
console.log('   - src/constants/googleMapsConfig.ts');
console.log('   - android/app/src/main/AndroidManifest.xml');
console.log('   - ios/nvsricemall/AppDelegate.swift');
console.log('\n3. Install dependencies: npm install');
console.log('4. For iOS, run: cd ios && pod install && cd ..');
console.log('\n5. Test the app:');
console.log('   - Android: npm run android');
console.log('   - iOS: npm run ios');
console.log('\n6. Navigate to the location screen to see Google Maps in action! 🗺️');

console.log('\n📚 For detailed setup instructions, see: GOOGLE_MAPS_SETUP.md');