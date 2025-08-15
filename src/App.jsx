import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import './App.css';

// Simple Photo Upload Component for Main Page
function SimplePhotoUpload() {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    console.log('🔥 MAIN PAGE - File select triggered');
    console.log('Event:', event);
    console.log('Files:', event.target.files);
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      return;
    }

    console.log(`📁 Processing ${files.length} files`);
    setIsUploading(true);

    const newPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📷 File ${i + 1}:`, file.name, file.type);
      
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const imageUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: Date.now() + i,
        url: imageUrl,
        file: file,
        fileName: file.name
      });
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos]);
      alert(`✅ Uploaded ${newPhotos.length} photo(s) successfully!`);
    }
    
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="section">
      <h2>📸 Upload Profile Photos</h2>
      <p>Upload your photos to get started with professional dating matches.</p>
      
      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="main-photo-upload"
        />
        
        <label htmlFor="main-photo-upload" className="btn primary large">
          {isUploading ? 'Uploading...' : '📷 Choose Photos to Upload'}
        </label>
      </div>

      {photos.length > 0 && (
        <div className="photo-grid" style={{ marginTop: '2rem' }}>
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img src={photo.url} alt={photo.fileName} />
              <div className="photo-controls">
                <button onClick={() => {
                  URL.revokeObjectURL(photo.url);
                  setPhotos(prev => prev.filter(p => p.id !== photo.id));
                }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Home component for the main landing page
function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="dashboard">
      <h2>Welcome to LuvLang Professional</h2>
      <p>Professional Dating Platform with AI-Powered Matching</p>
      
      {/* Direct Photo Upload on Main Page */}
      <SimplePhotoUpload />
      
      <div className="feature-grid">
        <div className="feature-card" onClick={() => navigate('/dashboard')}>
          <div className="feature-icon">🏢</div>
          <h3>Professional Gallery</h3>
          <p>Advanced photo management and verification</p>
          <button className="btn primary">Open Dashboard</button>
        </div>

        <div className="feature-card" onClick={() => navigate('/dashboard')}>
          <div className="feature-icon">🎤</div>
          <h3>Voice Compatibility</h3>
          <p>Record voice samples for AI-powered matching</p>
          <button className="btn">Record Voice</button>
        </div>

        <div className="feature-card" onClick={() => navigate('/dashboard')}>
          <div className="feature-icon">💕</div>
          <h3>Smart Matching</h3>
          <p>AI analyzes your profile for perfect matches</p>
          <button className="btn">View Matches</button>
        </div>

        <div className="feature-card" onClick={() => navigate('/dashboard')}>
          <div className="feature-icon">💬</div>
          <h3>Secure Messaging</h3>
          <p>Chat safely with verified professional matches</p>
          <button className="btn">Open Messages</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>LuvLang Professional</h1>
          </Link>
          <nav>
            <Link to="/">
              <button>Home</button>
            </Link>
            <Link to="/dashboard">
              <button>Professional Dashboard</button>
            </Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;