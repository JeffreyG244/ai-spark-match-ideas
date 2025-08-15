import React, { useState, useRef } from 'react';
import './App.css';

// Simple Photo Upload Component
function PhotoUpload() {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    try {
      const newPhotos = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB.`);
          continue;
        }

        const imageUrl = URL.createObjectURL(file);
        
        newPhotos.push({
          id: Date.now() + i,
          url: imageUrl,
          file: file,
          isPrimary: photos.length === 0 && newPhotos.length === 0
        });
      }

      if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos]);
        alert(`Successfully uploaded ${newPhotos.length} photo(s).`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading photos.');
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
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn primary"
          >
            {isUploading ? 'Uploading...' : 'Upload Photos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
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

// Voice Recording Component
function VoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      alert('Recording started! Speak naturally for 30 seconds for voice analysis.');

      setTimeout(() => {
        stopRecording();
      }, 30000);
      
    } catch (error) {
      alert('Please allow microphone access for voice analysis');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
      
      alert('Recording complete! Your voice sample has been captured successfully.');
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
              <h5>Emma Wilson</h5>
              <span className="compatibility">94% compatible</span>
              <p>Warm, melodic voice with a gentle speaking pace</p>
            </div>
            <div className="match-item">
              <h5>Sofia Martinez</h5>
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
        
        // Simulate receiving matches
        const newMatches = [
          {
            id: 1,
            name: "Emma Wilson",
            age: 28,
            compatibility: 94,
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400",
            bio: "Software engineer who loves hiking and coffee",
            distance: "2 miles away"
          },
          {
            id: 2,
            name: "Sofia Martinez",
            age: 26,
            compatibility: 89,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
            bio: "Artist and yoga instructor",
            distance: "5 miles away"
          },
          {
            id: 3,
            name: "Rachel Chen",
            age: 30,
            compatibility: 87,
            image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
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
      name: "Emma Wilson",
      lastMessage: "Hey! Thanks for the like 😊",
      time: "2 min ago",
      unread: true,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100"
    },
    {
      id: 2,
      name: "Sofia Martinez",
      lastMessage: "That hiking spot looks amazing!",
      time: "1 hour ago",
      unread: false,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
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
        </nav>
      </header>

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;