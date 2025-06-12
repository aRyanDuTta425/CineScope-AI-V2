import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDesignSystem, getThemeStyles } from '../context/DesignSystem';
import '../styles/MovieTimelineEnhanced.css';

const MovieTimelineEnhanced = ({ movies = [], onMovieClick }) => {
  const { theme } = useTheme();
  const designSystem = useDesignSystem();
  const [selectedDecade, setSelectedDecade] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Group movies by decade
  const moviesByDecade = useMemo(() => {
    const grouped = {};
    movies.forEach(movie => {
      const year = parseInt(movie.year) || 0;
      const decade = Math.floor(year / 10) * 10;
      if (!grouped[decade]) {
        grouped[decade] = [];
      }
      grouped[decade].push(movie);
    });
    
    // Sort decades and movies within each decade
    Object.keys(grouped).forEach(decade => {
      grouped[decade].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    });
    
    return grouped;
  }, [movies]);

  const decades = Object.keys(moviesByDecade)
    .map(d => parseInt(d))
    .filter(d => d > 0)
    .sort((a, b) => b - a);

  const handleDecadeClick = (decade) => {
    setSelectedDecade(selectedDecade === decade ? null : decade);
    setAnimationKey(prev => prev + 1);
  };

  const getDecadeStats = (decade) => {
    const movies = moviesByDecade[decade] || [];
    const avgRating = movies.reduce((sum, movie) => sum + (movie.imdb?.rating || 0), 0) / movies.length;
    const genres = [...new Set(movies.flatMap(movie => movie.genres || []))];
    
    return {
      count: movies.length,
      avgRating: avgRating.toFixed(1),
      topGenres: genres.slice(0, 3)
    };
  };

  const themeColors = getThemeStyles(theme, 'colors');

  return (
    <div className="timeline-container" style={{ 
      backgroundColor: themeColors.background,
      color: themeColors.text 
    }}>
      {/* Timeline Header */}
      <div className="timeline-header">
        <h2 className="timeline-title">Movie Timeline</h2>
        <p className="timeline-subtitle">
          Explore {movies.length} movies across different decades
        </p>
      </div>

      {/* Timeline */}
      <div className="timeline-wrapper">
        <div className="timeline-line"></div>
        
        {decades.map((decade, index) => {
          const stats = getDecadeStats(decade);
          const isSelected = selectedDecade === decade;
          
          return (
            <div
              key={decade}
              className={`timeline-decade ${isSelected ? 'selected' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                '--primary-color': themeColors.primary,
                '--surface-color': themeColors.surface,
                '--text-color': themeColors.text,
                '--border-color': themeColors.border
              }}
            >
              {/* Decade Marker */}
              <div 
                className="decade-marker"
                onClick={() => handleDecadeClick(decade)}
                style={{
                  backgroundColor: themeColors.primary,
                  borderColor: themeColors.border
                }}
              >
                <span className="decade-year">{decade}s</span>
                <div className="decade-stats">
                  <span className="movie-count">{stats.count} movies</span>
                  <span className="avg-rating">⭐ {stats.avgRating}</span>
                </div>
              </div>

              {/* Movies Grid */}
              {isSelected && (
                <div 
                  key={animationKey}
                  className="movies-grid"
                  style={{ backgroundColor: themeColors.surface }}
                >
                  <div className="decade-info">
                    <h3>{decade}s Cinema</h3>
                    <div className="genre-tags">
                      {stats.topGenres.map(genre => (
                        <span 
                          key={genre} 
                          className="genre-tag"
                          style={{ 
                            backgroundColor: themeColors.accent + '20',
                            color: themeColors.accent 
                          }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="decade-movies">
                    {moviesByDecade[decade].map((movie, movieIndex) => (
                      <div
                        key={movie._id || movieIndex}
                        className="timeline-movie-card"
                        onClick={() => onMovieClick?.(movie)}
                        style={{ 
                          animationDelay: `${movieIndex * 0.05}s`,
                          backgroundColor: themeColors.background,
                          borderColor: themeColors.border
                        }}
                      >
                        <div className="movie-poster">
                          {movie.poster ? (
                            <img 
                              src={movie.poster} 
                              alt={movie.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="poster-placeholder"
                            style={{ 
                              backgroundColor: themeColors.secondary,
                              color: themeColors.textMuted 
                            }}
                          >
                            🎬
                          </div>
                        </div>
                        
                        <div className="movie-info">
                          <h4 className="movie-title">{movie.title}</h4>
                          <div className="movie-meta">
                            <span className="movie-year">{movie.year}</span>
                            {movie.imdb?.rating && (
                              <span className="movie-rating">
                                ⭐ {movie.imdb.rating}
                              </span>
                            )}
                          </div>
                          {movie.genres && (
                            <div className="movie-genres">
                              {movie.genres.slice(0, 2).map(genre => (
                                <span 
                                  key={genre} 
                                  className="mini-genre-tag"
                                  style={{ 
                                    backgroundColor: themeColors.primary + '15',
                                    color: themeColors.primary 
                                  }}
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No movies state */}
      {decades.length === 0 && (
        <div className="empty-timeline">
          <div className="empty-icon">📽️</div>
          <h3>No movies to display</h3>
          <p>Search for movies to see them organized by decade</p>
        </div>
      )}
    </div>
  );
};

export default MovieTimelineEnhanced;
