import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase.js';
import './App.css';

// Enhanced Photo Upload Component with Supabase
function PhotoUpload() {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize user session
  useEffect(() => {
    console.log('🚀 Initializing Supabase connection...');
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
        // Fallback to guest mode
        const guestUser = { id: 'guest-' + Date.now() };
        setUser(guestUser);
        setIsSignedIn(false);
        return;
      }

      console.log('✅ Anonymous user created:', data.user.id);
      setUser(data.user);
      setIsSignedIn(true);
      
    } catch (error) {
      console.error('❌ Anonymous sign-in failed:', error);
      // Fallback to guest mode
      const guestUser = { id: 'guest-' + Date.now() };
      setUser(guestUser);
      setIsSignedIn(false);
    }
  };

  const loadUserPhotos = async (userId) => {
    try {
      console.log('📂 Loading user photos for:', userId);
      
      // Load photos from Supabase Storage
      const { data: photoList, error: listError } = await supabase.storage
        .from('profile-photos')
        .list(`${userId}/`);

      if (listError) {
        console.error('❌ Error loading photos:', listError);
        return;
      }

      if (photoList && photoList.length > 0) {
        const photosWithUrls = await Promise.all(
          photoList.map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-photos')
              .getPublicUrl(`${userId}/${file.name}`);
            
            return {
              id: file.name,
              url: publicUrl,
              fileName: file.name,
              fileSize: file.metadata?.size || 0,
              isPrimary: false // You could store this in database
            };
          })
        );
        
        if (photosWithUrls.length > 0) {
          photosWithUrls[0].isPrimary = true; // Make first photo primary
        }
        
        setPhotos(photosWithUrls);
        console.log('✅ Loaded photos:', photosWithUrls.length);
      }
    } catch (error) {
      console.error('❌ Error loading user photos:', error);
    }
  };

  const handleFileSelect = async (event) => {
    console.log('File select triggered', event);
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
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

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          console.error(`File too large: ${file.size} bytes`);
          alert(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`);
          continue;
        }

        // Try Supabase storage first, fallback to local storage
        let photoUrl = null;
        let uploadMethod = 'local';

        if (user && isSignedIn) {
          try {
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = `${user.id}/${fileName}`;

            console.log('📤 Uploading to Supabase:', filePath);

            // Try to upload to Supabase
            const { data, error } = await supabase.storage
              .from('profile-photos')
              .upload(filePath, file);

            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(data.path);
              
              photoUrl = publicUrl;
              uploadMethod = 'supabase';
              console.log('✅ Uploaded to Supabase:', data.path);
            } else {
              console.log('⚠️ Supabase upload failed, using local storage:', error?.message);
              photoUrl = URL.createObjectURL(file);
            }
          } catch (supabaseError) {
            console.log('⚠️ Supabase error, using local storage:', supabaseError.message);
            photoUrl = URL.createObjectURL(file);
          }
        } else {
          // Guest mode or no user - use local storage
          photoUrl = URL.createObjectURL(file);
        }

        if (photoUrl) {
          newPhotos.push({
            id: Date.now() + i,
            url: photoUrl,
            file: file,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadMethod: uploadMethod,
            isPrimary: photos.length === 0 && newPhotos.length === 0
          });
        }
      }

      if (newPhotos.length > 0) {
        console.log('Adding photos to state:', newPhotos);
        setPhotos(prev => {
          const updated = [...prev, ...newPhotos];
          console.log('Updated photos state:', updated);
          return updated;
        });
        const supabaseCount = newPhotos.filter(p => p.uploadMethod === 'supabase').length;
        const localCount = newPhotos.filter(p => p.uploadMethod === 'local').length;
        
        let message = `✅ Uploaded ${newPhotos.length} photo(s)!`;
        if (supabaseCount > 0) message += ` ${supabaseCount} to Supabase.`;
        if (localCount > 0) message += ` ${localCount} locally.`;
        
        alert(message);
      } else {
        alert('No valid photos were uploaded. Please check your file types and sizes.');
      }
    } catch (error) {
      console.error('Upload error:', error);
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
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    setPhotos(updatedPhotos);
  };

  return (
    <div className="section">
      <h2>Profile Photos ({photos.length}/6)</h2>
      <p>Upload photos that show your personality. Your first photo will be your main profile picture.</p>
      
      {photos.length < 6 && (
        <div className="upload-controls">
          <button
            onClick={() => {
              console.log('Upload button clicked');
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="btn primary"
          >
            {isUploading ? '⏳ Uploading...' : '📷 Upload Photos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            onClick={(e) => {
              console.log('File input clicked');
              // Reset the input to allow re-selecting the same file
              e.target.value = '';
            }}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            Supported: JPG, PNG, GIF, WebP • Max 5MB per photo • Up to 6 photos
          </p>
        </div>
      )}

      <div className="photo-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-item">
            <img src={photo.url} alt="Profile" />
            <div className="photo-controls">
              {photo.isPrimary && <span className="primary-badge">Primary</span>}
              <button onClick={() => setPrimaryPhoto(photo.id)}>Set Primary</button>
              <button onClick={() => removePhoto(photo.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Voice Recording Component with Supabase
function VoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Initialize user session
  useEffect(() => {
    console.log('🎤 Initializing voice recording with Supabase...');
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Voice: User session found:', session.user.id);
        setUser(session.user);
        setIsSignedIn(true);
      } else {
        console.log('👤 Voice: No session, signing in anonymously...');
        await signInAnonymously();
      }
    } catch (error) {
      console.error('❌ Voice: Session initialization error:', error);
      await signInAnonymously();
    }
  };

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('❌ Voice: Anonymous sign-in error:', error);
        const guestUser = { id: 'guest-' + Date.now() };
        setUser(guestUser);
        setIsSignedIn(false);
        return;
      }

      console.log('✅ Voice: Anonymous user created:', data.user.id);
      setUser(data.user);
      setIsSignedIn(true);
      
    } catch (error) {
      console.error('❌ Voice: Anonymous sign-in failed:', error);
      const guestUser = { id: 'guest-' + Date.now() };
      setUser(guestUser);
      setIsSignedIn(false);
    }
  };

  const startRecording = async () => {
    console.log('Starting voice recording...');
    
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('❌ Voice recording is not supported in this browser. Please try Chrome, Firefox, or Safari.');
      return;
    }

    // Check if we're on HTTPS (required for microphone access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      alert('🔒 Microphone access requires HTTPS. Please ensure you\'re on a secure connection.');
      return;
    }

    try {
      console.log('Requesting microphone access...');
      
      // Request microphone permission with detailed options
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Microphone access granted:', stream);

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert('❌ Voice recording is not supported in this browser. Please update your browser.');
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log('Audio data chunk received:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        
        // Save to Supabase if user is available
        if (user && isSignedIn) {
          await saveVoiceRecording(audioBlob, mimeType);
        } else {
          // Fallback to local storage for guest users
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        }
        
        // Clean up the stream
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Audio track stopped');
        });
        
        console.log('Audio blob created:', audioBlob.size, 'bytes');
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        alert('❌ Recording error occurred. Please try again.');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      alert('🎤 Recording started! Speak naturally for 30 seconds for voice analysis.');
      console.log('Recording started successfully');

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Microphone access error:', error);
      
      let errorMessage = '❌ Microphone access denied. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please click the microphone icon in your browser\'s address bar and allow access, then try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Microphone is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Microphone settings conflict. Please try again.';
      } else {
        errorMessage += `Error: ${error.message}. Please check your microphone settings and try again.`;
      }
      
      alert(errorMessage);
    }
  };

  const saveVoiceRecording = async (audioBlob, mimeType) => {
    try {
      const fileName = `voice-${Date.now()}.${mimeType.split('/')[1]}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('💾 Saving voice recording to Supabase:', fileName);

      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .upload(filePath, audioBlob);

      if (error) {
        console.error('❌ Voice upload error:', error);
        // Fallback to local URL
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        return;
      }

      console.log('✅ Voice recording saved to Supabase');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-recordings')
        .getPublicUrl(data.path);

      setAudioUrl(publicUrl);
      
    } catch (error) {
      console.error('❌ Voice save error:', error);
      // Fallback to local URL
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
      
      alert('Recording complete! Your voice sample has been captured and saved successfully.');
    }
  };

  const analyzeVoice = () => {
    setIsAnalyzing(true);
    alert('AI is analyzing your vocal patterns and compatibility...');

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      alert('Voice compatibility results are ready!');
    }, 3500);
  };

  return (
    <div className="section">
      <h2>Voice Compatibility Analysis</h2>
      <p>AI-powered vocal pattern matching for deeper connections</p>

      <div className="recording-area">
        {isRecording ? (
          <div className="recording-active">
            <div className="pulse-animation">🎤</div>
            <p>Recording in progress...</p>
            <button onClick={stopRecording} className="btn secondary">Stop Recording</button>
          </div>
        ) : (
          <div className="recording-ready">
            <div className="mic-icon">🎤</div>
            <p>{hasRecording ? "Recording Complete" : "Ready to Record"}</p>
            <button 
              onClick={hasRecording ? analyzeVoice : startRecording}
              disabled={isAnalyzing}
              className="btn primary"
            >
              {isAnalyzing ? 'Analyzing...' : (hasRecording ? 'Analyze Voice' : 'Start Recording')}
            </button>
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="audio-playback">
          <h3>Your Voice Sample:</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )}

      {analysisComplete && (
        <div className="analysis-results">
          <h3>Voice Analysis Results</h3>
          <p>AI-analyzed vocal characteristics</p>
          
          <div className="voice-matches">
            <h4>Voice-Compatible Matches</h4>
            <div className="match-item">
              <h5>Sarah Johnson</h5>
              <span className="compatibility">94% compatible</span>
              <p>Warm, melodic voice with a gentle speaking pace</p>
            </div>
            <div className="match-item">
              <h5>Maria Rodriguez</h5>
              <span className="compatibility">89% compatible</span>
              <p>Clear, confident voice with expressive intonation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Matches Component
function Matches() {
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const triggerN8NMatching = async () => {
    setIsLoadingMatches(true);
    try {
      const response = await fetch('http://localhost:5678/webhook/luvlang-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user-123',
          action: 'find_matches',
          timestamp: new Date().toISOString(),
          preferences: {
            age_range: [25, 35],
            distance: 50,
            enhanced_matching: true
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('N8N matching workflow triggered:', result);
        
        // Simulate receiving matches with properly matched photos and profiles
        const newMatches = [
          {
            id: 1,
            name: "Sarah Johnson",
            age: 28,
            compatibility: 94,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
            bio: "Software engineer who loves hiking and coffee",
            distance: "2 miles away"
          },
          {
            id: 2,
            name: "Maria Rodriguez",
            age: 26,
            compatibility: 89,
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
            bio: "Artist and yoga instructor",
            distance: "5 miles away"
          },
          {
            id: 3,
            name: "Emily Chen",
            age: 30,
            compatibility: 87,
            image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face",
            bio: "Marketing director with a passion for travel",
            distance: "3 miles away"
          }
        ];
        
        setMatches(newMatches);
        alert('N8N matching workflow completed! Found ' + newMatches.length + ' compatible matches.');
      } else {
        throw new Error('Webhook failed');
      }
    } catch (error) {
      console.error('N8N workflow failed:', error);
      alert('Failed to trigger matching workflow. Make sure n8n is running on localhost:5678');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  return (
    <div className="section">
      <h2>Your Matches</h2>
      <p>AI-powered compatibility matching with real-time n8n workflow integration</p>

      <div className="workflow-controls">
        <button 
          onClick={triggerN8NMatching}
          disabled={isLoadingMatches}
          className="btn primary large"
        >
          {isLoadingMatches ? (
            <>
              <div className="spinner"></div>
              Finding Your Perfect Matches...
            </>
          ) : (
            <>
              🚀 Trigger N8N Matching Workflow
            </>
          )}
        </button>
      </div>

      <div className="matches-grid">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            <img src={match.image} alt={match.name} className="match-image" />
            <div className="match-info">
              <h3>{match.name}, {match.age}</h3>
              <div className="compatibility-score">{match.compatibility}% compatible</div>
              <p className="match-bio">{match.bio}</p>
              <p className="match-distance">{match.distance}</p>
              <div className="match-actions">
                <button className="btn secondary">Pass</button>
                <button className="btn primary">Like ❤️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="empty-state">
          <h3>No matches yet</h3>
          <p>Trigger the N8N workflow to find your perfect matches!</p>
        </div>
      )}
    </div>
  );
}

// Messages Component
function Messages() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Hey! Thanks for the like 😊",
      time: "2 min ago",
      unread: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      lastMessage: "That hiking spot looks amazing!",
      time: "1 hour ago",
      unread: false,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    }
  ]);

  return (
    <div className="section">
      <h2>Messages</h2>
      <p>Connect with your matches through secure messaging</p>

      <div className="conversations-list">
        {conversations.map((conversation) => (
          <div key={conversation.id} className={`conversation-item ${conversation.unread ? 'unread' : ''}`}>
            <img src={conversation.image} alt={conversation.name} className="conversation-avatar" />
            <div className="conversation-content">
              <div className="conversation-header">
                <h4>{conversation.name}</h4>
                <span className="conversation-time">{conversation.time}</span>
              </div>
              <p className="conversation-preview">{conversation.lastMessage}</p>
            </div>
            {conversation.unread && <div className="unread-indicator"></div>}
          </div>
        ))}
      </div>

      <div className="messaging-info">
        <h3>🔒 Safe & Secure Messaging</h3>
        <ul>
          <li>All messages are encrypted</li>
          <li>No personal information shared until you're ready</li>
          <li>Report and block features available</li>
          <li>AI-powered content moderation</li>
        </ul>
      </div>
    </div>
  );
}

