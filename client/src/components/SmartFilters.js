import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getThemeStyles } from '../context/DesignSystem';
import '../styles/SmartFilters.css';

const SmartFilters = ({ 
  onFiltersChange, 
  availableGenres = [], 
  availableYears = [],
  isVisible = true,
  movies = []
}) => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState({
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    selectedGenres: [],
    sortBy: 'relevance',
    runtimeRange: [0, 300],
    searchInPlot: false
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Calculate min/max years from available data
  const yearBounds = React.useMemo(() => {
    if (movies.length === 0) return [1900, new Date().getFullYear()];
    
    const years = movies.map(m => parseInt(m.year)).filter(y => !isNaN(y));
    return [Math.min(...years, 1900), Math.max(...years, new Date().getFullYear())];
  }, [movies]);

  // Update filters when bounds change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      yearRange: [yearBounds[0], yearBounds[1]]
    }));
  }, [yearBounds]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.yearRange[0] > yearBounds[0] || filters.yearRange[1] < yearBounds[1]) count++;
    if (filters.ratingRange[0] > 0 || filters.ratingRange[1] < 10) count++;
    if (filters.selectedGenres.length > 0) count++;
    if (filters.runtimeRange[0] > 0 || filters.runtimeRange[1] < 300) count++;
    if (filters.searchInPlot) count++;
    if (filters.sortBy !== 'relevance') count++;
    
    setActiveFilterCount(count);
  }, [filters, yearBounds]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  const handleYearChange = (index, value) => {
    const newYearRange = [...filters.yearRange];
    newYearRange[index] = parseInt(value);
    if (index === 0) {
      newYearRange[0] = Math.min(newYearRange[0], newYearRange[1]);
    } else {
      newYearRange[1] = Math.max(newYearRange[0], newYearRange[1]);
    }
    handleFiltersChange({ ...filters, yearRange: newYearRange });
  };

  const handleRatingChange = (index, value) => {
    const newRatingRange = [...filters.ratingRange];
    newRatingRange[index] = parseFloat(value);
    if (index === 0) {
      newRatingRange[0] = Math.min(newRatingRange[0], newRatingRange[1]);
    } else {
      newRatingRange[1] = Math.max(newRatingRange[0], newRatingRange[1]);
    }
    handleFiltersChange({ ...filters, ratingRange: newRatingRange });
  };

  const handleRuntimeChange = (index, value) => {
    const newRuntimeRange = [...filters.runtimeRange];
    newRuntimeRange[index] = parseInt(value);
    if (index === 0) {
      newRuntimeRange[0] = Math.min(newRuntimeRange[0], newRuntimeRange[1]);
    } else {
      newRuntimeRange[1] = Math.max(newRuntimeRange[0], newRuntimeRange[1]);
    }
    handleFiltersChange({ ...filters, runtimeRange: newRuntimeRange });
  };

  const handleGenreToggle = (genre) => {
    const newSelectedGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter(g => g !== genre)
      : [...filters.selectedGenres, genre];
    
    handleFiltersChange({ ...filters, selectedGenres: newSelectedGenres });
  };

  const clearAllFilters = () => {
    const resetFilters = {
      yearRange: [yearBounds[0], yearBounds[1]],
      ratingRange: [0, 10],
      selectedGenres: [],
      sortBy: 'relevance',
      runtimeRange: [0, 300],
      searchInPlot: false
    };
    handleFiltersChange(resetFilters);
  };

  const themeColors = getThemeStyles(theme, 'colors');

  if (!isVisible) return null;

  return (
    <div 
      className={`smart-filters ${isExpanded ? 'expanded' : ''}`}
      style={{ 
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
        color: themeColors.text
      }}
    >
      {/* Filter Header */}
      <div className="filters-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filters-title">
          <span className="filter-icon">🎛️</span>
          <h3>Smart Filters</h3>
          {activeFilterCount > 0 && (
            <span 
              className="active-count"
              style={{ 
                backgroundColor: themeColors.primary,
                color: 'white'
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        <button 
          className="toggle-button"
          style={{ color: themeColors.textMuted }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`filters-content ${isExpanded ? 'show' : ''}`}>
        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="clear-all-btn"
            onClick={clearAllFilters}
            disabled={activeFilterCount === 0}
            style={{ 
              backgroundColor: activeFilterCount > 0 ? themeColors.error : themeColors.secondary,
              color: activeFilterCount > 0 ? 'white' : themeColors.textMuted
            }}
          >
            Clear All ({activeFilterCount})
          </button>
        </div>

        {/* Year Range Slider */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">📅</span>
            Release Year
          </label>
          <div className="range-slider">
            <div className="range-inputs">
              <input
                type="range"
                min={yearBounds[0]}
                max={yearBounds[1]}
                value={filters.yearRange[0]}
                onChange={(e) => handleYearChange(0, e.target.value)}
                className="range-input range-min"
                style={{ '--primary-color': themeColors.primary }}
              />
              <input
                type="range"
                min={yearBounds[0]}
                max={yearBounds[1]}
                value={filters.yearRange[1]}
                onChange={(e) => handleYearChange(1, e.target.value)}
                className="range-input range-max"
                style={{ '--primary-color': themeColors.primary }}
              />
            </div>
            <div className="range-labels">
              <span>{filters.yearRange[0]}</span>
              <span>{filters.yearRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Rating Range */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">⭐</span>
            IMDB Rating
          </label>
          <div className="range-slider">
            <div className="range-inputs">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratingRange[0]}
                onChange={(e) => handleRatingChange(0, e.target.value)}
                className="range-input range-min"
                style={{ '--primary-color': themeColors.primary }}
              />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratingRange[1]}
                onChange={(e) => handleRatingChange(1, e.target.value)}
                className="range-input range-max"
                style={{ '--primary-color': themeColors.primary }}
              />
            </div>
            <div className="range-labels">
              <span>{filters.ratingRange[0]}</span>
              <span>{filters.ratingRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Runtime Range */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">⏱️</span>
            Runtime (minutes)
          </label>
          <div className="range-slider">
            <div className="range-inputs">
              <input
                type="range"
                min="0"
                max="300"
                value={filters.runtimeRange[0]}
                onChange={(e) => handleRuntimeChange(0, e.target.value)}
                className="range-input range-min"
                style={{ '--primary-color': themeColors.primary }}
              />
              <input
                type="range"
                min="0"
                max="300"
                value={filters.runtimeRange[1]}
                onChange={(e) => handleRuntimeChange(1, e.target.value)}
                className="range-input range-max"
                style={{ '--primary-color': themeColors.primary }}
              />
            </div>
            <div className="range-labels">
              <span>{filters.runtimeRange[0]}min</span>
              <span>{filters.runtimeRange[1]}min</span>
            </div>
          </div>
        </div>

        {/* Genre Multi-Select */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">🎭</span>
            Genres ({filters.selectedGenres.length} selected)
          </label>
          <div className="genre-grid">
            {availableGenres.map(genre => (
              <button
                key={genre}
                className={`genre-chip ${filters.selectedGenres.includes(genre) ? 'selected' : ''}`}
                onClick={() => handleGenreToggle(genre)}
                style={{
                  backgroundColor: filters.selectedGenres.includes(genre) 
                    ? themeColors.primary 
                    : themeColors.secondary,
                  color: filters.selectedGenres.includes(genre) 
                    ? 'white' 
                    : themeColors.text,
                  borderColor: themeColors.border
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">📊</span>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
            className="sort-select"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="year">Year (Newest First)</option>
            <option value="rating">Rating (Highest First)</option>
            <option value="title">Title (A-Z)</option>
            <option value="runtime">Runtime</option>
          </select>
        </div>

        {/* Advanced Options */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">⚙️</span>
            Advanced Options
          </label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.searchInPlot}
                onChange={(e) => handleFiltersChange({ 
                  ...filters, 
                  searchInPlot: e.target.checked 
                })}
                style={{ accentColor: themeColors.primary }}
              />
              <span>Include plot in search</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFilters;
