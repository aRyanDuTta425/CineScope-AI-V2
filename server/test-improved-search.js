const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoService = require('./services/mongoService');

async function testImprovedSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize the mongo service
    await mongoService.initialize();
    
    // Test various natural language queries
    const testQueries = [
      'movies like The Matrix',
      'action movies',
      'science fiction films',
      'batman movies',
      'romantic comedies',
      'find drama movies',
      'show me horror films'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing: "${query}"`);
      const results = await mongoService.searchMovies(query, 5);
      console.log(`📊 Results: ${results.length}`);
      
      if (results.length > 0) {
        results.forEach((movie, index) => {
          console.log(`   ${index + 1}. ${movie.title} (${movie.year}) - ${movie.genres?.join(', ')}`);
        });
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testImprovedSearch();