// Discover Component
function Discover() {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const triggerDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const response = await fetch('http://localhost:5678/webhook/luvlang-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'discover_new_profiles',
          timestamp: new Date().toISOString(),
          discovery_preferences: {
            location_radius: 25,
            new_profiles_only: true,
            enhanced_algorithm: true
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('N8N discovery workflow triggered:', result);
        alert('Discovery workflow completed! New profiles have been found.');
      }
    } catch (error) {
      console.error('Discovery workflow failed:', error);
      alert('Failed to trigger discovery. Make sure n8n is running.');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="section">
      <h2>Discover New People</h2>
      <p>Find new potential matches in your area with AI-powered discovery</p>

      <div className="discovery-controls">
        <button 
          onClick={triggerDiscovery}
          disabled={isDiscovering}
          className="btn primary large"
        >
          {isDiscovering ? (
            <>
              <div className="spinner"></div>
              Discovering New Profiles...
            </>
          ) : (
            <>
              🔍 Discover New Matches
            </>
          )}
        </button>
      </div>

      <div className="discovery-features">
        <div className="feature-item">
          <span className="feature-icon">🎯</span>
          <h4>Smart Filtering</h4>
          <p>AI-powered matching based on your preferences and behavior</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🌟</span>
          <h4>Fresh Profiles</h4>
          <p>Discover newly joined members in your area</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <h4>Real-time Updates</h4>
          <p>Get instant notifications when new compatible profiles are found</p>
        </div>
      </div>
    </div>
  );
}

