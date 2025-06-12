const mongoose = require('mongoose');

class MongoService {
  constructor() {
    this.db = null;
    this.collection = null;
  }

  async initialize() {
    try {
      this.db = mongoose.connection.db;
      this.collection = this.db.collection('embedded_movies');
      console.log('MongoDB service initialized');
    } catch (error) {
      console.error('Failed to initialize MongoDB service:', error);
      throw error;
    }
  }

  async vectorSearch(embedding, limit = 10) {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      console.log('🔍 Starting vector search with embedding length:', embedding.length);

      const pipeline = [
        {
          $vectorSearch: {
            index: "vector_index", // You'll need to create this index in MongoDB Atlas
            path: "plot_embedding",
            queryVector: embedding,
            numCandidates: 100,
            limit: limit
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            year: 1,
            genres: 1,
            plot: 1,
            poster: 1,
            imdb: 1,
            runtime: 1,
            directors: 1,
            cast: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ];

      console.log('🔍 Executing vector search pipeline...');
      const results = await this.collection.aggregate(pipeline).toArray();
      console.log('🔍 Vector search pipeline executed, results count:', results.length);
      return results;
    } catch (error) {
      console.error('💥 Vector search error details:', {
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        name: error.name
      });
      throw new Error(`Vector search failed: ${error.message}`);
    }
  }

  extractKeywords(query) {
    // Remove common words and extract meaningful keywords
    const stopWords = ['movies', 'like', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'similar', 'find', 'show', 'me'];
    
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return keywords;
  }

  async searchMovies(query, limit = 10) {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      console.log('🔍 Text search for query:', query);
      
      // Extract keywords from the query for smarter search
      const keywords = this.extractKeywords(query);
      console.log('🔍 Extracted keywords:', keywords);

      let searchFilter;
      
      if (keywords.length === 0) {
        // Fallback to original query if no keywords extracted
        searchFilter = {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { plot: { $regex: query, $options: 'i' } },
            { genres: { $regex: query, $options: 'i' } },
            { directors: { $regex: query, $options: 'i' } },
            { cast: { $regex: query, $options: 'i' } }
          ]
        };
      } else {
        // Use keywords for more flexible search
        const keywordFilters = keywords.map(keyword => ({
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { plot: { $regex: keyword, $options: 'i' } },
            { genres: { $regex: keyword, $options: 'i' } },
            { directors: { $regex: keyword, $options: 'i' } },
            { cast: { $regex: keyword, $options: 'i' } }
          ]
        }));
        
        searchFilter = {
          $or: keywordFilters
        };
      }

      const results = await this.collection
        .find(searchFilter)
        .limit(limit)
        .toArray();

      console.log('🔍 Text search found:', results.length, 'results');
      return results;
    } catch (error) {
      console.error('Text search error:', error);
      throw new Error('Text search failed');
    }
  }

  async getDashboardData() {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      // Get genre counts
      const genreCounts = await this.collection.aggregate([
        { $unwind: "$genres" },
        { $group: { _id: "$genres", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      // Get average ratings by genre
      const avgRatingsByGenre = await this.collection.aggregate([
        { $match: { "imdb.rating": { $exists: true, $ne: null, $gt: 0 } } },
        { $unwind: "$genres" },
        {
          $group: {
            _id: "$genres",
            avgRating: { $avg: "$imdb.rating" },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gte: 5 } } }, // Only genres with at least 5 movies
        { $sort: { avgRating: -1 } },
        { $limit: 10 }
      ]).toArray();

      // Get year distribution
      const yearDistribution = await this.collection.aggregate([
        { $match: { year: { $exists: true, $ne: null, $gte: 1900, $lte: new Date().getFullYear() } } },
        { $group: { _id: "$year", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray();

      return {
        genreCounts,
        avgRatingsByGenre,
        yearDistribution
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  async getMoviesByIds(movieIds) {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      console.log('🔍 Fetching movies by IDs:', movieIds.length);

      const objectIds = movieIds.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (error) {
          return id; // In case it's already an ObjectId
        }
      });

      const movies = await this.collection.find({
        _id: { $in: objectIds }
      }).toArray();

      console.log(`✅ Found ${movies.length} movies by IDs`);

      return movies.map(movie => this.transformMovie(movie));
    } catch (error) {
      console.error('❌ Error fetching movies by IDs:', error);
      throw error;
    }
  }

  async getAllMoviesWithEmbeddings(limit = 100) {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      console.log('🔍 Fetching movies with embeddings, limit:', limit);

      const movies = await this.collection.find({
        plot_embedding: { $exists: true, $ne: null }
      })
      .limit(limit)
      .toArray();

      console.log(`✅ Found ${movies.length} movies with embeddings`);

      return movies.map(movie => this.transformMovie(movie));
    } catch (error) {
      console.error('❌ Error fetching movies with embeddings:', error);
      throw error;
    }
  }
}

module.exports = new MongoService();
