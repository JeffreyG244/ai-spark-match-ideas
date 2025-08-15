import React, { useState, useRef } from 'react';
import './App.css';

// Professional Gallery Component
function ProfessionalGallery() {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    console.log('Professional Gallery - File select triggered', event);
    console.log('Event target:', event.target);
    console.log('Files available:', event.target.files);
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected or files is null');
      alert('No files selected. Please try selecting files again.');
      return;
    }

    console.log(`Processing ${files.length} files`);
    setIsUploading(true);

    try {
      const newPhotos = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}:`, file.name, file.type, file.size);
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          console.error(`Invalid file type: ${file.type}`);
          alert(`${file.name} is not a valid image file. Please select JPG, PNG, GIF, or WebP images.`);
          continue;
        }

        // Check file size (10MB limit for professional photos)
        if (file.size > 10 * 1024 * 1024) {
          console.error(`File too large: ${file.size} bytes`);
          alert(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB for professional photos.`);
          continue;
        }

        try {
          const imageUrl = URL.createObjectURL(file);
          console.log('Created object URL:', imageUrl);
          
          newPhotos.push({
            id: Date.now() + i,
            url: imageUrl,
            file: file,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            isPrimary: photos.length === 0 && newPhotos.length === 0,
            isVerified: false,
            category: 'professional'
          });
        } catch (urlError) {
          console.error('Error creating object URL:', urlError);
          alert(`Failed to process ${file.name}. Please try again.`);
        }
      }

      if (newPhotos.length > 0) {
        console.log('Adding photos to Professional Gallery:', newPhotos);
        setPhotos(prev => {
          const updated = [...prev, ...newPhotos];
          console.log('Updated Professional Gallery photos:', updated);
          return updated;
        });
        alert(`✅ Successfully uploaded ${newPhotos.length} professional photo(s) to your gallery!`);
      } else {
        alert('No valid photos were uploaded. Please check your file types and sizes.');
      }
    } catch (error) {
      console.error('Professional Gallery upload error:', error);
      alert(`Upload failed: ${error.message}. Please try again.`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo && photo.url) {
      URL.revokeObjectURL(photo.url);
    }
    
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isPrimary)) {
      updatedPhotos[0].isPrimary = true;
    }
    
    setPhotos(updatedPhotos);
  };

  const setPrimaryPhoto = (photoId) => {
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    })));
  };

  const verifyPhoto = (photoId) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, isVerified: true } : photo
    ));
    alert('Photo marked as verified professional photo!');
  };

  return (
    <div className="section">
      <h2>🏢 Professional Gallery</h2>
      <p>Upload your professional photos for career-focused matches. High-quality photos work best.</p>
      
      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="professional-photo-upload"
          capture="environment"
        />
        
        <label htmlFor="professional-photo-upload" className="btn primary large">
          {isUploading ? (
            <>
              <div className="spinner"></div>
              Uploading Professional Photos...
            </>
          ) : (
            <>📸 Upload Professional Photos</>
          )}
        </label>
        
        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
          • Supports JPG, PNG, GIF, WebP formats<br/>
          • Maximum file size: 10MB per photo<br/>
          • Professional attire and settings recommended<br/>
          • High resolution photos preferred
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '4rem', opacity: 0.5 }}>🏢</span>
          <h3>No Professional Photos Yet</h3>
          <p>Upload your first professional photo to get started with career-focused matching.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img src={photo.url} alt={`Professional photo ${photo.fileName}`} />
              <div className="photo-controls">
                {photo.isPrimary && <span className="primary-badge">PRIMARY</span>}
                {photo.isVerified && <span className="primary-badge" style={{background: '#28a745'}}>VERIFIED</span>}
                
                <button onClick={() => setPrimaryPhoto(photo.id)} disabled={photo.isPrimary}>
                  {photo.isPrimary ? '✓ Primary' : 'Set Primary'}
                </button>
                
                <button onClick={() => verifyPhoto(photo.id)} disabled={photo.isVerified}>
                  {photo.isVerified ? '✓ Verified' : 'Verify Pro'}
                </button>
                
                <button onClick={() => removePhoto(photo.id)} style={{background: 'rgba(220, 53, 69, 0.8)'}}>
                  Remove
                </button>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                background: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem' 
              }}>
                {(photo.fileSize / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="professional-tips" style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, #8B000010, #4B008210)', 
        borderRadius: '12px' 
      }}>
        <h4>💼 Professional Photo Tips</h4>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li>Wear professional attire appropriate to your industry</li>
          <li>Use good lighting and a clean, uncluttered background</li>
          <li>Smile naturally and maintain good posture</li>
          <li>Include photos from professional events or workplace settings</li>
          <li>Ensure photos are recent (within 6 months)</li>
        </ul>
      </div>
    </div>
  );
}

