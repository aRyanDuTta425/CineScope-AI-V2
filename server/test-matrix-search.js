const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testMatrixSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('embedded_movies');

    // Test the exact query that's failing
    const query = 'movies like The Matrix';
    console.log(`🔍 Testing search for: "${query}"`);
    
    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { plot: { $regex: query, $options: 'i' } },
        { genres: { $regex: query, $options: 'i' } },
        { directors: { $regex: query, $options: 'i' } },
        { cast: { $regex: query, $options: 'i' } }
      ]
    };

    const results = await collection.find(searchFilter).limit(10).toArray();
    console.log(`📊 Results found: ${results.length}`);

    // Try individual components
    console.log('\n🔍 Testing individual components:');
    
    // Test "matrix" specifically
    const matrixQuery = 'matrix';
    const matrixFilter = {
      $or: [
        { title: { $regex: matrixQuery, $options: 'i' } },
        { plot: { $regex: matrixQuery, $options: 'i' } },
        { genres: { $regex: matrixQuery, $options: 'i' } },
        { directors: { $regex: matrixQuery, $options: 'i' } },
        { cast: { $regex: matrixQuery, $options: 'i' } }
      ]
    };

    const matrixResults = await collection.find(matrixFilter).limit(10).toArray();
    console.log(`📊 "Matrix" search results: ${matrixResults.length}`);
    
    if (matrixResults.length > 0) {
      matrixResults.forEach((movie, index) => {
        console.log(`   ${index + 1}. ${movie.title} (${movie.year})`);
      });
    }

    // Try a more semantic approach - break down the query
    console.log('\n🔍 Testing semantic breakdown:');
    const semanticQueries = ['science fiction', 'cyber', 'virtual reality', 'dystopian', 'hacker'];
    
    for (const sq of semanticQueries) {
      const semanticFilter = {
        $or: [
          { title: { $regex: sq, $options: 'i' } },
          { plot: { $regex: sq, $options: 'i' } },
          { genres: { $regex: sq, $options: 'i' } }
        ]
      };
      
      const semanticResults = await collection.find(semanticFilter).limit(3).toArray();
      console.log(`   "${sq}": ${semanticResults.length} results`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMatrixSearch();
