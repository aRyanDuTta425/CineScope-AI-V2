import React from 'react';
import { ShimmerLoader } from './LoadingSpinner';
import '../styles/MovieCard.css';

const MovieCard = ({ movie, index = 0, onDiscoverSimilar }) => {
  const {
    title,
    year,
    genres = [],
    plot,
    poster,
    imdb = {},
    runtime,
    directors = []
  } = movie;

  const getRatingClass = (rating) => {
    if (rating >= 7) return 'high';
    if (rating >= 5) return 'medium';
    return 'low';
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPosterImage = () => {
    if (poster && poster !== 'N/A' && !poster.includes('nopicture')) {
      return poster;
    }
    return null;
  };

  return (
    <div 
      className="movie-card hover-lift" 
      style={{ '--card-index': index }}
    >
      <div className="movie-poster-container">
        {getPosterImage() ? (
          <img 
            src={getPosterImage()} 
            alt={`${title} poster`}
            className="movie-poster"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="movie-poster-placeholder"
          style={{ display: getPosterImage() ? 'none' : 'flex' }}
        >
          🎬
        </div>
        
        {imdb.rating && (
          <div className={`movie-rating ${getRatingClass(imdb.rating)}`}>
            ⭐ {imdb.rating}
          </div>
        )}
      </div>

      <div className="movie-content">
        <h3 className="movie-title">{title}</h3>
        {year && <div className="movie-year">{year}</div>}
        
        {genres.length > 0 && (
          <div className="movie-genres">
            {genres.slice(0, 3).map((genre, genreIndex) => (
              <span 
                key={genreIndex} 
                className="genre-tag"
                style={{ '--index': genreIndex }}
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {plot && plot !== 'N/A' && (
          <p className="movie-plot">{plot}</p>
        )}

        <div className="movie-meta">
          {runtime && (
            <div className="movie-runtime">
              🕒 {formatRuntime(runtime)}
            </div>
          )}
          
          {directors.length > 0 && (
            <div className="movie-directors">
              Director: {directors[0]}
            </div>
          )}
        </div>

        {onDiscoverSimilar && (
          <div className="movie-actions">
            <button 
              className="discover-similar-btn"
              onClick={() => onDiscoverSimilar(movie)}
              title={`Find movies similar to ${title}`}
            >
              <span className="btn-icon">🎯</span>
              <span className="btn-text">Discover Similar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component to display the movies grid
export const MoviesGrid = ({ movies, loading, error, onDiscoverSimilar }) => {
  if (loading) {
    return <ShimmerLoader />;
  }

  if (error) {
    return (
      <div className="card error-message">
        <h3>Search Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="card no-movies scale-in">
        <h3>No movies found</h3>
        <p>Try searching with different keywords or check your spelling.</p>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <div className="movies-header">
        <div className="movies-count">
          Found {movies.length} movie{movies.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="movies-grid">
        {movies.map((movie, index) => (
          <MovieCard 
            key={movie._id || index} 
            movie={movie} 
            index={index}
            onDiscoverSimilar={onDiscoverSimilar}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieCard;
