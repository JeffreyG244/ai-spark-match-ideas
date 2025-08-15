import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive'); // inactive, requesting, recording, stopped
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  // Voice recording functions
  const startRecording = async () => {
    try {
      console.log('🎤 Requesting microphone access...');
      setRecordingStatus('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Microphone access granted');
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📊 Audio data chunk received:', event.data.size);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('🛑 Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to free up microphone
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('🔇 Stopped audio track');
        });
        
        setRecordingStatus('stopped');
        alert('✅ Voice recording completed successfully!');
      };
      
      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingStatus('recording');
      console.log('🔴 Recording started...');
      
    } catch (error) {
      console.error('❌ Microphone error:', error);
      setRecordingStatus('inactive');
      
      if (error.name === 'NotAllowedError') {
        alert('🎤 Microphone access denied. Please allow microphone permissions in your browser settings and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('🎤 No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotSupportedError') {
        alert('🎤 Voice recording is not supported in your browser. Please try a different browser.');
      } else {
        alert(`🎤 Recording error: ${error.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('⏹️ Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    console.log('🗑️ Clearing recording...');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingStatus('inactive');
    audioChunksRef.current = [];
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

        {/* Voice Recording Section */}
        <div className="section">
          <h2>🎤 Voice Recording</h2>
          <p>Record a voice message to enhance your profile with voice compatibility matching.</p>
          
          <div className="voice-section">
            {recordingStatus === 'inactive' && (
              <div className="voice-controls">
                <div className="voice-icon">🎤</div>
                <h3>Ready to Record</h3>
                <p>Click below to start recording your voice message</p>
                <button 
                  onClick={startRecording}
                  className="voice-button"
                >
                  🔴 Start Recording
                </button>
              </div>
            )}

            {recordingStatus === 'requesting' && (
              <div className="voice-controls">
                <div className="voice-icon requesting">🔍</div>
                <h3>Requesting Microphone Access</h3>
                <p>Please allow microphone permissions when prompted by your browser</p>
              </div>
            )}

            {recordingStatus === 'recording' && (
              <div className="voice-controls">
                <div className="voice-icon recording">🔴</div>
                <h3>Recording in Progress...</h3>
                <p>Speak clearly into your microphone. Click stop when finished.</p>
                <button 
                  onClick={stopRecording}
                  className="voice-button stop"
                >
                  ⏹️ Stop Recording
                </button>
              </div>
            )}

            {recordingStatus === 'stopped' && audioUrl && (
              <div className="voice-controls">
                <div className="voice-icon">✅</div>
                <h3>Recording Complete!</h3>
                <p>Your voice message has been recorded successfully.</p>
                
                <div className="audio-playback">
                  <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '1rem' }}>
                    Your browser does not support audio playback.
                  </audio>
                  
                  <div className="audio-controls">
                    <button 
                      onClick={startRecording}
                      className="voice-button"
                    >
                      🎤 Record New
                    </button>
                    <button 
                      onClick={clearRecording}
                      className="voice-button secondary"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="voice-info">
              • Speak for 10-60 seconds for best results<br/>
              • Ensure you're in a quiet environment<br/>
              • Voice recordings help with compatibility matching<br/>
              • Your browser may ask for microphone permissions
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;