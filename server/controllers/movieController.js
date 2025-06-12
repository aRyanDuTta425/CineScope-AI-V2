const geminiService = require('../services/geminiService');
const mongoService = require('../services/mongoService');

class MovieController {
  async search(req, res) {
    try {
      console.log('🔍 Search request received:', req.body);
      const { query, useVector = true } = req.body;

      if (!query) {
        console.log('❌ No query provided');
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`🔍 Searching for: "${query}", useVector: ${useVector}`);
      let movies = [];

      if (useVector) {
        try {
          console.log('🤖 Attempting vector search...');
          // Generate embedding for the query
          const embedding = await geminiService.generateEmbedding(query);
          console.log('✅ Embedding generated successfully, length:', embedding.length);
          // Perform vector search
          movies = await mongoService.vectorSearch(embedding, 10);
          console.log(`✅ Vector search completed: ${movies.length} movies found`);
          
          // If vector search returns no results, fall back to text search
          if (movies.length === 0) {
            console.log('⚠️ Vector search returned 0 results, falling back to text search...');
            movies = await mongoService.searchMovies(query, 10);
            console.log(`✅ Text search fallback completed: ${movies.length} movies found`);
          }
        } catch (error) {
          console.log('❌ Vector search failed, falling back to text search:', error.message);
          // Fallback to text search if vector search fails
          movies = await mongoService.searchMovies(query, 10);
          console.log(`✅ Text search fallback completed: ${movies.length} movies found`);
        }
      } else {
        console.log('📝 Performing text search...');
        // Use text search
        movies = await mongoService.searchMovies(query, 10);
        console.log(`✅ Text search completed: ${movies.length} movies found`);
      }

      console.log('📤 Sending response...');
      res.json({
        success: true,
        query,
        movies,
        count: movies.length
      });
    } catch (error) {
      console.error('💥 Search error:', error);
      res.status(500).json({ 
        error: 'Search failed', 
        message: error.message 
      });
    }
  }

  async getInsights(req, res) {
    try {
      const { movies } = req.body;

      if (!movies || !Array.isArray(movies) || movies.length === 0) {
        return res.status(400).json({ error: 'Movies array is required' });
      }

      const insight = await geminiService.generateInsight(movies);

      res.json({
        success: true,
        insight
      });
    } catch (error) {
      console.error('Insights error:', error);
      res.status(500).json({ 
        error: 'Failed to generate insights', 
        message: error.message 
      });
    }
  }

  async analyzeQuery(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const analysis = await geminiService.analyzeQuery(query);

      res.json({
        success: true,
        query,
        analysis
      });
    } catch (error) {
      console.error('Query analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze query', 
        message: error.message 
      });
    }
  }

  async getMovieEmbeddings(req, res) {
    try {
      const { movieIds } = req.body;

      if (!movieIds || !Array.isArray(movieIds)) {
        return res.status(400).json({ error: 'Movie IDs array is required' });
      }

      const movies = await mongoService.getMoviesByIds(movieIds);

      res.json({
        success: true,
        movies: movies.map(movie => ({
          _id: movie._id,
          title: movie.title,
          year: movie.year,
          embedding: movie.embedding,
          poster_url: movie.poster_url,
          genres: movie.genres
        }))
      });
    } catch (error) {
      console.error('Embeddings fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch movie embeddings', 
        message: error.message 
      });
    }
  }

  async calculateSimilarityMatrix(req, res) {
    try {
      const { movieIds } = req.body;

      if (!movieIds || !Array.isArray(movieIds) || movieIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 movie IDs are required' });
      }

      const movies = await mongoService.getMoviesByIds(movieIds);
      
      if (movies.length < 2) {
        return res.status(400).json({ error: 'Not enough movies found' });
      }

      // Calculate cosine similarity matrix
      const cosineSimilarity = (a, b) => {
        const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
        return dotProduct / (magnitudeA * magnitudeB);
      };

      const similarityMatrix = movies.map((movie1, i) =>
        movies.map((movie2, j) => {
          if (i === j) return 1;
          if (!movie1.embedding || !movie2.embedding) return 0;
          return cosineSimilarity(movie1.embedding, movie2.embedding);
        })
      );

      res.json({
        success: true,
        movies: movies.map(movie => ({
          _id: movie._id,
          title: movie.title,
          year: movie.year
        })),
        similarityMatrix
      });
    } catch (error) {
      console.error('Similarity calculation error:', error);
      res.status(500).json({ 
        error: 'Failed to calculate similarity matrix', 
        message: error.message 
      });
    }
  }

  async explainSearch(req, res) {
    try {
      const { query, movies } = req.body;

      if (!query || !movies || !Array.isArray(movies)) {
        return res.status(400).json({ error: 'Query and movies array are required' });
      }

      // Generate query embedding for comparison
      const queryEmbedding = await geminiService.generateEmbedding(query);
      
      // Calculate similarity scores for each movie
      const cosineSimilarity = (a, b) => {
        const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
        return dotProduct / (magnitudeA * magnitudeB);
      };

      const explanations = movies.map(movie => {
        let similarityScore = 0;
        
        if (movie.embedding && queryEmbedding) {
          similarityScore = cosineSimilarity(queryEmbedding, movie.embedding);
        }

        // Identify matching keywords
        const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
        const movieText = `${movie.title} ${movie.overview || ''} ${(movie.genres || []).join(' ')}`.toLowerCase();
        const matchingKeywords = queryWords.filter(word => movieText.includes(word));

        return {
          movieId: movie._id,
          title: movie.title,
          similarityScore: similarityScore,
          matchingKeywords: matchingKeywords,
          relevanceFactors: {
            semanticSimilarity: similarityScore,
            keywordMatches: matchingKeywords.length,
            genreAlignment: movie.genres ? movie.genres.some(genre => 
              queryWords.some(word => genre.toLowerCase().includes(word))
            ) : false
          }
        };
      });

      // Generate AI explanation
      const explanation = await geminiService.explainSearchResults(query, explanations);

      res.json({
        success: true,
        query,
        explanations,
        aiExplanation: explanation
      });
    } catch (error) {
      console.error('Search explanation error:', error);
      res.status(500).json({ 
        error: 'Failed to explain search results', 
        message: error.message 
      });
    }
  }
}

module.exports = new MovieController();
