const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testTextSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('embedded_movies');

    // Check if we have any documents
    const totalDocs = await collection.countDocuments();
    console.log(`📊 Total documents in collection: ${totalDocs}`);

    // Get a sample document to see the structure
    const sampleDoc = await collection.findOne({});
    console.log('📋 Sample document structure:');
    console.log('- title:', sampleDoc?.title);
    console.log('- plot:', sampleDoc?.plot ? 'Present' : 'Missing');
    console.log('- genres:', sampleDoc?.genres);
    console.log('- directors:', sampleDoc?.directors);
    console.log('- cast:', sampleDoc?.cast);

    // Test different search queries
    const testQueries = ['action', 'drama', 'love', 'batman', 'police'];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing search for: "${query}"`);
      
      // Test the current regex search
      const searchFilter = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { plot: { $regex: query, $options: 'i' } },
          { genres: { $regex: query, $options: 'i' } },
          { directors: { $regex: query, $options: 'i' } },
          { cast: { $regex: query, $options: 'i' } }
        ]
      };

      const results = await collection.find(searchFilter).limit(5).toArray();
      console.log(`   Results found: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`   Sample match: ${results[0].title} (${results[0].year})`);
      }

      // Test individual field searches
      const titleMatches = await collection.find({ title: { $regex: query, $options: 'i' } }).limit(2).toArray();
      const plotMatches = await collection.find({ plot: { $regex: query, $options: 'i' } }).limit(2).toArray();
      const genreMatches = await collection.find({ genres: { $regex: query, $options: 'i' } }).limit(2).toArray();
      
      console.log(`   - Title matches: ${titleMatches.length}`);
      console.log(`   - Plot matches: ${plotMatches.length}`);
      console.log(`   - Genre matches: ${genreMatches.length}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testTextSearch();
