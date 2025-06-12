const geminiService = require('./services/geminiService');
require('dotenv').config({ path: '../.env' });

async function testGeminiAPI() {
  try {
    console.log('🤖 Testing Gemini API...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);
    
    const testQuery = 'action movies';
    console.log(`\n🔍 Generating embedding for: "${testQuery}"`);
    
    const embedding = await geminiService.generateEmbedding(testQuery);
    
    console.log('✅ Embedding generated successfully!');
    console.log('📊 Embedding details:');
    console.log('  - Type:', typeof embedding);
    console.log('  - Length:', embedding.length);
    console.log('  - First 5 values:', embedding.slice(0, 5));
    console.log('  - Sample values range:', {
      min: Math.min(...embedding.slice(0, 100)),
      max: Math.max(...embedding.slice(0, 100))
    });
    
    // Test insight generation
    console.log('\n🧠 Testing insight generation...');
    const sampleMovies = [
      { title: 'The Matrix', year: 1999, genres: ['Action', 'Sci-Fi'], plot: 'A computer programmer discovers reality is a simulation.' },
      { title: 'Inception', year: 2010, genres: ['Action', 'Thriller'], plot: 'A thief enters dreams to plant ideas.' }
    ];
    
    const insight = await geminiService.generateInsight(sampleMovies);
    console.log('✅ Insight generated:');
    console.log(insight);
    
  } catch (error) {
    console.error('❌ Gemini API test failed:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
  }
}

testGeminiAPI();
