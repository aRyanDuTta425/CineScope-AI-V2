import React, { useState, useEffect } from 'react';
import '../styles/MovieTimeline.css';

const MovieTimeline = ({ movies = [], loading = false }) => {
  const [groupedMovies, setGroupedMovies] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);
  const [viewMode, setViewMode] = useState('decade'); // decade, year, all

  useEffect(() => {
    if (movies.length > 0) {
      groupMoviesByYear(movies);
    }
  }, [movies]);

  const groupMoviesByYear = (movieList) => {
    const grouped = {};
    
    movieList.forEach(movie => {
      const year = movie.year || 'Unknown';
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(movie);
    });

    // Sort years in descending order
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        return parseInt(b) - parseInt(a);
      })
      .forEach(year => {
        sortedGrouped[year] = grouped[year];
      });

    setGroupedMovies(sortedGrouped);
  };

  const getDecadeGroups = () => {
    const decades = {};
    Object.keys(groupedMovies).forEach(year => {
      if (year === 'Unknown') {
        decades['Unknown'] = (decades['Unknown'] || []).concat(groupedMovies[year]);
        return;
      }
      
      const decade = Math.floor(parseInt(year) / 10) * 10;
      const decadeKey = `${decade}s`;
      
      if (!decades[decadeKey]) {
        decades[decadeKey] = [];
      }
      decades[decadeKey] = decades[decadeKey].concat(groupedMovies[year]);
    });

    return decades;
  };

  const getYearRange = () => {
    const years = Object.keys(groupedMovies).filter(year => year !== 'Unknown');
    if (years.length === 0) return { min: 2020, max: 2024 };
    
    const numericYears = years.map(year => parseInt(year));
    return {
      min: Math.min(...numericYears),
      max: Math.max(...numericYears)
    };
  };

  const handleYearClick = (year) => {
    setSelectedYear(selectedYear === year ? null : year);
  };

  const formatMovieCount = (count) => {
    return `${count} movie${count !== 1 ? 's' : ''}`;
  };

  const getMoviesByViewMode = () => {
    switch (viewMode) {
      case 'decade':
        return getDecadeGroups();
      case 'year':
        return groupedMovies;
      default:
        return { 'All Movies': movies };
    }
  };

  if (loading) {
    return (
      <div className="timeline-container">
        <div className="timeline-loading">
          <div className="timeline-skeleton">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="timeline-skeleton-item">
                <div className="skeleton-year"></div>
                <div className="skeleton-movies">
                  {[...Array(3)].map((_, movieIndex) => (
                    <div key={movieIndex} className="skeleton-movie"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-empty">
          <h3>📅 No Movies for Timeline</h3>
          <p>Search for movies to see them organized in a timeline view</p>
        </div>
      </div>
    );
  }

  const displayData = getMoviesByViewMode();
  const yearRange = getYearRange();

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="timeline-title">
          <h2>🎬 Movie Timeline</h2>
          <p>
            Explore {movies.length} movies from {yearRange.min} to {yearRange.max}
          </p>
        </div>
        
        <div className="timeline-controls">
          <button
            className={`timeline-view-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            All
          </button>
          <button
            className={`timeline-view-btn ${viewMode === 'decade' ? 'active' : ''}`}
            onClick={() => setViewMode('decade')}
          >
            Decades
          </button>
          <button
            className={`timeline-view-btn ${viewMode === 'year' ? 'active' : ''}`}
            onClick={() => setViewMode('year')}
          >
            Years
          </button>
        </div>
      </div>

      <div className="timeline-content">
        <div className="timeline-scroll">
          {Object.entries(displayData).map(([period, periodMovies], index) => (
            <div 
              key={period} 
              className={`timeline-period ${selectedYear === period ? 'expanded' : ''}`}
              style={{ '--period-index': index }}
            >
              <div 
                className="timeline-period-header"
                onClick={() => handleYearClick(period)}
              >
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  <div className="timeline-line"></div>
                </div>
                
                <div className="timeline-period-info">
                  <h3 className="timeline-period-title">{period}</h3>
                  <p className="timeline-period-count">
                    {formatMovieCount(periodMovies.length)}
                  </p>
                  
                  {viewMode === 'decade' && (
                    <div className="timeline-period-preview">
                      {periodMovies.slice(0, 3).map((movie, movieIndex) => (
                        <span key={movieIndex} className="preview-movie">
                          {movie.title}
                        </span>
                      ))}
                      {periodMovies.length > 3 && (
                        <span className="preview-more">
                          +{periodMovies.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="timeline-expand-icon">
                  <span className={selectedYear === period ? 'expanded' : ''}>
                    ↓
                  </span>
                </div>
              </div>

              <div className="timeline-movies-container">
                <div className="timeline-movies">
                  {periodMovies.map((movie, movieIndex) => (
                    <div 
                      key={movie._id || movieIndex}
                      className="timeline-movie-card"
                      style={{ '--movie-index': movieIndex }}
                    >
                      <div className="timeline-movie-poster">
                        {movie.poster && movie.poster !== 'N/A' ? (
                          <img 
                            src={movie.poster} 
                            alt={`${movie.title} poster`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="timeline-movie-placeholder"
                          style={{ display: movie.poster && movie.poster !== 'N/A' ? 'none' : 'flex' }}
                        >
                          🎬
                        </div>
                        
                        {movie.imdb?.rating && (
                          <div className="timeline-movie-rating">
                            ⭐ {movie.imdb.rating}
                          </div>
                        )}
                      </div>
                      
                      <div className="timeline-movie-info">
                        <h4 className="timeline-movie-title">{movie.title}</h4>
                        {movie.year && (
                          <p className="timeline-movie-year">{movie.year}</p>
                        )}
                        {movie.genres && movie.genres.length > 0 && (
                          <div className="timeline-movie-genres">
                            {movie.genres.slice(0, 2).map((genre, genreIndex) => (
                              <span key={genreIndex} className="timeline-genre-tag">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieTimeline;
