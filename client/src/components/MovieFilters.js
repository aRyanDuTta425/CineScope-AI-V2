import React, { useState, useEffect } from 'react';
import '../styles/MovieFilters.css';

const MovieFilters = ({ onFiltersChange, availableGenres = [], isVisible = true }) => {
  const [filters, setFilters] = useState({
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    selectedGenres: [],
    sortBy: 'relevance' // relevance, year, rating, title
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleYearChange = (type, value) => {
    const newYearRange = [...filters.yearRange];
    if (type === 'min') {
      newYearRange[0] = Math.min(parseInt(value), newYearRange[1]);
    } else {
      newYearRange[1] = Math.max(parseInt(value), newYearRange[0]);
    }
    setFilters(prev => ({ ...prev, yearRange: newYearRange }));
  };

  const handleRatingChange = (type, value) => {
    const newRatingRange = [...filters.ratingRange];
    if (type === 'min') {
      newRatingRange[0] = Math.min(parseFloat(value), newRatingRange[1]);
    } else {
      newRatingRange[1] = Math.max(parseFloat(value), newRatingRange[0]);
    }
    setFilters(prev => ({ ...prev, ratingRange: newRatingRange }));
  };

  const handleGenreToggle = (genre) => {
    const newSelectedGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter(g => g !== genre)
      : [...filters.selectedGenres, genre];
    
    setFilters(prev => ({ ...prev, selectedGenres: newSelectedGenres }));
  };

  const clearAllFilters = () => {
    setFilters({
      yearRange: [1900, new Date().getFullYear()],
      ratingRange: [0, 10],
      selectedGenres: [],
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = 
    filters.yearRange[0] !== 1900 || 
    filters.yearRange[1] !== new Date().getFullYear() ||
    filters.ratingRange[0] !== 0 ||
    filters.ratingRange[1] !== 10 ||
    filters.selectedGenres.length > 0 ||
    filters.sortBy !== 'relevance';

  if (!isVisible) return null;

  return (
    <div className={`movie-filters ${isExpanded ? 'expanded' : ''}`}>
      <div className="filters-header">
        <button 
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="filters-icon">🎯</span>
          <span>Smart Filters</span>
          <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
            ↓
          </span>
          {hasActiveFilters && (
            <span className="active-indicator">●</span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearAllFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Year Range Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📅</span>
            Release Year
          </label>
          <div className="range-slider-group">
            <input
              type="range"
              min="1900"
              max={new Date().getFullYear()}
              value={filters.yearRange[0]}
              onChange={(e) => handleYearChange('min', e.target.value)}
              className="range-slider"
              style={{ '--progress': `${((filters.yearRange[0] - 1900) / (new Date().getFullYear() - 1900)) * 100}%` }}
            />
            <input
              type="range"
              min="1900"
              max={new Date().getFullYear()}
              value={filters.yearRange[1]}
              onChange={(e) => handleYearChange('max', e.target.value)}
              className="range-slider"
              style={{ '--progress': `${((filters.yearRange[1] - 1900) / (new Date().getFullYear() - 1900)) * 100}%` }}
            />
            <div className="range-values">
              <span>{filters.yearRange[0]}</span>
              <span>-</span>
              <span>{filters.yearRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Rating Range Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">⭐</span>
            IMDB Rating
          </label>
          <div className="range-slider-group">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={filters.ratingRange[0]}
              onChange={(e) => handleRatingChange('min', e.target.value)}
              className="range-slider"
              style={{ '--progress': `${(filters.ratingRange[0] / 10) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={filters.ratingRange[1]}
              onChange={(e) => handleRatingChange('max', e.target.value)}
              className="range-slider"
              style={{ '--progress': `${(filters.ratingRange[1] / 10) * 100}%` }}
            />
            <div className="range-values">
              <span>{filters.ratingRange[0]}</span>
              <span>-</span>
              <span>{filters.ratingRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">🎭</span>
            Genres ({filters.selectedGenres.length} selected)
          </label>
          <div className="genre-chips">
            {availableGenres.map((genre, index) => (
              <button
                key={genre}
                className={`genre-chip ${filters.selectedGenres.includes(genre) ? 'selected' : ''}`}
                onClick={() => handleGenreToggle(genre)}
                style={{ '--delay': `${index * 50}ms` }}
              >
                {genre}
                {filters.selectedGenres.includes(genre) && (
                  <span className="chip-checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="filter-icon">📊</span>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="sort-select"
          >
            <option value="relevance">Relevance</option>
            <option value="year">Release Year</option>
            <option value="rating">IMDB Rating</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;
