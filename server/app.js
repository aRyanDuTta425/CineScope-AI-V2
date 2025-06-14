const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const corsMiddleware = require('./middleware/cors');

// Import routes
const movieRoutes = require('./routes/movies');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from React build (for Cloud Run deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CineScope AI is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Movie Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// Default API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'CineScope AI API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      movies: '/api/movies',
      dashboard: '/api/dashboard'
    }
  });
});

// Serve React app for all non-API routes (SPA routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  // Development fallback
  app.get('/', (req, res) => {
    res.json({ 
      message: 'CineScope AI Development Server',
      note: 'Frontend should be served by React dev server on port 3000'
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
