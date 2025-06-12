const mongoService = require('../services/mongoService');

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const dashboardData = await mongoService.getDashboardData();

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data', 
        message: error.message 
      });
    }
  }

  async getGenreStats(req, res) {
    try {
      const { genreCounts } = await mongoService.getDashboardData();

      res.json({
        success: true,
        genreStats: genreCounts
      });
    } catch (error) {
      console.error('Genre stats error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch genre statistics', 
        message: error.message 
      });
    }
  }

  async getRatingStats(req, res) {
    try {
      const { avgRatingsByGenre } = await mongoService.getDashboardData();

      res.json({
        success: true,
        ratingStats: avgRatingsByGenre
      });
    } catch (error) {
      console.error('Rating stats error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch rating statistics', 
        message: error.message 
      });
    }
  }

  async getYearStats(req, res) {
    try {
      const { yearDistribution } = await mongoService.getDashboardData();

      res.json({
        success: true,
        yearStats: yearDistribution
      });
    } catch (error) {
      console.error('Year stats error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch year statistics', 
        message: error.message 
      });
    }
  }
}

module.exports = new DashboardController();
