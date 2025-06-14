const app = require('./app');
const connectDB = require('./utils/database');
const { PORT } = require('./utils/config');

// Connect to MongoDB
connectDB();

// Start server on 0.0.0.0 for Cloud Run compatibility
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CineScope AI Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API Health: http://localhost:${PORT}/api/health`);
  console.log(`   Movies: http://localhost:${PORT}/api/movies`);
  console.log(`   Dashboard: http://localhost:${PORT}/api/dashboard`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🎬 Frontend: Served statically from /public`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
