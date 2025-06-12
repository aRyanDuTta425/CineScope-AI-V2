import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { movieAPI } from '../services/api';
import '../styles/EmbeddingsPlayground.css';

const EmbeddingsPlayground = () => {
  const { theme } = useTheme();
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [similarityMatrix, setSimilarityMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);

  // Calculate cosine similarity between two vectors
  const cosineSimilarity = (a, b) => {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  // Generate similarity matrix for selected movies
  const generateSimilarityMatrix = useCallback(() => {
    if (selectedMovies.length < 2) return;

    const matrix = selectedMovies.map((movie1, i) =>
      selectedMovies.map((movie2, j) => {
        if (i === j) return 1; // Self-similarity is 1
        if (!movie1.embedding || !movie2.embedding) return 0;
        return cosineSimilarity(movie1.embedding, movie2.embedding);
      })
    );

    setSimilarityMatrix(matrix);
  }, [selectedMovies]);

  useEffect(() => {
    generateSimilarityMatrix();
  }, [generateSimilarityMatrix]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await movieAPI.search(searchQuery, true);
      if (response.success) {
        setMovies(response.movies.slice(0, 20)); // Limit for performance
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const toggleMovieSelection = (movie) => {
    setSelectedMovies(prev => {
      const isSelected = prev.find(m => m._id === movie._id);
      if (isSelected) {
        return prev.filter(m => m._id !== movie._id);
      } else if (prev.length < 10) { // Limit to 10 movies for performance
        return [...prev, movie];
      }
      return prev;
    });
  };

  const getSimilarityColor = (similarity) => {
    const intensity = Math.abs(similarity);
    const red = similarity > 0 ? 0 : Math.floor(255 * intensity);
    const green = similarity > 0 ? Math.floor(255 * intensity) : 0;
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <div className={`embeddings-playground ${theme}`}>
      <div className="playground-header">
        <h2>🧪 Embeddings Playground</h2>
        <p>Explore vector similarities between movies using AI embeddings</p>
      </div>

      <div className="search-section">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies to analyze..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="playground-search-input"
          />
          <button onClick={handleSearch} disabled={loading} className="search-btn">
            {loading ? '🔄' : '🔍'}
          </button>
        </div>
      </div>

      <div className="playground-content">
        <div className="movies-section">
          <h3>Available Movies ({movies.length})</h3>
          <div className="movies-grid">
            {movies.map(movie => (
              <div
                key={movie._id}
                className={`movie-item ${selectedMovies.find(m => m._id === movie._id) ? 'selected' : ''}`}
                onClick={() => toggleMovieSelection(movie)}
              >
                <div className="movie-poster">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} />
                  ) : (
                    <div className="no-poster">🎬</div>
                  )}
                </div>
                <div className="movie-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-section">
          <h3>Selected Movies ({selectedMovies.length}/10)</h3>
          <div className="selected-movies">
            {selectedMovies.map(movie => (
              <span key={movie._id} className="selected-movie-tag">
                {movie.title} ({movie.year})
                <button onClick={() => toggleMovieSelection(movie)}>×</button>
              </span>
            ))}
          </div>

          {selectedMovies.length >= 2 && (
            <div className="similarity-matrix">
              <h4>Cosine Similarity Heatmap</h4>
              <div className="heatmap-container">
                <div className="heatmap">
                  <div className="heatmap-labels-y">
                    {selectedMovies.map((movie, i) => (
                      <div key={i} className="heatmap-label">
                        {movie.title.length > 15 ? movie.title.substring(0, 15) + '...' : movie.title}
                      </div>
                    ))}
                  </div>
                  <div className="heatmap-grid">
                    {similarityMatrix.map((row, i) => (
                      <div key={i} className="heatmap-row">
                        {row.map((similarity, j) => (
                          <div
                            key={j}
                            className="heatmap-cell"
                            style={{
                              backgroundColor: getSimilarityColor(similarity),
                              opacity: 0.7 + (Math.abs(similarity) * 0.3)
                            }}
                            onMouseEnter={() => setHoveredCell({ i, j, similarity })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {similarity.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="heatmap-labels-x">
                  {selectedMovies.map((movie, i) => (
                    <div key={i} className="heatmap-label">
                      {movie.title.length > 15 ? movie.title.substring(0, 15) + '...' : movie.title}
                    </div>
                  ))}
                </div>
              </div>
              
              {hoveredCell && (
                <div className="similarity-tooltip">
                  <strong>{selectedMovies[hoveredCell.i].title}</strong> vs <strong>{selectedMovies[hoveredCell.j].title}</strong>
                  <br />
                  Similarity: {(hoveredCell.similarity * 100).toFixed(1)}%
                </div>
              )}

              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: 'rgb(0, 255, 0)'}}></div>
                  <span>High Similarity (1.0)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: 'rgb(127, 127, 0)'}}></div>
                  <span>Medium Similarity (0.5)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: 'rgb(255, 0, 0)'}}></div>
                  <span>Low Similarity (0.0)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbeddingsPlayground;
