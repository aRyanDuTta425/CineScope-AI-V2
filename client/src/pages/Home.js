import React, { useState, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import { MoviesGrid } from '../components/MovieCard';
import MovieTimeline from '../components/MovieTimeline';
import MovieFilters from '../components/MovieFilters';
import { movieAPI } from '../services/api';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, timeline
  const [filters, setFilters] = useState(null);
  const [availableGenres, setAvailableGenres] = useState([]);

  const handleSearch = async (query, useVector) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    setInsights('');

    try {
      const response = await movieAPI.search(query, useVector);
      
      if (response.success) {
        setMovies(response.movies);
        setFilteredMovies(response.movies);
        
        // Extract available genres
        const genres = [...new Set(response.movies.flatMap(movie => movie.genres || []))];
        setAvailableGenres(genres.sort());
        
        // Generate insights if movies found
        if (response.movies.length > 0) {
          generateInsights(response.movies);
        }
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Search failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverSimilar = async (movie) => {
    if (!movie.title) return;
    
    setLoading(true);
    setError(null);
    setSearchQuery(`Similar to "${movie.title}"`);
    setInsights('');

    try {
      // First try using the new similar API endpoint
      let response;
      try {
        response = await movieAPI.findSimilar(movie);
      } catch (err) {
        // Fallback to text search if vector search fails
        console.log('Vector search failed, using text fallback');
        response = await movieAPI.search(`movies like ${movie.title}`, true);
      }
      
      if (response.success) {
        setMovies(response.movies);
        setFilteredMovies(response.movies);
        
        // Extract available genres
        const genres = [...new Set(response.movies.flatMap(m => m.genres || []))];
        setAvailableGenres(genres.sort());
        
        // Generate insights if movies found
        if (response.movies.length > 0) {
          generateInsights(response.movies);
        }
      } else {
        setError('Failed to find similar movies. Please try again.');
      }
    } catch (err) {
      console.error('Similar movies error:', err);
      setError(err.response?.data?.message || 'Failed to find similar movies. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    if (!movies.length) return;
    
    let filtered = [...movies];
    
    // Filter by year range
    if (newFilters.yearRange) {
      filtered = filtered.filter(movie => {
        const year = parseInt(movie.year);
        return year >= newFilters.yearRange[0] && year <= newFilters.yearRange[1];
      });
    }
    
    // Filter by rating range
    if (newFilters.ratingRange && (newFilters.ratingRange[0] > 0 || newFilters.ratingRange[1] < 10)) {
      filtered = filtered.filter(movie => {
        const rating = movie.imdb?.rating || 0;
        return rating >= newFilters.ratingRange[0] && rating <= newFilters.ratingRange[1];
      });
    }
    
    // Filter by selected genres
    if (newFilters.selectedGenres?.length > 0) {
      filtered = filtered.filter(movie => {
        const movieGenres = movie.genres || [];
        return newFilters.selectedGenres.some(genre => movieGenres.includes(genre));
      });
    }
    
    // Sort by selected criteria
    if (newFilters.sortBy) {
      filtered.sort((a, b) => {
        switch (newFilters.sortBy) {
          case 'year':
            return (b.year || 0) - (a.year || 0);
          case 'rating':
            return (b.imdb?.rating || 0) - (a.imdb?.rating || 0);
          case 'title':
            return (a.title || '').localeCompare(b.title || '');
          default:
            return 0; // relevance - keep original order
        }
      });
    }
    
    setFilteredMovies(filtered);
  }, [movies]);

  const generateInsights = async (moviesList) => {
    setInsightsLoading(true);
    try {
      const response = await movieAPI.getInsights(moviesList);
      if (response.success) {
        setInsights(response.insight);
      }
    } catch (err) {
      console.error('Insights error:', err);
      // Don't show error for insights as it's not critical
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="container">
      <SearchBar onSearch={handleSearch} loading={loading} />
      
      {searchQuery && (
        <div className="search-results fade-in">
          {insights && (
            <div className="card bounce-in" style={{ marginBottom: '2rem', '--stagger-delay': '1' }}>
              <h3 style={{ marginBottom: '1rem' }} className="gradient-text">
                🤖 AI Insights
              </h3>
              {insightsLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Generating insights...</span>
                </div>
              ) : (
                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{insights}</p>
              )}
            </div>
          )}

          {/* View Controls and Filters */}
          {(movies.length > 0 || loading) && (
            <div className="view-controls card" style={{ marginBottom: '2rem' }}>
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <span>📊</span> Grid View
                </button>
                <button 
                  className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                  onClick={() => setViewMode('timeline')}
                >
                  <span>📅</span> Timeline View
                </button>
              </div>
              
              {viewMode === 'grid' && (
                <MovieFilters 
                  onFiltersChange={handleFiltersChange}
                  availableGenres={availableGenres}
                  isVisible={movies.length > 0}
                />
              )}
            </div>
          )}
          
          {/* Results Display */}
          {viewMode === 'grid' ? (
            <MoviesGrid 
              movies={filteredMovies} 
              loading={loading} 
              error={error}
              onDiscoverSimilar={handleDiscoverSimilar}
            />
          ) : (
            <MovieTimeline 
              movies={filteredMovies} 
              loading={loading}
            />
          )}
        </div>
      )}
      
      {!searchQuery && !loading && (
        <div className="welcome-section">
          <div className="card scale-in" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h3 className="gradient-text" style={{ marginBottom: '1rem' }}>
              🎬 Discover Movies with AI
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Use natural language to search for movies. Our AI-powered search understands 
              queries like "movies like The Matrix" or "popular sci-fi films from the 90s".
            </p>
            
            <div className="try-examples">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
                Try these examples:
              </h4>
              <div className="example-queries">
                {[
                  'movies like The Matrix',
                  'popular sci-fi films',
                  'romantic comedies from the 90s',
                  'action movies with high ratings',
                  'thriller films from Christopher Nolan',
                  'animated movies for kids'
                ].map((example, index) => (
                  <button
                    key={index}
                    className="example-query-btn"
                    onClick={() => handleSearch(example, true)}
                    style={{ '--stagger-delay': index }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Powered by MongoDB Atlas Vector Search and Google Gemini AI
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
