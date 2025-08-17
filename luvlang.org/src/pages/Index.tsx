import React from 'react';

const Index = () => {

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #7c2d92 50%, #0f172a 100%)', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.2)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>LuvLang</h1>
              <nav style={{ display: 'flex', gap: '24px', marginLeft: '32px' }}>
                <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '8px' }}>How It Works</a>
                <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '8px' }}>Safety</a>
                <a href="#" style={{ color: 'white', textDecoration: 'none', padding: '8px' }}>Success Stories</a>
              </nav>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                Sign In
              </button>
              <button style={{ background: 'linear-gradient(45deg, #7c3aed, #ec4899)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: 'white', marginBottom: '24px', lineHeight: '1.1' }}>
            Find Your <span style={{ background: 'linear-gradient(45deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Executive Match</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            AI-powered connections for C-suite executives and senior professionals. Premium matching for those who demand excellence in life and love.
          </p>
          <button style={{ background: 'linear-gradient(45deg, #7c3aed, #ec4899)', color: 'white', border: 'none', padding: '16px 32px', fontSize: '1.125rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Start Your Journey
          </button>
        </div>

        {/* Executive Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          <div style={{ background: 'linear-gradient(45deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))', backdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>500+</div>
            <div style={{ color: '#a855f7' }}>C-Suite Executives</div>
          </div>
          <div style={{ background: 'linear-gradient(45deg, rgba(59,130,246,0.2), rgba(34,211,238,0.2))', backdropFilter: 'blur(20px)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>94%</div>
            <div style={{ color: '#3b82f6' }}>Compatibility Rate</div>
          </div>
          <div style={{ background: 'linear-gradient(45deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2))', backdropFilter: 'blur(20px)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>$500K+</div>
            <div style={{ color: '#22c55e' }}>Average Income</div>
          </div>
          <div style={{ background: 'linear-gradient(45deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))', backdropFilter: 'blur(20px)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>89%</div>
            <div style={{ color: '#f97316' }}>Success Rate</div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ background: 'linear-gradient(45deg, rgba(251,191,36,0.1), rgba(249,115,22,0.1))', backdropFilter: 'blur(20px)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '24px', padding: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>Ready to Find Your Executive Match?</h2>
          <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Join the most exclusive network of verified C-suite executives and senior professionals seeking meaningful connections.
          </p>
          <button style={{ background: 'linear-gradient(45deg, #eab308, #f97316)', color: 'white', border: 'none', padding: '16px 48px', fontSize: '1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Apply for Membership
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;