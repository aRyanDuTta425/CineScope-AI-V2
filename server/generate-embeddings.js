const mongoose = require('mongoose');
const geminiService = require('./services/geminiService');
require('dotenv').config({ path: '../.env' });

class EmbeddingGenerator {
  constructor() {
    this.db = null;
    this.collection = null;
    this.processed = 0;
    this.errors = 0;
    this.batchSize = 10; // Process in batches to avoid rate limits
  }

  async initialize() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      this.db = mongoose.connection.db;
      this.collection = this.db.collection('embedded_movies');
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async checkCurrentEmbeddings() {
    try {
      console.log('🔍 Analyzing current embeddings...');
      
      // Check total documents
      const totalDocs = await this.collection.countDocuments();
      console.log(`📊 Total documents: ${totalDocs}`);

      // Check documents with old embeddings (1536 dimensions)
      const oldEmbeddingDocs = await this.collection.countDocuments({
        plot_embedding: { $exists: true, $size: 1536 }
      });
      console.log(`📊 Documents with old embeddings (1536d): ${oldEmbeddingDocs}`);

      // Check documents with new embeddings (768 dimensions)
      const newEmbeddingDocs = await this.collection.countDocuments({
        plot_embedding: { $exists: true, $size: 768 }
      });
      console.log(`📊 Documents with new embeddings (768d): ${newEmbeddingDocs}`);

      // Check documents without embeddings but with plot
      const noEmbeddingDocs = await this.collection.countDocuments({
        plot_embedding: { $exists: false },
        plot: { $exists: true, $ne: null, $ne: "" }
      });
      console.log(`📊 Documents needing new embeddings: ${noEmbeddingDocs + oldEmbeddingDocs}`);

      return {
        total: totalDocs,
        oldEmbeddings: oldEmbeddingDocs,
        newEmbeddings: newEmbeddingDocs,
        needsProcessing: noEmbeddingDocs + oldEmbeddingDocs
      };
    } catch (error) {
      console.error('❌ Error analyzing embeddings:', error);
      throw error;
    }
  }

  async generateNewEmbeddings(dryRun = true) {
    try {
      const stats = await this.checkCurrentEmbeddings();
      
      if (stats.needsProcessing === 0) {
        console.log('✅ All documents already have correct embeddings!');
        return;
      }

      console.log(`\n🚀 ${dryRun ? '[DRY RUN] ' : ''}Starting embedding generation...`);
      console.log(`📋 Will process ${stats.needsProcessing} documents in batches of ${this.batchSize}`);

      // Find documents that need new embeddings
      const query = {
        $or: [
          { plot_embedding: { $exists: false } },
          { plot_embedding: { $size: 1536 } } // Update old embeddings
        ],
        plot: { $exists: true, $ne: null, $ne: "" }
      };

      const cursor = this.collection.find(query);
      if (dryRun) {
        cursor.limit(5);
      }
      const documents = await cursor.toArray();

      console.log(`\n📄 Found ${documents.length} documents to process`);

      if (dryRun) {
        console.log('\n🧪 DRY RUN - Sample documents:');
        documents.slice(0, 3).forEach((doc, index) => {
          console.log(`   ${index + 1}. "${doc.title}" (${doc.year})`);
          console.log(`      Plot length: ${doc.plot?.length || 0} chars`);
          console.log(`      Has embedding: ${!!doc.plot_embedding}`);
          console.log(`      Embedding dimensions: ${doc.plot_embedding?.length || 'None'}`);
        });
        
        console.log('\n💡 To run actual processing, use: node generate-embeddings.js --execute');
        return;
      }

      // Process in batches
      const batches = this.chunkArray(documents, this.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} documents)...`);
        
        await this.processBatch(batch);
        
        // Rate limiting delay between batches
        if (i < batches.length - 1) {
          console.log('⏱️  Waiting 2 seconds before next batch...');
          await this.delay(2000);
        }
      }

      console.log(`\n✅ Completed! Processed: ${this.processed}, Errors: ${this.errors}`);
      
    } catch (error) {
      console.error('❌ Error in embedding generation:', error);
      throw error;
    }
  }

  async processBatch(documents) {
    const batchPromises = documents.map(doc => this.processDocument(doc));
    await Promise.allSettled(batchPromises);
  }

  async processDocument(doc) {
    try {
      console.log(`   📝 Processing: "${doc.title}"`);
      
      // Generate new embedding using Gemini
      const embedding = await geminiService.generateEmbedding(doc.plot);
      
      if (!embedding || embedding.length !== 768) {
        throw new Error(`Invalid embedding: expected 768 dimensions, got ${embedding?.length || 0}`);
      }

      // Update document with new embedding
      await this.collection.updateOne(
        { _id: doc._id },
        { 
          $set: { 
            plot_embedding: embedding,
            embedding_updated: new Date(),
            embedding_model: 'gemini-1.5-flash',
            embedding_dimensions: 768
          } 
        }
      );

      console.log(`   ✅ Updated: "${doc.title}" with ${embedding.length}d embedding`);
      this.processed++;
      
    } catch (error) {
      console.error(`   ❌ Error processing "${doc.title}":`, error.message);
      this.errors++;
    }
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function main() {
  const generator = new EmbeddingGenerator();
  
  try {
    await generator.initialize();
    
    const isDryRun = !process.argv.includes('--execute');
    await generator.generateNewEmbeddings(isDryRun);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await generator.disconnect();
  }
}

if (require.main === module) {
  main();
}
