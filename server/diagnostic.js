const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check if embedded_movies exists
    if (collections.find(col => col.name === 'embedded_movies')) {
      const collection = db.collection('embedded_movies');
      const count = await collection.countDocuments();
      console.log(`\nembedded_movies collection has ${count} documents`);
      
      // Get a sample document
      const sample = await collection.findOne();
      if (sample) {
        console.log('\nSample document structure:');
        console.log('Fields:', Object.keys(sample));
        console.log('Title:', sample.title);
        console.log('Has plot_embedding:', !!sample.plot_embedding);
      }
    } else {
      console.log('\nembedded_movies collection not found!');
      
      // Check for movies collection
      if (collections.find(col => col.name === 'movies')) {
        const collection = db.collection('movies');
        const count = await collection.countDocuments();
        console.log(`\nmovies collection has ${count} documents`);
        
        const sample = await collection.findOne();
        if (sample) {
          console.log('\nSample movie document:');
          console.log('Title:', sample.title);
          console.log('Fields:', Object.keys(sample));
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
