const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../utils/config');

class GeminiService {
  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Updated model name
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' }); // Updated embedding model
  }

  async generateEmbedding(text) {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateInsight(movies) {
    try {
      const movieSummary = movies.map(movie => 
        `${movie.title} (${movie.year}) - ${movie.genres?.join(', ')} - ${movie.plot || 'No plot available'}`
      ).join('\n');

      const prompt = `Based on these movies, provide a brief insight or recommendation (2-3 sentences):

${movieSummary}

Please provide a helpful insight about these movies, common themes, or recommendations for similar films.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating insight:', error);
      throw new Error('Failed to generate insight');
    }
  }

  async analyzeQuery(query) {
    try {
      const prompt = `Analyze this movie search query and extract key themes, genres, or characteristics: "${query}"
      
      Respond with a brief analysis focusing on what type of movies the user is looking for.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error analyzing query:', error);
      return 'Unable to analyze query';
    }
  }

  async explainSearchResults(query, explanations) {
    try {
      const prompt = `
As an AI assistant, explain how the search results were ranked for the query: "${query}"

Here are the movies and their relevance scores:
${explanations.map(exp => `
- ${exp.title}
  - Semantic Similarity: ${(exp.similarityScore * 100).toFixed(1)}%
  - Keyword Matches: ${exp.matchingKeywords.join(', ') || 'None'}
  - Genre Alignment: ${exp.relevanceFactors.genreAlignment ? 'Yes' : 'No'}
`).join('')}

Provide a clear, concise explanation of:
1. How semantic similarity works in movie search
2. Why these particular movies were ranked highly
3. What factors influenced the ranking
4. How users can improve their search queries

Keep the explanation accessible and informative, around 2-3 paragraphs.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error explaining search results:', error);
      return 'Unable to generate explanation for search results';
    }
  }

  async generateContextualSummary(movies, context = '') {
    try {
      const prompt = `
Generate a brief, engaging summary of these movies${context ? ` in the context of: ${context}` : ''}:

${movies.slice(0, 5).map(movie => `
- ${movie.title} (${movie.year}): ${movie.plot || movie.overview || 'No description available'}
`).join('')}

Provide:
1. Common themes or patterns
2. Notable directors or actors
3. Genre trends
4. Why these movies might appeal to viewers

Keep it concise (2-3 sentences) and engaging.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating contextual summary:', error);
      return 'Unable to generate summary';
    }
  }
}

module.exports = new GeminiService();
