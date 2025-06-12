const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// GET /api/dashboard/data - Get all dashboard data
router.get('/data', dashboardController.getDashboardData);

// GET /api/dashboard/genres - Get genre statistics
router.get('/genres', dashboardController.getGenreStats);

// GET /api/dashboard/ratings - Get rating statistics
router.get('/ratings', dashboardController.getRatingStats);

// GET /api/dashboard/years - Get year distribution
router.get('/years', dashboardController.getYearStats);

module.exports = router;
