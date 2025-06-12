const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

// POST /api/movies/search - Search movies using vector or text search
router.post('/search', movieController.search);

// POST /api/movies/insights - Generate insights for movies
router.post('/insights', movieController.getInsights);

// POST /api/movies/analyze - Analyze search query
router.post('/analyze', movieController.analyzeQuery);

// POST /api/movies/embeddings - Get movie embeddings for playground
router.post('/embeddings', movieController.getMovieEmbeddings);

// POST /api/movies/similarity - Calculate similarity matrix
router.post('/similarity', movieController.calculateSimilarityMatrix);

// POST /api/movies/explain - Explain search results
router.post('/explain', movieController.explainSearch);

module.exports = router;
