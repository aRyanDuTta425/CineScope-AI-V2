const dotenv = require('dotenv');

// Load environment variables from .env file (for local development)
// In production (Cloud Run), environment variables are set directly
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../.env' });
}

module.exports = {
  PORT: process.env.PORT || 8080, // Cloud Run uses PORT 8080 by default
  MONGODB_URI: process.env.MONGODB_URI,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
