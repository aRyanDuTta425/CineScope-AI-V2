import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import GenreChart from '../components/Charts/GenreChart';
import RatingChart from '../components/Charts/RatingChart';
import YearChart from '../components/Charts/YearChart';
import DirectorsChart from '../components/Charts/DirectorsChart';
import HeatmapChart from '../components/Charts/HeatmapChart';
import { dashboardAPI } from '../services/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await dashboardAPI.getDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data) return {};

    const totalMovies = data.genreCounts?.reduce((sum, genre) => sum + genre.count, 0) || 0;
    const totalGenres = data.genreCounts?.length || 0;
    const avgRating = data.avgRatingsByGenre?.reduce((sum, genre) => sum + genre.avgRating, 0) / 
                     (data.avgRatingsByGenre?.length || 1) || 0;
    const yearRange = data.yearDistribution?.length > 0 ? 
      `${Math.min(...data.yearDistribution.map(y => y._id))} - ${Math.max(...data.yearDistribution.map(y => y._id))}` : 
      'N/A';

    return {
      totalMovies,
      totalGenres,
      avgRating: avgRating.toFixed(1),
      yearRange
    };
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-dashboard">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-dashboard">
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats(dashboardData);

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Movie Analytics Dashboard</h1>
        <p className="dashboard-subtitle">
          Explore trends and insights from the movie database
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalMovies.toLocaleString()}</div>
          <div className="stat-label">Total Movies</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalGenres}</div>
          <div className="stat-label">Genres</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgRating}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.yearRange}</div>
          <div className="stat-label">Year Range</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid">
        <div className="chart-card">
          <h3 className="chart-title">Movies by Genre</h3>
          <GenreChart data={dashboardData?.genreCounts} />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Average Ratings by Genre</h3>
          <RatingChart data={dashboardData?.avgRatingsByGenre} />
        </div>

        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-title">Movie Releases Over Time</h3>
          <YearChart data={dashboardData?.yearDistribution} />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Directors</h3>
          <DirectorsChart data={dashboardData?.directorCounts} />
        </div>

        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Genre Distribution Over Time</h3>
          <HeatmapChart data={dashboardData?.genreYearHeatmap} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>
          Data Insights
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          This dashboard analyzes the MongoDB sample_mflix.embedded_movies collection, 
          providing insights into movie distribution across genres, ratings, and release years. 
          The data is processed in real-time from MongoDB Atlas.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
