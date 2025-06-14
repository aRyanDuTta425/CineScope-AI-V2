import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsVisible(true), 100);

    // Mouse movement tracking for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartExploring = () => {
    navigate('/search');
  };

  const features = [
    {
      icon: '🔍',
      title: 'Natural Language Movie Search',
      description: 'Search movies using natural language queries powered by MongoDB Vector Search and semantic understanding.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Summaries',
      description: 'Get intelligent movie insights and summaries generated by Google Gemini AI for deeper understanding.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '📊',
      title: 'Interactive Dashboards & Charts',
      description: 'Explore rich visualizations and interactive charts to discover movie trends and patterns.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '✨',
      title: 'Smart Discovery Filters',
      description: 'Discover movies with intelligent filtering options that adapt to your preferences and viewing history.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  return (
    <div className="homepage">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`floating-element element-${i % 4 + 1}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className={`hero-section ${isVisible ? 'visible' : ''}`}>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">⚡</span>
              <span className="badge-text">Powered by AI</span>
            </div>
            
            <h1 className="hero-title">
              Unlock Movie Intelligence with{' '}
              <span className="highlight">
                AI + MongoDB Vector Search
                <div className="highlight-underline"></div>
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Discover, analyze, and explore movies like never before with the power of 
              artificial intelligence and advanced semantic search capabilities.
            </p>
            
            <div className="cta-container">
              <button 
                className="cta-button primary" 
                onClick={handleStartExploring}
              >
                <span className="cta-text">Start Exploring</span>
                <span className="cta-icon">🚀</span>
                <div className="button-glow"></div>
              </button>
              
              <button className="cta-button secondary">
                <span className="cta-text">Watch Demo</span>
                <span className="cta-icon">▶️</span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Movies Analyzed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">AI</div>
                <div className="stat-label">Powered Insights</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Real-time Search</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            {/* 3D Movie Cards */}
            <div className="movie-cards-container">
              <div className="movie-card card-1">
                <div className="card-shine"></div>
                <div className="card-content">
                  <div className="card-title">The Matrix</div>
                  <div className="card-rating">⭐ 8.7</div>
                </div>
              </div>
              <div className="movie-card card-2">
                <div className="card-shine"></div>
                <div className="card-content">
                  <div className="card-title">Inception</div>
                  <div className="card-rating">⭐ 8.8</div>
                </div>
              </div>
              <div className="movie-card card-3">
                <div className="card-shine"></div>
                <div className="card-content">
                  <div className="card-title">Interstellar</div>
                  <div className="card-rating">⭐ 8.6</div>
                </div>
              </div>
            </div>

            {/* AI Brain Visualization */}
            <div className="ai-brain">
              <div className="brain-core"></div>
              <div className="neural-connections">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`neural-line line-${i + 1}`}></div>
                ))}
              </div>
            </div>

            {/* Data Flow Visualization */}
            <div className="data-flow">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`data-particle particle-${i + 1}`}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`features-section ${isVisible ? 'visible' : ''}`}>
        <div className="features-container">
          <div className="section-header">
            <div className="section-badge">
              <span>🎯 Features</span>
            </div>
            <h2 className="section-title">
              Powerful AI-Driven Capabilities
            </h2>
            <p className="section-subtitle">
              Experience the future of movie discovery with cutting-edge technology
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card feature-${index + 1}`}
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  '--feature-gradient': feature.gradient
                }}
              >
                <div className="feature-background"></div>
                <div className="feature-icon-container">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="icon-ripple"></div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className={`tech-section ${isVisible ? 'visible' : ''}`}>
        <div className="tech-container">
          <h3 className="tech-title">Built with Industry-Leading Technology</h3>
          <div className="tech-stack">
            <div className="tech-item">
              <div className="tech-icon-bg">
                <span className="tech-logo">🍃</span>
              </div>
              <div className="tech-info">
                <span className="tech-name">MongoDB Atlas</span>
                <span className="tech-desc">Vector Database</span>
              </div>
            </div>
            <div className="tech-connector">
              <div className="connector-line"></div>
              <div className="connector-pulse"></div>
            </div>
            <div className="tech-item">
              <div className="tech-icon-bg">
                <span className="tech-logo">✨</span>
              </div>
              <div className="tech-info">
                <span className="tech-name">Google Gemini</span>
                <span className="tech-desc">AI Engine</span>
              </div>
            </div>
            <div className="tech-connector">
              <div className="connector-line"></div>
              <div className="connector-pulse"></div>
            </div>
            <div className="tech-item">
              <div className="tech-icon-bg">
                <span className="tech-logo">⚛️</span>
              </div>
              <div className="tech-info">
                <span className="tech-name">React</span>
                <span className="tech-desc">Frontend</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-glow"></div>
          <p>&copy; 2025 CineScope AI. Revolutionizing movie discovery through AI.</p>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