// Voice Recording Component for Dashboard
function VoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [analysisResults, setAnalysisResults] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      console.log('Requesting microphone permissions...');
      setRecordingStatus('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone access granted, starting recording...');
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorderRef.current.mimeType 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Simulate voice analysis
        setTimeout(() => {
          setAnalysisResults({
            tone: 'Professional and confident',
            pace: 'Well-paced',
            clarity: 'Excellent',
            compatibility: [
              { name: 'Sarah M.', score: '92%', reason: 'Similar communication style' },
              { name: 'Jessica L.', score: '89%', reason: 'Complementary vocal patterns' },
              { name: 'Amanda R.', score: '85%', reason: 'Matching energy levels' }
            ]
          });
        }, 2000);
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingStatus('recording');
      
    } catch (error) {
      console.error('Microphone access error:', error);
      setRecordingStatus('error');
      
      if (error.name === 'NotAllowedError') {
        alert('🎤 Microphone access denied. Please allow microphone permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('🎤 No microphone found. Please connect a microphone and try again.');
      } else {
        alert(`🎤 Microphone error: ${error.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingStatus('processing');
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAnalysisResults(null);
    setRecordingStatus('inactive');
    audioChunksRef.current = [];
  };

  return (
    <div className="section">
      <h2>🎤 Voice Compatibility</h2>
      <p>Record a short voice message to find matches with compatible communication styles.</p>
      
      <div className="recording-area">
        {recordingStatus === 'inactive' && (
          <div className="recording-ready">
            <span className="mic-icon">🎤</span>
            <h3>Ready to Record</h3>
            <p>Click below to start recording your voice sample</p>
            <button className="btn primary large" onClick={startRecording}>
              Start Voice Recording
            </button>
          </div>
        )}
        
        {recordingStatus === 'requesting' && (
          <div className="recording-ready">
            <span className="mic-icon">🔍</span>
            <h3>Requesting Microphone Access</h3>
            <p>Please allow microphone permissions when prompted</p>
          </div>
        )}
        
        {recordingStatus === 'recording' && (
          <div className="recording-active">
            <span className="pulse-animation">🔴</span>
            <h3>Recording in Progress...</h3>
            <p>Speak naturally for 10-30 seconds</p>
            <button className="btn secondary" onClick={stopRecording}>
              Stop Recording
            </button>
          </div>
        )}
        
        {recordingStatus === 'processing' && (
          <div className="recording-ready">
            <span className="mic-icon">⚡</span>
            <h3>Processing Audio...</h3>
            <p>Analyzing your voice patterns for compatibility matching</p>
          </div>
        )}
        
        {recordingStatus === 'error' && (
          <div className="recording-ready">
            <span className="mic-icon">❌</span>
            <h3>Recording Error</h3>
            <p>Unable to access microphone. Please check permissions and try again.</p>
            <button className="btn primary" onClick={() => setRecordingStatus('inactive')}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="audio-playback">
          <h4>🎵 Your Voice Recording</h4>
          <audio controls src={audioUrl} style={{ width: '100%', marginTop: '1rem' }}>
            Your browser does not support audio playback.
          </audio>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn primary" onClick={startRecording}>
              Record New Sample
            </button>
            <button className="btn secondary" onClick={clearRecording}>
              Clear Recording
            </button>
          </div>
        </div>
      )}

      {analysisResults && (
        <div className="analysis-results">
          <h4>🎯 Voice Analysis Results</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div><strong>Tone:</strong> {analysisResults.tone}</div>
            <div><strong>Pace:</strong> {analysisResults.pace}</div>
            <div><strong>Clarity:</strong> {analysisResults.clarity}</div>
          </div>
          
          <div className="voice-matches">
            <h5>💕 Top Voice Compatibility Matches:</h5>
            {analysisResults.compatibility.map((match, index) => (
              <div key={index} className="match-item">
                <strong>{match.name}</strong>
                <span className="compatibility">{match.score}</span>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                  {match.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <div className="App">
      <header className="app-header">
        <h1>LuvLang Professional</h1>
        <nav>
          <button 
            className={activeTab === 'gallery' ? 'active' : ''} 
            onClick={() => setActiveTab('gallery')}
          >
            Professional Gallery
          </button>
          <button 
            className={activeTab === 'voice' ? 'active' : ''} 
            onClick={() => setActiveTab('voice')}
          >
            Voice Compatibility
          </button>
          <button 
            className={activeTab === 'matches' ? 'active' : ''} 
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
          <button 
            className={activeTab === 'messages' ? 'active' : ''} 
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'gallery' && <ProfessionalGallery />}
        {activeTab === 'voice' && <VoiceRecording />}
        {activeTab === 'matches' && (
          <div className="section">
            <h2>💕 Your Matches</h2>
            <p>Professional matches will appear here based on your gallery and voice compatibility.</p>
            <div className="empty-state">
              <span style={{ fontSize: '4rem', opacity: 0.5 }}>💼</span>
              <h3>No Matches Yet</h3>
              <p>Complete your Professional Gallery and Voice Recording to start getting matches!</p>
            </div>
          </div>
        )}
        {activeTab === 'messages' && (
          <div className="section">
            <h2>💬 Messages</h2>
            <p>Your conversations with professional matches will appear here.</p>
            <div className="empty-state">
              <span style={{ fontSize: '4rem', opacity: 0.5 }}>📱</span>
              <h3>No Messages Yet</h3>
              <p>Start conversations with your matches to see messages here!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;