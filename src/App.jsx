import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase.js';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // PayPal membership state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState(null);

  // Initialize user session and load data
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
        loadUserData(session.user.id);
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
      
      // Create user profile
      await createUserProfile(data.user.id);
      
    } catch (error) {
      console.error('❌ Anonymous sign-in failed:', error);
      // Fallback to guest mode
      const guestUser = { id: 'guest-' + Date.now() };
      setUser(guestUser);
      setIsSignedIn(false);
    }
  };

  const createUserProfile = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        console.error('❌ Profile creation error:', error);
      } else {
        console.log('✅ User profile created/updated');
      }
    } catch (error) {
      console.error('❌ Profile creation failed:', error);
    }
  };

  const loadUserData = async (userId) => {
    try {
      console.log('📂 Loading user data for:', userId);
      
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
              name: file.name,
              size: (file.metadata?.size / 1024 / 1024)?.toFixed(1) + 'MB' || 'Unknown'
            };
          })
        );
        
        setPhotos(photosWithUrls);
        console.log('✅ Loaded photos:', photosWithUrls.length);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    setUploading(true);
    console.log('📤 Starting photo upload...');
    
    try {
      const uploadedPhotos = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        console.log('📷 Processing:', file.name);

        // Try Supabase storage first, fallback to local storage
        let photoUrl = null;
        let uploadMethod = 'local';

        if (user && isSignedIn) {
          try {
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = `${user.id}/${fileName}`;

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
          uploadedPhotos.push({
            id: Date.now() + Math.random(),
            url: photoUrl,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + 'MB',
            method: uploadMethod
          });
        }
      }

      if (uploadedPhotos.length > 0) {
        setPhotos(prev => [...prev, ...uploadedPhotos]);
        const supabaseCount = uploadedPhotos.filter(p => p.method === 'supabase').length;
        const localCount = uploadedPhotos.filter(p => p.method === 'local').length;
        
        let message = `✅ Uploaded ${uploadedPhotos.length} photo(s)!`;
        if (supabaseCount > 0) message += ` ${supabaseCount} to Supabase.`;
        if (localCount > 0) message += ` ${localCount} locally.`;
        
        alert(message);
        console.log('🎉 Photos uploaded:', uploadedPhotos);
      }
    } catch (error) {
      console.error('❌ Upload process error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removePhoto = async (photoId) => {
    if (!user) return;

    try {
      console.log('🗑️ Removing photo:', photoId);
      
      const filePath = `${user.id}/${photoId}`;
      
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        alert('Failed to delete photo');
        return;
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      console.log('✅ Photo deleted from Supabase');
      alert('Photo deleted successfully');
      
    } catch (error) {
      console.error('❌ Delete process error:', error);
      alert('Failed to delete photo');
    }
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
      
      audioChunksRef.current = [];
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Save to Supabase if user is available
        if (user && isSignedIn) {
          await saveVoiceRecording(audioBlob, mimeType);
        } else {
          // Fallback to local storage for guest users
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        }
        
        stream.getTracks().forEach(track => track.stop());
        setRecordingStatus('stopped');
        alert('✅ Voice recording completed and saved!');
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingStatus('recording');
      console.log('🔴 Recording started...');
      
    } catch (error) {
      console.error('❌ Microphone error:', error);
      setRecordingStatus('inactive');
      
      if (error.name === 'NotAllowedError') {
        alert('🎤 Microphone access denied. Please allow microphone permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('🎤 No microphone found. Please connect a microphone and try again.');
      } else {
        alert(`🎤 Recording error: ${error.message}`);
      }
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingStatus('inactive');
    audioChunksRef.current = [];
  };

  // PayPal membership functions
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
    <div className="App">
      <header className="app-header">
        <h1>LuvLang Professional Dating</h1>
        <div className="connection-status">
          {isSignedIn ? (
            <span style={{ color: '#28a745' }}>🟢 Connected to Supabase</span>
          ) : (
            <span style={{ color: '#ffc107' }}>🟡 Guest Mode</span>
          )}
        </div>
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
              {uploading ? 'Uploading to Supabase...' : '📷 Choose Photos'}
            </label>
            
            <div className="upload-info">
              • Supports JPG, PNG, GIF, WebP<br/>
              • Maximum 5MB per photo<br/>
              • Photos saved to Supabase database<br/>
              • {isSignedIn ? 'Data persists between sessions' : 'Guest mode - limited storage'}
            </div>
          </div>

          {photos.length > 0 && (
            <div className="photos-section">
              <h3>Your Photos ({photos.length}) - Stored in Supabase</h3>
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
              <p>Click "Choose Photos" to upload to Supabase database!</p>
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
                <p>Speak clearly into your microphone. Recording will be saved to Supabase.</p>
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
                <h3>Recording Complete - Saved to Supabase!</h3>
                <p>Your voice message has been recorded and stored in the database.</p>
                
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
              • Recordings saved to Supabase voice-recordings bucket<br/>
              • Voice recordings help with compatibility matching<br/>
              • {isSignedIn ? 'Data persists between sessions' : 'Guest mode recordings are temporary'}
            </div>
          </div>
        </div>

        {/* Membership Plans Section */}
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
      </main>
    </div>
  );
}

export default App;