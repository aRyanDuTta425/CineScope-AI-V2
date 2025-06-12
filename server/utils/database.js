const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');
const mongoService = require('../services/mongoService');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize MongoDB service after connection
    await mongoService.initialize();
    console.log('MongoDB service initialized');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
