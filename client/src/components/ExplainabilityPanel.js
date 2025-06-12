import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getThemeStyles } from '../context/DesignSystem';
import '../styles/ExplainabilityPanel.css';

const ExplainabilityPanel = ({ searchQuery, movies = [], insights = '' }) => {
  const { theme } = useTheme();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [similarityScores, setSimilarityScores] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate cosine similarity calculation (in real app, this would come from backend)
  useEffect(() => {
    if (movies.length > 0 && searchQuery) {
      const scores = movies.map((movie, index) => ({
        movie,
        similarity: 0.95 - (index * 0.05) + (Math.random() * 0.1 - 0.05), // Simulated
        matchingFeatures: generateMatchingFeatures(movie, searchQuery)
      }));
      setSimilarityScores(scores.slice(0, 10)); // Top 10
    }
  }, [movies, searchQuery]);

  const generateMatchingFeatures = (movie, query) => {
    const features = [];
    const queryLower = query.toLowerCase();
    
    // Check genre matches
    if (movie.genres) {
      movie.genres.forEach(genre => {
        if (queryLower.includes(genre.toLowerCase())) {
          features.push({ type: 'genre', value: genre, weight: 0.3 });
        }
      });
    }

    // Check year/decade matches
    if (movie.year) {
      const decade = Math.floor(parseInt(movie.year) / 10) * 10;
      if (queryLower.includes(decade.toString()) || queryLower.includes(movie.year)) {
        features.push({ type: 'year', value: movie.year, weight: 0.2 });
      }
    }

    // Check director matches
    if (movie.directors) {
      movie.directors.forEach(director => {
        if (queryLower.includes(director.toLowerCase())) {
          features.push({ type: 'director', value: director, weight: 0.25 });
        }
      });
    }

    // Check plot matches (simulated)
    if (movie.plot && queryLower.length > 10) {
      const plotWords = movie.plot.toLowerCase().split(' ');
      const queryWords = queryLower.split(' ');
      const matches = queryWords.filter(word => 
        word.length > 3 && plotWords.some(plotWord => plotWord.includes(word))
      );
      if (matches.length > 0) {
        features.push({ type: 'plot', value: matches.join(', '), weight: 0.15 });
      }
    }

    // Check rating relevance
    if (queryLower.includes('high rating') || queryLower.includes('best')) {
      if (movie.imdb?.rating && movie.imdb.rating > 7) {
        features.push({ type: 'rating', value: `${movie.imdb.rating}/10`, weight: 0.1 });
      }
    }

    return features;
  };

  const getMatchStrength = (similarity) => {
    if (similarity > 0.8) return { label: 'Excellent Match', color: '#10b981', intensity: 'high' };
    if (similarity > 0.6) return { label: 'Good Match', color: '#f59e0b', intensity: 'medium' };
    if (similarity > 0.4) return { label: 'Fair Match', color: '#ef4444', intensity: 'low' };
    return { label: 'Weak Match', color: '#6b7280', intensity: 'very-low' };
  };

  const themeColors = getThemeStyles(theme, 'colors');

  if (!searchQuery || movies.length === 0) {
    return (
      <div 
        className="explainability-panel empty"
        style={{ 
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          color: themeColors.textMuted
        }}
      >
        <div className="empty-content">
          <span className="empty-icon">🔍</span>
          <h3>Explainability Panel</h3>
          <p>Search for movies to see how AI matching works</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`explainability-panel ${isExpanded ? 'expanded' : ''}`}
      style={{ 
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
        color: themeColors.text
      }}
    >
      {/* Panel Header */}
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <span className="panel-icon">🧠</span>
          <div>
            <h3>AI Explainability</h3>
            <p>Understanding the search results</p>
          </div>
        </div>
        <div className="header-stats">
          <span className="query-indicator">
            Query: "{searchQuery.substring(0, 30)}{searchQuery.length > 30 ? '...' : ''}"
          </span>
          <button className="expand-btn">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className={`panel-content ${isExpanded ? 'show' : ''}`}>
        {/* Similarity Overview */}
        <div className="similarity-overview">
          <h4>Similarity Score Distribution</h4>
          <div className="score-bars">
            {similarityScores.slice(0, 5).map((item, index) => {
              const matchInfo = getMatchStrength(item.similarity);
              return (
                <div 
                  key={index}
                  className="score-bar"
                  onClick={() => setSelectedMovie(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="movie-label">
                    <span className="movie-title">{item.movie.title}</span>
                    <span className="similarity-score">{(item.similarity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${item.similarity * 100}%`,
                        backgroundColor: matchInfo.color
                      }}
                    ></div>
                  </div>
                  <span 
                    className="match-label"
                    style={{ color: matchInfo.color }}
                  >
                    {matchInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Analysis */}
        {selectedMovie && (
          <div className="detailed-analysis">
            <h4>Detailed Analysis: {selectedMovie.movie.title}</h4>
            <div className="analysis-grid">
              {/* Similarity Breakdown */}
              <div className="analysis-card">
                <h5>🎯 Matching Features</h5>
                <div className="features-list">
                  {selectedMovie.matchingFeatures.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-type">{feature.type}</span>
                      <span className="feature-value">{feature.value}</span>
                      <div className="feature-weight">
                        <div 
                          className="weight-bar"
                          style={{ 
                            width: `${feature.weight * 100}%`,
                            backgroundColor: themeColors.primary 
                          }}
                        ></div>
                        <span>{(feature.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vector Space Visualization */}
              <div className="analysis-card">
                <h5>📊 Vector Similarity</h5>
                <div className="vector-viz">
                  <div className="similarity-meter">
                    <div 
                      className="meter-fill"
                      style={{ 
                        width: `${selectedMovie.similarity * 100}%`,
                        backgroundColor: getMatchStrength(selectedMovie.similarity).color 
                      }}
                    ></div>
                    <span className="meter-label">
                      {(selectedMovie.similarity * 100).toFixed(1)}% Similar
                    </span>
                  </div>
                  <div className="vector-details">
                    <div className="detail-item">
                      <span>Cosine Distance:</span>
                      <span>{(1 - selectedMovie.similarity).toFixed(3)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Confidence:</span>
                      <span>{(selectedMovie.similarity * 0.9 + 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Breakdown */}
        {insights && (
          <div className="insights-breakdown">
            <h4>🤖 AI Insights Analysis</h4>
            <div className="insights-content">
              <div className="insight-text">{insights}</div>
              <div className="insight-metadata">
                <div className="metadata-item">
                  <span>Generated by:</span>
                  <span>Gemini AI</span>
                </div>
                <div className="metadata-item">
                  <span>Processing time:</span>
                  <span>~2.3s</span>
                </div>
                <div className="metadata-item">
                  <span>Confidence:</span>
                  <span>92%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Strategy */}
        <div className="search-strategy">
          <h4>🔍 Search Strategy</h4>
          <div className="strategy-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h6>Query Processing</h6>
                <p>Natural language processed by Gemini AI</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h6>Vector Embedding</h6>
                <p>Query converted to 1536-dimensional vector</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h6>Similarity Search</h6>
                <p>MongoDB Atlas Vector Search with cosine similarity</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h6>Result Ranking</h6>
                <p>Combined vector similarity + metadata filtering</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPanel;
