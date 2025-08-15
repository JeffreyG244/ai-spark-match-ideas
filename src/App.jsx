import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import './App.css';

// Home component for the main landing page
function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="dashboard">
      <h2>Welcome to LuvLang Professional</h2>
      <p>Professional Dating Platform with AI-Powered Matching</p>
      
      <div className="feature-grid">
        <div className="feature-card" onClick={() => navigate('/dashboard')}>
          <div className="feature-icon">🏢</div>
          <h3>Professional Gallery</h3>
          <p>Upload professional photos for career-focused matches</p>
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

      <div className="features-overview">
        <div className="feature-highlight">
          <span>📊</span>
          <h4>Advanced Analytics</h4>
          <p>Deep compatibility analysis using voice patterns and visual cues</p>
        </div>
        
        <div className="feature-highlight">
          <span>🔒</span>
          <h4>Privacy First</h4>
          <p>Your data is encrypted and secure, with full control over your information</p>
        </div>
        
        <div className="feature-highlight">
          <span>🎯</span>
          <h4>Quality Matches</h4>
          <p>AI-powered matching focuses on long-term compatibility and shared values</p>
        </div>
        
        <div className="feature-highlight">
          <span>✨</span>
          <h4>Professional Network</h4>
          <p>Connect with career-minded individuals for meaningful relationships</p>
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