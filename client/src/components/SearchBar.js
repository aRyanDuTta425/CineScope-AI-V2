import React, { useState } from 'react';
import { InlineSpinner } from './LoadingSpinner';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const [useVector, setUseVector] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), useVector);
    }
  };

  return (
    <div className="search-container">
      <h2 className="search-title">🎬 Discover Movies with AI</h2>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className={`search-input-wrapper ${isFocused ? 'focused' : ''} ${loading ? 'loading' : ''}`}>
          <div className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask about movies... (e.g., 'movies like The Matrix')"
            className="search-input"
          />
          {loading && (
            <div className="search-spinner">
              <InlineSpinner size="medium" />
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="search-button"
        >
          {loading ? (
            <>
              <InlineSpinner size="small" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      <div className="search-options">
        <label className="search-toggle">
          <input
            type="checkbox"
            checked={useVector}
            onChange={(e) => setUseVector(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          Use AI Vector Search (recommended)
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
