const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function testSearch() {
  try {
    console.log('=== Search Function Test ===');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    // Connect to MongoDB with timeout
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connection successful');
    
    // Get database and collection
    const db = mongoose.connection.db;
    const collection = db.collection('embedded_movies');
    
    console.log('📊 Database name:', db.databaseName);
    
    const movieCount = await collection.countDocuments();
    console.log(`🎬 embedded_movies collection: ${movieCount} documents`);
    
    if (movieCount > 0) {
      // Test different search queries
      const testQueries = ['action', 'drama', 'adventure', 'comedy'];
      
      for (const query of testQueries) {
        console.log(`\n🔍 Testing search for: "${query}"`);
        
        // Test the exact search logic from mongoService.js
        const searchFilter = {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { plot: { $regex: query, $options: 'i' } },
            { genres: { $regex: query, $options: 'i' } },
            { directors: { $regex: query, $options: 'i' } },
            { cast: { $regex: query, $options: 'i' } }
          ]
        };
        
        const results = await collection
          .find(searchFilter)
          .limit(3)
          .toArray();
          
        console.log(`   📊 Found ${results.length} movies`);
        
        if (results.length > 0) {
          results.forEach((movie, index) => {
            console.log(`   ${index + 1}. "${movie.title}" (${movie.year || 'N/A'})`);
            if (movie.genres && Array.isArray(movie.genres)) {
              console.log(`      Genres: ${movie.genres.join(', ')}`);
            }
          });
        }
      }
      
      // Check the structure of documents more carefully
      console.log('\n📄 Analyzing document structure...');
      const sampleDocs = await collection.find({}).limit(3).toArray();
      
      sampleDocs.forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log(`  Title: ${doc.title}`);
        console.log(`  Year: ${doc.year}`);
        console.log(`  Genres type: ${typeof doc.genres}, value: ${JSON.stringify(doc.genres)}`);
        console.log(`  Plot length: ${doc.plot ? doc.plot.length : 'No plot'}`);
        console.log(`  Directors type: ${typeof doc.directors}, value: ${JSON.stringify(doc.directors)}`);
        console.log(`  Cast type: ${typeof doc.cast}, value: ${JSON.stringify(doc.cast)}`);
      });
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

testSearch();
