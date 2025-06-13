import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [titleText, setTitleText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const fullTitle = 'CineScope AI';
  const fullSubtitle = 'AI-Powered Semantic Search & Insights on Movies';

  useEffect(() => {
    // Typing effect for title
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      if (titleIndex <= fullTitle.length) {
        setTitleText(fullTitle.slice(0, titleIndex));
        titleIndex++;
      } else {
        clearInterval(titleInterval);
        // Start subtitle typing after title is complete
        setTimeout(() => {
          let subtitleIndex = 0;
          const subtitleInterval = setInterval(() => {
            if (subtitleIndex <= fullSubtitle.length) {
              setSubtitleText(fullSubtitle.slice(0, subtitleIndex));
              subtitleIndex++;
            } else {
              clearInterval(subtitleInterval);
              setShowCursor(false);
            }
          }, 50);
        }, 500);
      }
    }, 100);

    // Auto-redirect after 4 seconds
    const redirectTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        navigate('/home');
      }, 500);
    }, 4000);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(titleInterval);
    };
  }, [navigate]);

  // Cursor blinking effect
  useEffect(() => {
    if (showCursor) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
  }, [showCursor]);

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      {/* Enhanced animated background particles */}
      <div className="particles-container">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      {/* Sophisticated holographic orbs */}
      <div className="mongo-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Advanced neural network energy streams */}
      <div className="neural-lines">
        <div className="line line-1"></div>
        <div className="line line-2"></div>
        <div className="line line-3"></div>
        <div className="line line-4"></div>
      </div>

      {/* Main content */}
      <div className="splash-content">
        <div className="logo-section">
          <div className="app-icon">
            <span className="icon-cinema">🎬</span>
            <span className="icon-ai">🤖</span>
          </div>
          
          <h1 className="app-title">
            {titleText}
            <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
          </h1>
          
          <p className="app-subtitle">
            {subtitleText}
            {subtitleText === fullSubtitle ? '' : (
              <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
            )}
          </p>
        </div>

        {/* Premium loading animation */}
        <div className="loading-section">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p className="loading-text">Initializing AI Engine...</p>
        </div>
      </div>

      {/* Premium tech showcase */}
      <div className="bottom-section">
        <div className="tech-stack">
          <span className="tech-item">MongoDB Atlas</span>
          <span className="tech-divider">•</span>
          <span className="tech-item">Vector Search</span>
          <span className="tech-divider">•</span>
          <span className="tech-item">Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
