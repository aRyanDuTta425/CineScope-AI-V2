import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import { MoviesGrid } from '../components/MovieCard';
import MovieTimelineEnhanced from '../components/MovieTimelineEnhanced';
import SmartFilters from '../components/SmartFilters';
import AIChatInterface from '../components/AIChatInterface';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import EmbeddingsPlayground from '../components/EmbeddingsPlayground';
import GraphVisualization from '../components/GraphVisualization';
import DatasetSwitcher from '../components/DatasetSwitcher';
import { GenreDistributionChart, TopTalentChart, YearGenreHeatmap } from '../components/Charts/EnhancedCharts';
import { DesignSystemProvider } from '../context/DesignSystem';
import { useTheme } from '../context/ThemeContext';
import { getThemeStyles } from '../context/DesignSystem';
import { datasetRegistry, DatasetUIConfig } from '../utils/DatasetAdapter';
import { movieAPI } from '../services/api';
import '../styles/EnhancedHome.css';

const EnhancedHome = () => {
  const { theme } = useTheme();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, timeline, chat, analytics
  const [availableGenres, setAvailableGenres] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('search');
  const [currentDataset, setCurrentDataset] = useState('movies');
  const [datasetUIConfig, setDatasetUIConfig] = useState(DatasetUIConfig.movies);
  const [selectedMovieForGraph, setSelectedMovieForGraph] = useState(null);

  // Handle dataset changes
  const handleDatasetChange = useCallback((datasetType, uiConfig) => {
    setCurrentDataset(datasetType);
    setDatasetUIConfig(uiConfig);
    
    // Clear current results when switching datasets
    setMovies([]);
    setFilteredMovies([]);
    setSearchQuery('');
    setInsights('');
    setAvailableGenres([]);
    
    console.log(`Switched to dataset: ${datasetType}`);
  }, []);

  // Handle graph node clicks
  const handleGraphNodeClick = useCallback((movie) => {
    setSelectedMovieForGraph(movie);
    
    // Optionally trigger a new search based on the clicked movie
    if (movie.title) {
      handleSearch(`Movies similar to ${movie.title}`, true);
    }
  }, []);

  const handleSearch = useCallback(async (query, useVector) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    setInsights('');
    setActiveSection('search');

    try {
      const response = await movieAPI.search(query, useVector);
      
      if (response.success) {
        // Transform data using the active dataset adapter
        let transformedMovies = response.movies;
        try {
          transformedMovies = datasetRegistry.transform(response.movies);
        } catch (error) {
          console.warn('Failed to transform data with dataset adapter:', error);
          transformedMovies = response.movies; // Fallback to original data
        }
        
        setMovies(transformedMovies);
        setFilteredMovies(transformedMovies);
        
        // Extract available genres
        const genres = [...new Set(transformedMovies.flatMap(movie => movie.genres || []))];
        setAvailableGenres(genres.sort());
        
        // Generate insights if movies found
        if (transformedMovies.length > 0) {
          generateInsights(transformedMovies);
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
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    if (!movies.length) return;
    
    let filtered = [...movies];
    
    // Apply all filters
    if (newFilters.yearRange) {
      filtered = filtered.filter(movie => {
        const year = parseInt(movie.year);
        return year >= newFilters.yearRange[0] && year <= newFilters.yearRange[1];
      });
    }
    
    if (newFilters.ratingRange && (newFilters.ratingRange[0] > 0 || newFilters.ratingRange[1] < 10)) {
      filtered = filtered.filter(movie => {
        const rating = movie.imdb?.rating || 0;
        return rating >= newFilters.ratingRange[0] && rating <= newFilters.ratingRange[1];
      });
    }
    
    if (newFilters.selectedGenres?.length > 0) {
      filtered = filtered.filter(movie => {
        const movieGenres = movie.genres || [];
        return newFilters.selectedGenres.some(genre => movieGenres.includes(genre));
      });
    }

    if (newFilters.runtimeRange && (newFilters.runtimeRange[0] > 0 || newFilters.runtimeRange[1] < 300)) {
      filtered = filtered.filter(movie => {
        const runtime = parseInt(movie.runtime) || 0;
        return runtime >= newFilters.runtimeRange[0] && runtime <= newFilters.runtimeRange[1];
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
          case 'runtime':
            return (parseInt(b.runtime) || 0) - (parseInt(a.runtime) || 0);
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
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleChatMoviesFound = useCallback((chatMovies) => {
    setMovies(chatMovies);
    setFilteredMovies(chatMovies);
    
    const genres = [...new Set(chatMovies.flatMap(movie => movie.genres || []))];
    setAvailableGenres(genres.sort());
    
    setViewMode('grid');
    setActiveSection('search');
  }, []);

  const handleChatInsightGenerated = useCallback((insight) => {
    setInsights(insight);
  }, []);

  const themeColors = getThemeStyles(theme, 'colors');

  return (
    <DesignSystemProvider>
      <div 
        className="enhanced-home"
        style={{ 
          backgroundColor: themeColors.background,
          color: themeColors.text 
        }}
      >
        {/* Sidebar Navigation */}
        <div 
          className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
          style={{ 
            backgroundColor: themeColors.surface,
            borderRightColor: themeColors.border 
          }}
        >
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">🎬</span>
              {!sidebarCollapsed && <span className="logo-text">CineScope AI</span>}
            </div>
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ color: themeColors.textMuted }}
            >
              {sidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
              onClick={() => setActiveSection('search')}
              style={{ 
                backgroundColor: activeSection === 'search' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'search' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">🔍</span>
              {!sidebarCollapsed && <span>Search</span>}
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveSection('chat')}
              style={{ 
                backgroundColor: activeSection === 'chat' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'chat' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">💬</span>
              {!sidebarCollapsed && <span>AI Chat</span>}
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
              style={{ 
                backgroundColor: activeSection === 'analytics' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'analytics' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">📊</span>
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'playground' ? 'active' : ''}`}
              onClick={() => setActiveSection('playground')}
              style={{ 
                backgroundColor: activeSection === 'playground' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'playground' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">🧪</span>
              {!sidebarCollapsed && <span>Playground</span>}
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveSection('graph')}
              style={{ 
                backgroundColor: activeSection === 'graph' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'graph' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">🕸️</span>
              {!sidebarCollapsed && <span>Graph</span>}
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'datasets' ? 'active' : ''}`}
              onClick={() => setActiveSection('datasets')}
              style={{ 
                backgroundColor: activeSection === 'datasets' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'datasets' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">🔄</span>
              {!sidebarCollapsed && <span>Datasets</span>}
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'explainability' ? 'active' : ''}`}
              onClick={() => setActiveSection('explainability')}
              style={{ 
                backgroundColor: activeSection === 'explainability' ? themeColors.primary + '20' : 'transparent',
                color: activeSection === 'explainability' ? themeColors.primary : themeColors.text
              }}
            >
              <span className="nav-icon">🧠</span>
              {!sidebarCollapsed && <span>AI Insights</span>}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Search Section */}
          {activeSection === 'search' && (
            <div className="section search-section">
              <div className="section-header">
                <div>
                  <h1>Discover Movies with AI</h1>
                  <p>Search using natural language and explore with intelligent filters</p>
                </div>
                <div className="view-controls">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    style={{ 
                      backgroundColor: viewMode === 'grid' ? themeColors.primary : themeColors.surface,
                      color: viewMode === 'grid' ? 'white' : themeColors.text
                    }}
                  >
                    📱 Grid
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                    onClick={() => setViewMode('timeline')}
                    style={{ 
                      backgroundColor: viewMode === 'timeline' ? themeColors.primary : themeColors.surface,
                      color: viewMode === 'timeline' ? 'white' : themeColors.text
                    }}
                  >
                    📅 Timeline
                  </button>
                </div>
              </div>

              <SearchBar onSearch={handleSearch} />
              
              {(movies.length > 0 || loading) && (
                <SmartFilters
                  onFiltersChange={handleFiltersChange}
                  availableGenres={availableGenres}
                  movies={movies}
                  isVisible={true}
                />
              )}

              {error && (
                <div className="error-message" style={{ backgroundColor: themeColors.error + '20', color: themeColors.error }}>
                  {error}
                </div>
              )}

              {viewMode === 'grid' && (
                <MoviesGrid 
                  movies={filteredMovies} 
                  loading={loading} 
                  searchQuery={searchQuery}
                />
              )}

              {viewMode === 'timeline' && (
                <MovieTimelineEnhanced
                  movies={filteredMovies}
                  onMovieClick={(movie) => console.log('Movie clicked:', movie)}
                />
              )}

              {insights && (
                <div 
                  className="insights-card"
                  style={{ 
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border 
                  }}
                >
                  <h3>🤖 AI Insights</h3>
                  <p>{insights}</p>
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          {activeSection === 'chat' && (
            <div className="section chat-section">
              <div className="section-header">
                <h1>AI Movie Assistant</h1>
                <p>Chat with AI to discover movies using natural language</p>
              </div>
              <AIChatInterface
                onMoviesFound={handleChatMoviesFound}
                onInsightGenerated={handleChatInsightGenerated}
              />
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="section analytics-section">
              <div className="section-header">
                <h1>Movie Analytics</h1>
                <p>Visual insights from your search results</p>
              </div>
              
              {movies.length > 0 ? (
                <div className="charts-grid">
                  <GenreDistributionChart movies={filteredMovies} />
                  <TopTalentChart movies={filteredMovies} type="directors" />
                  <TopTalentChart movies={filteredMovies} type="actors" />
                  <YearGenreHeatmap movies={filteredMovies} />
                </div>
              ) : (
                <div className="empty-analytics">
                  <span className="empty-icon">📊</span>
                  <h3>No Data Available</h3>
                  <p>Search for movies to see analytics and visualizations</p>
                </div>
              )}
            </div>
          )}

          {/* Explainability Section */}
          {activeSection === 'explainability' && (
            <div className="section explainability-section">
              <div className="section-header">
                <h1>AI Explainability</h1>
                <p>Understand how AI processes and ranks your search results</p>
              </div>
              <ExplainabilityPanel
                searchQuery={searchQuery}
                movies={filteredMovies}
                insights={insights}
              />
            </div>
          )}

          {/* Embeddings Playground Section */}
          {activeSection === 'playground' && (
            <div className="section playground-section">
              <div className="section-header">
                <h1>Embeddings Playground</h1>
                <p>Explore vector similarities and cosine distances between movies</p>
              </div>
              <EmbeddingsPlayground />
            </div>
          )}

          {/* Graph Visualization Section */}
          {activeSection === 'graph' && (
            <div className="section graph-section">
              <div className="section-header">
                <h1>Movie Network Graph</h1>
                <p>Interactive network view of movies, genres, directors, and actors</p>
              </div>
              {movies.length > 0 ? (
                <GraphVisualization 
                  movies={filteredMovies} 
                  onNodeClick={handleGraphNodeClick}
                />
              ) : (
                <div className="empty-graph">
                  <span className="empty-icon">🕸️</span>
                  <h3>No Graph Data Available</h3>
                  <p>Search for movies to see the interactive network graph</p>
                </div>
              )}
            </div>
          )}

          {/* Dataset Management Section */}
          {activeSection === 'datasets' && (
            <div className="section datasets-section">
              <div className="section-header">
                <h1>Dataset Management</h1>
                <p>Switch between datasets or add your own custom data sources</p>
              </div>
              <DatasetSwitcher 
                onDatasetChange={handleDatasetChange}
                currentDataset={currentDataset}
              />
            </div>
          )}
        </div>
      </div>
    </DesignSystemProvider>
  );
};

export default EnhancedHome;
