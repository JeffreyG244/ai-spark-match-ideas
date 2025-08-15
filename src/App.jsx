import React, { useState } from 'react';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    setUploading(true);
    
    try {
      const newPhotos = files.map((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          return null;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          return null;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        
        return {
          id: Date.now() + index,
          file: file,
          url: url,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(1) + 'MB'
        };
      }).filter(Boolean);

      if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos]);
        alert(`Successfully uploaded ${newPhotos.length} photo(s)!`);
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove?.url) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>LuvLang Professional Dating</h1>
      </header>

      <main className="app-main">
        <div className="section">
          <h2>📸 Upload Your Profile Photos</h2>
          <p>Upload your photos to get started with professional dating matches.</p>
          
          <div className="upload-section">
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            
            <label 
              htmlFor="photo-input" 
              className={`upload-button ${uploading ? 'uploading' : ''}`}
            >
              {uploading ? 'Uploading...' : '📷 Choose Photos'}
            </label>
            
            <div className="upload-info">
              • Supports JPG, PNG, GIF, WebP<br/>
              • Maximum 5MB per photo<br/>
              • Select multiple photos at once
            </div>
          </div>

          {photos.length > 0 && (
            <div className="photos-section">
              <h3>Your Photos ({photos.length})</h3>
              <div className="photos-grid">
                {photos.map(photo => (
                  <div key={photo.id} className="photo-item">
                    <img src={photo.url} alt={photo.name} />
                    <div className="photo-overlay">
                      <span className="photo-size">{photo.size}</span>
                      <button 
                        onClick={() => removePhoto(photo.id)}
                        className="remove-button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {photos.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📷</div>
              <h3>No photos uploaded yet</h3>
              <p>Click "Choose Photos" to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;