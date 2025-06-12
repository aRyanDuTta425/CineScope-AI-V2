import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getThemeStyles } from '../context/DesignSystem';
import { movieAPI } from '../services/api';
import '../styles/AIChatInterface.css';

const AIChatInterface = ({ onMoviesFound, onInsightGenerated }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your AI movie assistant. Ask me anything like 'Find movies like Inception but more emotional' or 'Show me sci-fi films from the 80s with high ratings'.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState([
    "Find movies like Inception but more emotional",
    "Show me the best horror movies from the 2010s",
    "Romantic comedies with Tom Hanks",
    "Dark psychological thrillers with twist endings",
    "Feel-good movies for a rainy day",
    "Underrated sci-fi gems"
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Process the message with AI
      const response = await movieAPI.search(inputValue, true);
      
      let assistantMessage;
      
      if (response.success && response.movies.length > 0) {
        // Get AI insights about the results
        const insightResponse = await movieAPI.getInsights(response.movies);
        
        assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: insightResponse.success ? insightResponse.insight : 
            `I found ${response.movies.length} movies matching your request! Here are some highlights...`,
          timestamp: new Date(),
          movies: response.movies.slice(0, 6), // Show top 6 results
          searchQuery: inputValue
        };

        // Pass results to parent components
        onMoviesFound?.(response.movies);
        if (insightResponse.success) {
          onInsightGenerated?.(insightResponse.insight);
        }
      } else {
        assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: "I couldn't find any movies matching that description. Try being more specific or asking about different genres, actors, or time periods.",
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const themeColors = getThemeStyles(theme, 'colors');

  return (
    <div 
      className="ai-chat-interface"
      style={{ 
        backgroundColor: themeColors.background,
        borderColor: themeColors.border 
      }}
    >
      {/* Chat Header */}
      <div 
        className="chat-header"
        style={{ 
          backgroundColor: themeColors.surface,
          borderBottomColor: themeColors.border 
        }}
      >
        <div className="chat-title">
          <span className="ai-icon">🤖</span>
          <div>
            <h3>CineScope AI Assistant</h3>
            <p>Powered by Gemini AI & Vector Search</p>
          </div>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${isLoading ? 'loading' : 'online'}`}></div>
          <span>{isLoading ? 'Thinking...' : 'Online'}</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? '👤' : '🤖'}
            </div>
            <div 
              className="message-content"
              style={{ 
                backgroundColor: message.type === 'user' 
                  ? themeColors.primary 
                  : themeColors.surface,
                color: message.type === 'user' 
                  ? 'white' 
                  : themeColors.text
              }}
            >
              <div className="message-text">
                {message.content}
              </div>
              
              {/* Movie Results Preview */}
              {message.movies && (
                <div className="movie-results-preview">
                  <div className="results-header">
                    <span>🎬 Found {message.movies.length} movies</span>
                    <button 
                      className="view-all-btn"
                      onClick={() => onMoviesFound?.(message.movies)}
                      style={{ color: themeColors.primary }}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="movie-grid">
                    {message.movies.slice(0, 3).map((movie, index) => (
                      <div 
                        key={index} 
                        className="mini-movie-card"
                        style={{ borderColor: themeColors.border }}
                      >
                        <div className="mini-poster">
                          {movie.poster ? (
                            <img src={movie.poster} alt={movie.title} />
                          ) : (
                            <div className="poster-placeholder">🎭</div>
                          )}
                        </div>
                        <div className="mini-info">
                          <h5>{movie.title}</h5>
                          <p>{movie.year} • ⭐ {movie.imdb?.rating || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Message */}
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div 
              className="message-content loading"
              style={{ backgroundColor: themeColors.surface }}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="suggestions-container">
          <p style={{ color: themeColors.textMuted }}>Try these examples:</p>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ 
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div 
        className="input-area"
        style={{ 
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border 
        }}
      >
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about movies... (e.g., 'Find sci-fi movies like Blade Runner')"
            className="chat-input"
            style={{ 
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={handleSend}
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
            style={{ 
              backgroundColor: inputValue.trim() ? themeColors.primary : themeColors.secondary,
              color: inputValue.trim() ? 'white' : themeColors.textMuted
            }}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
        <div className="input-footer">
          <span style={{ color: themeColors.textMuted }}>
            AI-powered by Gemini • Press Enter to send
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
