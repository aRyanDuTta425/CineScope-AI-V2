import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const movieAPI = {
  search: async (query, useVector = true) => {
    const response = await api.post('/movies/search', { query, useVector });
    return response.data;
  },

  findSimilar: async (movie) => {
    const response = await api.post('/movies/similar', { movie });
    return response.data;
  },

  getInsights: async (movies) => {
    const response = await api.post('/movies/insights', { movies });
    return response.data;
  },

  analyzeQuery: async (query) => {
    const response = await api.post('/movies/analyze', { query });
    return response.data;
  },

  getMovieEmbeddings: async (movieIds) => {
    const response = await api.post('/movies/embeddings', { movieIds });
    return response.data;
  },

  calculateSimilarityMatrix: async (movieIds) => {
    const response = await api.post('/movies/similarity', { movieIds });
    return response.data;
  },

  explainSearch: async (query, movies) => {
    const response = await api.post('/movies/explain', { query, movies });
    return response.data;
  }
};

export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard/data');
    return response.data;
  },

  getGenreStats: async () => {
    const response = await api.get('/dashboard/genres');
    return response.data;
  },

  getRatingStats: async () => {
    const response = await api.get('/dashboard/ratings');
    return response.data;
  },

  getYearStats: async () => {
    const response = await api.get('/dashboard/years');
    return response.data;
  }
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
