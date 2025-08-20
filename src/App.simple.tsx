import React from 'react';

function App() {
  console.log('🔥 APP COMPONENT RENDERED!');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>✅ REACT APP IS WORKING!</h1>
      <p>This is a simple test to confirm React is loading</p>
      
      <div style={{ 
        background: 'lightblue', 
        padding: '20px', 
        margin: '20px 0',
        borderRadius: '8px'
      }}>
        <h2>🔥 PHOTO UPLOAD TEST</h2>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => {
            console.log('FILE SELECTED:', e.target.files?.[0]);
            alert('File selected: ' + e.target.files?.[0]?.name);
          }}
        />
        <p>^ This is a basic file input to test if browsers can select files</p>
      </div>
      
      <div style={{ background: 'lightcoral', padding: '10px', borderRadius: '8px' }}>
        <strong>If you can see this, React is working! The issue was elsewhere.</strong>
      </div>
    </div>
  );
}

export default App;