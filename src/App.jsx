import React, { useState, useRef } from 'react';
import './App.css';

// BULLETPROOF Photo Upload Component
function PhotoUpload() {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    console.log('🚨 PHOTO UPLOAD TRIGGERED!');
    console.log('Event:', event);
    console.log('Files:', event.target.files);
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      alert('No files selected. Please try again.');
      return;
    }

    console.log(`📁 Processing ${files.length} files`);
    setIsUploading(true);

    try {
      const newPhotos = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📷 Processing file ${i + 1}:`, file.name, file.type, file.size);
        
        // Basic validation
        if (!file.type.startsWith('image/')) {
          console.log('❌ Not an image:', file.type);
          alert(`${file.name} is not an image file. Please select JPG, PNG, GIF, or WebP images.`);
          continue;
        }

        // Size check (10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.log('❌ File too large:', file.size);
          alert(`${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        try {
          const imageUrl = URL.createObjectURL(file);
          console.log('✅ Created URL:', imageUrl);
          
          newPhotos.push({
            id: Date.now() + i,
            url: imageUrl,
            file: file,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          });
        } catch (error) {
          console.error('❌ Error creating URL:', error);
          alert(`Failed to process ${file.name}. Please try again.`);
        }
      }

      if (newPhotos.length > 0) {
        console.log('✅ Adding photos to gallery:', newPhotos);
        setPhotos(prev => {
          const updated = [...prev, ...newPhotos];
          console.log('✅ Updated photos:', updated);
          return updated;
        });
        alert(`🎉 SUCCESS! Uploaded ${newPhotos.length} photo(s)!`);
      } else {
        alert('No valid photos were uploaded. Please check your files and try again.');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (photoId) => {
    console.log('🗑️ Removing photo:', photoId);
    const photo = photos.find(p => p.id === photoId);
    if (photo && photo.url) {
      URL.revokeObjectURL(photo.url);
    }
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const triggerFileInput = () => {
    console.log('🎯 Triggering file input click');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('❌ File input ref is null');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '2rem', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem', fontSize: '2rem' }}>
          📸 Upload Your Photos
        </h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Upload your profile photos to get started with LuvLang dating platform.
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="photo-upload-input"
        />

        {/* Upload button */}
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          style={{
            background: isUploading 
              ? 'linear-gradient(135deg, #666, #999)' 
              : 'linear-gradient(135deg, #8B0000, #4B0082)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            borderRadius: '12px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '200px',
            justifyContent: 'center'
          }}
        >
          {isUploading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Uploading...
            </>
          ) : (
            <>📷 Choose Photos</>
          )}
        </button>

        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          • Supports JPG, PNG, GIF, WebP formats<br/>
          • Maximum file size: 10MB per photo<br/>
          • You can select multiple photos at once
        </div>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '2rem', 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Your Photos ({photos.length})</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <img 
                  src={photo.url} 
                  alt={photo.fileName}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: 'white', fontSize: '0.8rem' }}>
                    {(photo.fileSize / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    style={{
                      background: 'rgba(220, 53, 69, 0.8)',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {photos.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📷</div>
          <h3>No Photos Yet</h3>
          <p>Click "Choose Photos" above to upload your first photos!</p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8B0000 0%, #4B0082 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8B0000, #4B0082)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          LuvLang Professional Dating
        </h1>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <PhotoUpload />
      </main>
    </div>
  );
}

export default App;