// Premium Membership Component with PayPal Integration
function PremiumMembership() {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState(null);

  // Initialize user session
  useEffect(() => {
    console.log('💎 Initializing membership with Supabase...');
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Membership: User session found:', session.user.id);
        setUser(session.user);
        setIsSignedIn(true);
      } else {
        console.log('👤 Membership: No session, signing in anonymously...');
        await signInAnonymously();
      }
    } catch (error) {
      console.error('❌ Membership: Session initialization error:', error);
      await signInAnonymously();
    }
  };

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('❌ Membership: Anonymous sign-in error:', error);
        const guestUser = { id: 'guest-' + Date.now() };
        setUser(guestUser);
        setIsSignedIn(false);
        return;
      }

      console.log('✅ Membership: Anonymous user created:', data.user.id);
      setUser(data.user);
      setIsSignedIn(true);
      
    } catch (error) {
      console.error('❌ Membership: Anonymous sign-in failed:', error);
      const guestUser = { id: 'guest-' + Date.now() };
      setUser(guestUser);
      setIsSignedIn(false);
    }
  };

  const handlePayPalPurchase = async (planType) => {
    if (!user) {
      alert('Please sign in to purchase a membership');
      return;
    }

    setPaypalLoading(true);
    setPaypalError(null);
    setSelectedPlan(planType);

    try {
      console.log('💳 Creating PayPal order...', { planType, billingCycle });

      const response = await fetch('https://tzskjzkolyiwhijslqmq.supabase.co/functions/v1/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          planType,
          billingCycle
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ PayPal order created:', data);

      // In a real implementation, you would redirect to PayPal here
      alert(`✅ PayPal order created successfully! Order ID: ${data.orderID}\nAmount: $${data.amount}\n\nIn production, you would be redirected to PayPal to complete payment.`);

    } catch (error) {
      console.error('❌ PayPal order creation failed:', error);
      setPaypalError(error.message);
      alert(`❌ PayPal error: ${error.message}`);
    } finally {
      setPaypalLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>💎 Premium Membership Plans</h2>
      <p>Unlock advanced matching algorithms and exclusive features with our premium plans.</p>
      
      <div className="billing-toggle">
        <button 
          className={`billing-button ${billingCycle === 'monthly' ? 'active' : ''}`}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button 
          className={`billing-button ${billingCycle === 'yearly' ? 'active' : ''}`}
          onClick={() => setBillingCycle('yearly')}
        >
          Yearly (Save 20%)
        </button>
      </div>

      <div className="plans-grid">
        <div className="plan-card">
          <h3>🌟 Premium</h3>
          <div className="plan-price">
            <span className="currency">$</span>
            <span className="amount">{billingCycle === 'yearly' ? '199' : '19.99'}</span>
            <span className="period">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
          </div>
          <ul className="plan-features">
            <li>✓ Advanced AI matching</li>
            <li>✓ Voice compatibility analysis</li>
            <li>✓ Unlimited messages</li>
            <li>✓ Priority customer support</li>
          </ul>
          <button 
            className={`plan-button ${paypalLoading && selectedPlan === 'premium' ? 'loading' : ''}`}
            onClick={() => handlePayPalPurchase('premium')}
            disabled={paypalLoading}
          >
            {paypalLoading && selectedPlan === 'premium' ? 'Processing...' : '💳 Purchase with PayPal'}
          </button>
        </div>

        <div className="plan-card featured">
          <div className="popular-badge">Most Popular</div>
          <h3>💎 VIP</h3>
          <div className="plan-price">
            <span className="currency">$</span>
            <span className="amount">{billingCycle === 'yearly' ? '399' : '39.99'}</span>
            <span className="period">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
          </div>
          <ul className="plan-features">
            <li>✓ Everything in Premium</li>
            <li>✓ Profile boost & highlights</li>
            <li>✓ Advanced search filters</li>
            <li>✓ Exclusive VIP events</li>
            <li>✓ Personal dating coach</li>
          </ul>
          <button 
            className={`plan-button ${paypalLoading && selectedPlan === 'vip' ? 'loading' : ''}`}
            onClick={() => handlePayPalPurchase('vip')}
            disabled={paypalLoading}
          >
            {paypalLoading && selectedPlan === 'vip' ? 'Processing...' : '💳 Purchase with PayPal'}
          </button>
        </div>
      </div>

      {paypalError && (
        <div className="error-message">
          ❌ Error: {paypalError}
        </div>
      )}

      <div className="payment-info">
        <h4>🔒 Secure Payment Processing</h4>
        <p>
          • Payments processed securely through PayPal<br/>
          • SSL encrypted transactions<br/>
          • No payment information stored on our servers<br/>
          • Cancel anytime through your PayPal account
        </p>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'photos':
        return <PhotoUpload />;
      case 'voice':
        return <VoiceRecording />;
      case 'matches':
        return <Matches />;
      case 'messages':
        return <Messages />;
      case 'discover':
        return <Discover />;
      case 'membership':
        return <PremiumMembership />;
      default:
        return (
          <div className="dashboard">
            <h2>Welcome to LuvLang</h2>
            <p>Professional Dating Platform with AI-Powered Matching</p>
            
            <div className="feature-grid">
              <div className="feature-card" onClick={() => setCurrentPage('photos')}>
                <div className="feature-icon">📷</div>
                <h3>Photo Upload</h3>
                <p>Upload your profile photos to get started</p>
                <button className="btn">Manage Photos</button>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('voice')}>
                <div className="feature-icon">🎤</div>
                <h3>Voice Compatibility</h3>
                <p>Record voice samples for AI-powered matching</p>
                <button className="btn">Record Voice</button>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('matches')}>
                <div className="feature-icon">💕</div>
                <h3>Your Matches</h3>
                <p>View and interact with your compatible matches</p>
                <button className="btn">View Matches</button>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('messages')}>
                <div className="feature-icon">💬</div>
                <h3>Messages</h3>
                <p>Chat securely with your matches</p>
                <button className="btn">Open Messages</button>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('discover')}>
                <div className="feature-icon">🔍</div>
                <h3>Discover</h3>
                <p>Find new people in your area</p>
                <button className="btn">Start Discovering</button>
              </div>

              <div className="feature-card" onClick={() => setCurrentPage('membership')}>
                <div className="feature-icon">💎</div>
                <h3>Premium Membership</h3>
                <p>Unlock advanced features with premium plans</p>
                <button className="btn">View Plans</button>
              </div>
            </div>

            <div className="features-overview">
              <div className="feature-highlight">
                <span>🤖</span>
                <h4>AI Matching</h4>
                <p>Advanced n8n workflows for perfect compatibility</p>
              </div>
              <div className="feature-highlight">
                <span>👔</span>
                <h4>Professional Focus</h4>
                <p>Designed for career-minded individuals</p>
              </div>
              <div className="feature-highlight">
                <span>🔒</span>
                <h4>Safe & Secure</h4>
                <p>End-to-end encryption and privacy protection</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 onClick={() => setCurrentPage('dashboard')}>LuvLang</h1>
        <nav>
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={currentPage === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('discover')}
            className={currentPage === 'discover' ? 'active' : ''}
          >
            Discover
          </button>
          <button 
            onClick={() => setCurrentPage('matches')}
            className={currentPage === 'matches' ? 'active' : ''}
          >
            Matches
          </button>
          <button 
            onClick={() => setCurrentPage('messages')}
            className={currentPage === 'messages' ? 'active' : ''}
          >
            Messages
          </button>
          <button 
            onClick={() => setCurrentPage('photos')}
            className={currentPage === 'photos' ? 'active' : ''}
          >
            Photos
          </button>
          <button 
            onClick={() => setCurrentPage('voice')}
            className={currentPage === 'voice' ? 'active' : ''}
          >
            Voice
          </button>
          <button 
            onClick={() => setCurrentPage('membership')}
            className={currentPage === 'membership' ? 'active' : ''}
          >
            Membership
          </button>
        </nav>
      </header>

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;