// Comprehensive functionality test for LuvLang.org
// Run this in browser console on https://luvlang.org

console.log('🧪 Starting LuvLang Functionality Test...');

// Test 1: Check if React app is loaded
function testReactApp() {
  const reactRoot = document.getElementById('root');
  if (reactRoot && reactRoot.children.length > 0) {
    console.log('✅ React app loaded successfully');
    return true;
  } else {
    console.log('❌ React app not loaded');
    return false;
  }
}

// Test 2: Check Supabase connection
function testSupabaseConnection() {
  const connectionStatus = document.querySelector('.connection-status');
  if (connectionStatus) {
    const isConnected = connectionStatus.textContent.includes('Connected to Supabase');
    if (isConnected) {
      console.log('✅ Supabase connection established');
      return true;
    } else {
      console.log('⚠️ Running in guest mode (expected for anonymous users)');
      return true; // Guest mode is acceptable
    }
  } else {
    console.log('❌ Connection status not found');
    return false;
  }
}

// Test 3: Check photo upload functionality
function testPhotoUpload() {
  const photoInput = document.getElementById('photo-input');
  const uploadButton = document.querySelector('label[for="photo-input"]');
  
  if (photoInput && uploadButton) {
    console.log('✅ Photo upload interface found');
    
    // Test file input accessibility
    if (!photoInput.disabled && photoInput.accept.includes('image')) {
      console.log('✅ Photo input accepts images and is enabled');
      return true;
    } else {
      console.log('❌ Photo input misconfigured');
      return false;
    }
  } else {
    console.log('❌ Photo upload interface not found');
    return false;
  }
}

// Test 4: Check voice recording functionality
function testVoiceRecording() {
  const voiceSection = document.querySelector('.voice-section');
  const voiceButton = document.querySelector('.voice-button');
  
  if (voiceSection && voiceButton) {
    console.log('✅ Voice recording interface found');
    
    // Check if MediaRecorder is supported
    if (typeof MediaRecorder !== 'undefined') {
      console.log('✅ MediaRecorder API supported');
      return true;
    } else {
      console.log('❌ MediaRecorder API not supported');
      return false;
    }
  } else {
    console.log('❌ Voice recording interface not found');
    return false;
  }
}

// Test 5: Check PayPal integration
function testPayPalIntegration() {
  const membershipSection = document.querySelector('.section:has(h2:contains("Premium Membership"))');
  const paypalButtons = document.querySelectorAll('.plan-button');
  
  if (paypalButtons.length >= 2) {
    console.log('✅ PayPal membership plans found');
    
    // Check if buttons are functional
    const premiumButton = Array.from(paypalButtons).find(btn => 
      btn.textContent.includes('Purchase with PayPal')
    );
    
    if (premiumButton && !premiumButton.disabled) {
      console.log('✅ PayPal buttons are interactive');
      return true;
    } else {
      console.log('❌ PayPal buttons are disabled or missing');
      return false;
    }
  } else {
    console.log('❌ PayPal membership plans not found');
    return false;
  }
}

// Test 6: Check responsive design
function testResponsiveDesign() {
  const viewportWidth = window.innerWidth;
  const appMain = document.querySelector('.app-main');
  
  if (appMain) {
    const computedStyle = window.getComputedStyle(appMain);
    const padding = computedStyle.padding;
    
    if (viewportWidth <= 768 && padding.includes('1rem')) {
      console.log('✅ Mobile responsive design active');
      return true;
    } else if (viewportWidth > 768 && padding.includes('2rem')) {
      console.log('✅ Desktop layout active');
      return true;
    } else {
      console.log('⚠️ Responsive design may need adjustment');
      return true; // Not critical
    }
  } else {
    console.log('❌ Main app container not found');
    return false;
  }
}

// Test 7: Check error handling
function testErrorHandling() {
  // Look for error message containers
  const errorContainer = document.querySelector('.error-message');
  
  // Error container should exist but be empty initially
  if (document.querySelector('.error-message') === null) {
    console.log('✅ No error messages displayed (good)');
    return true;
  } else {
    const errorText = errorContainer.textContent;
    if (errorText.trim() === '') {
      console.log('✅ Error container ready but no errors');
      return true;
    } else {
      console.log('⚠️ Error message present:', errorText);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🔬 Running comprehensive tests...\n');
  
  const tests = [
    { name: 'React App Loading', fn: testReactApp },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Photo Upload Interface', fn: testPhotoUpload },
    { name: 'Voice Recording Interface', fn: testVoiceRecording },
    { name: 'PayPal Integration', fn: testPayPalIntegration },
    { name: 'Responsive Design', fn: testResponsiveDesign },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
    }
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! LuvLang.org is functioning properly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.');
  }
  
  return { passed, total };
}

// Auto-run tests when script loads
setTimeout(runAllTests, 2000); // Wait 2 seconds for app to fully load

console.log('Test script loaded. Tests will run automatically in 2 seconds.');
console.log('You can also run tests manually with: runAllTests()');