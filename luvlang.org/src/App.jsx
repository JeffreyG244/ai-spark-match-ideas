import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase.js';
import './App.css';

// LuvLang Logo Component with Your Actual Logo
function LuvLangLogo() {
  return (
    <div className="luvlang-logo">
      <img 
        src="/luvlang-logo.png"
        alt="LuvLang Logo - Purple Pink Heart with LuvLang text"
        className="luvlang-logo-image"
      />
    </div>
  );
}

// Enhanced Photo Upload Component with Supabase
function PhotoUpload() {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize user session
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Try to get existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ User session found:', session.user.id);
        setUser(session.user);
        setIsSignedIn(true);
        loadUserPhotos(session.user.id);
      } else {
        console.log('👤 No session, signing in anonymously...');
        await signInAnonymously();
      }
    } catch (error) {
      console.error('❌ Session initialization error:', error);
      await signInAnonymously();
    }
  };

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('❌ Anonymous sign-in error:', error);
        const guestUser = { id: 'guest-' + Date.now() };
        setUser(guestUser);
        setIsSignedIn(false);
        return;
      }

      console.log('✅ Anonymous sign-in successful:', data.user.id);
      setUser(data.user);
      setIsSignedIn(true);
      loadUserPhotos(data.user.id);
    } catch (error) {
      console.error('❌ Anonymous sign-in failed:', error);
      const guestUser = { id: 'guest-' + Date.now() };
      setUser(guestUser);
      setIsSignedIn(false);
    }
  };

  const loadUserPhotos = async (userId) => {
    try {
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .list(userId, { limit: 100, offset: 0 });

      if (error) {
        console.error('❌ Error loading photos:', error);
        return;
      }

      if (data && data.length > 0) {
        const photoUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('profile-photos')
              .getPublicUrl(`${userId}/${file.name}`);
            return {
              name: file.name,
              url: urlData.publicUrl,
              size: file.metadata?.size || 0
            };
          })
        );
        setPhotos(photoUrls);
        console.log('✅ Loaded photos:', photoUrls.length);
      }
    } catch (error) {
      console.error('❌ Error in loadUserPhotos:', error);
    }
  };

  const handleFileSelect = async (event) => {
    console.log('🔍 File select triggered', event);
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('⚠️ No files selected');
      alert('⚠️ No files were selected. Please try selecting files again.');
      return;
    }

    console.log('📁 Files selected:', files.length);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📸 Processing file ${i + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      await uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    if (!user) {
      alert('❌ Please wait for user initialization');
      return;
    }

    setIsUploading(true);
    console.log('🚀 Starting photo upload:', file.name);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('📂 Upload path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        alert(`❌ Upload failed: ${error.message}`);
        return;
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Add to photos state
      const newPhoto = {
        name: fileName,
        url: urlData.publicUrl,
        size: file.size
      };

      setPhotos(prev => [...prev, newPhoto]);
      console.log('✅ Photo added to gallery');
      alert('✅ Photo uploaded successfully!');

    } catch (error) {
      console.error('❌ Upload exception:', error);
      alert(`❌ Upload error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="photo-upload-section">
      <h3>📸 Photo Upload</h3>
      
      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="upload-btn"
        >
          {isUploading ? '⏳ Uploading...' : '📤 Select Photos'}
        </button>

        {user && (
          <p className="user-status">
            👤 User: {isSignedIn ? 'Signed In' : 'Guest'} ({user.id.substring(0, 8)}...)
          </p>
        )}
      </div>

      {photos.length > 0 && (
        <div className="photo-gallery">
          <h4>Your Photos ({photos.length})</h4>
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo.url} alt={`Photo ${index + 1}`} />
                <p>{photo.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Voice Recording Component
function VoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    getUser();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Upload to Supabase
        if (user) {
          const fileName = `voice-${Date.now()}.wav`;
          const { error } = await supabase.storage
            .from('voice-recordings')
            .upload(`${user.id}/${fileName}`, audioBlob);
          
          if (error) {
            console.error('❌ Voice upload error:', error);
          } else {
            console.log('✅ Voice uploaded successfully');
          }
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('❌ Recording error:', error);
      alert('❌ Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="voice-recording-section">
      <h3>🎤 Voice Introduction</h3>
      
      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="record-btn">
            🎤 Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-btn">
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      {audioURL && (
        <div className="audio-playback">
          <h4>Your Recording:</h4>
          <audio controls src={audioURL} />
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  return (
    <div className="App">
      <header className="app-header">
        <LuvLangLogo />
        <h1>Find Your Perfect Match</h1>
        <p>Professional Dating for Serious Relationships</p>
      </header>

      <main className="app-main">
        <div className="features-section">
          <div className="feature-card">
            <PhotoUpload />
          </div>
          
          <div className="feature-card">
            <VoiceRecording />
          </div>

          <div className="feature-card">
            <h3>💝 Premium Features</h3>
            <ul>
              <li>✨ AI-Powered Matching</li>
              <li>🔐 Verified Profiles</li>
              <li>💬 Unlimited Messaging</li>
              <li>🎯 Advanced Filters</li>
              <li>💎 Priority Support</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <LuvLangLogo />
          <p>&copy; 2025 LuvLang. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;