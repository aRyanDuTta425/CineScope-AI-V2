const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function checkVectorIndex() {
  try {
    console.log('🔍 Checking Vector Index Configuration...');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('embedded_movies');

    // Check if collection exists and has documents
    const docCount = await collection.countDocuments();
    console.log(`📊 Collection 'embedded_movies' has ${docCount} documents`);

    // Check if documents have plot_embedding field
    const sampleWithEmbedding = await collection.findOne({ plot_embedding: { $exists: true } });
    
    if (sampleWithEmbedding) {
      console.log('✅ Found documents with plot_embedding field');
      console.log(`📏 Sample embedding length: ${sampleWithEmbedding.plot_embedding?.length || 'N/A'}`);
    } else {
      console.log('❌ No documents found with plot_embedding field');
      
      // Check what fields exist
      const sampleDoc = await collection.findOne({});
      if (sampleDoc) {
        console.log('📄 Available fields in sample document:');
        Object.keys(sampleDoc).forEach(key => {
          console.log(`   • ${key}: ${typeof sampleDoc[key]}`);
        });
      }
    }

    // Try to list indexes
    try {
      const indexes = await collection.listIndexes().toArray();
      console.log('\n📋 Current indexes on collection:');
      indexes.forEach(index => {
        console.log(`   • ${index.name}: ${JSON.stringify(index.key)}`);
      });

      // Check specifically for vector index
      const vectorIndex = indexes.find(idx => 
        idx.type === 'vectorSearch' || 
        Object.keys(idx.key || {}).includes('plot_embedding')
      );

      if (vectorIndex) {
        console.log('✅ Vector search index found:', vectorIndex.name);
      } else {
        console.log('❌ No vector search index found');
        console.log('\n🛠️  SOLUTION: You need to create a vector search index in MongoDB Atlas');
        console.log('   Follow these steps:');
        console.log('   1. Go to MongoDB Atlas Dashboard');
        console.log('   2. Navigate to your cluster > Database > Search');
        console.log('   3. Click "Create Search Index"');
        console.log('   4. Choose "Vector Search" index type');
        console.log('   5. Use this configuration:');
        console.log('   {');
        console.log('     "fields": [');
        console.log('       {');
        console.log('         "numDimensions": 768,');
        console.log('         "path": "plot_embedding",');
        console.log('         "similarity": "cosine",');
        console.log('         "type": "vector"');
        console.log('       }');
        console.log('     ]');
        console.log('   }');
        console.log('   6. Name the index "vector_index"');
        console.log('   7. Select your database and collection');
      }
    } catch (indexError) {
      console.log('⚠️  Could not list indexes:', indexError.message);
    }

    // Test a simple aggregation to see what's available
    console.log('\n🧪 Testing aggregation capabilities...');
    try {
      const pipeline = [
        { $limit: 1 },
        { $project: { 
          title: 1, 
          hasEmbedding: { $type: "$plot_embedding" },
          embeddingLength: { $size: { $ifNull: ["$plot_embedding", []] } }
        }}
      ];
      
      const result = await collection.aggregate(pipeline).toArray();
      if (result.length > 0) {
        console.log('📊 Sample document analysis:');
        console.log(`   • Title: ${result[0].title}`);
        console.log(`   • Has embedding: ${result[0].hasEmbedding !== 'missing'}`);
        console.log(`   • Embedding length: ${result[0].embeddingLength}`);
      }
    } catch (aggError) {
      console.log('❌ Aggregation test failed:', aggError.message);
    }

  } catch (error) {
    console.error('❌ Error checking vector index:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function generateMissingEmbeddings() {
  try {
    console.log('\n🔧 Checking if embeddings need to be generated...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('embedded_movies');

    // Count documents without embeddings
    const docsWithoutEmbedding = await collection.countDocuments({
      plot_embedding: { $exists: false },
      plot: { $exists: true, $ne: null, $ne: "" }
    });

    console.log(`📊 Found ${docsWithoutEmbedding} documents without embeddings that have plot text`);

    if (docsWithoutEmbedding > 0) {
      console.log('\n💡 RECOMMENDATION: Run the embedding generation script');
      console.log('   You can create embeddings by running:');
      console.log('   node generate-embeddings.js');
    } else {
      console.log('✅ All documents with plots have embeddings');
    }

  } catch (error) {
    console.error('❌ Error checking embeddings:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  await checkVectorIndex();
  await generateMissingEmbeddings();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 NEXT STEPS:');
  console.log('1. Create vector search index in MongoDB Atlas (if not exists)');
  console.log('2. Generate embeddings for documents (if needed)');
  console.log('3. Test vector search functionality');
  console.log('4. Update application to handle graceful fallbacks');
}

main().catch(console.error);
