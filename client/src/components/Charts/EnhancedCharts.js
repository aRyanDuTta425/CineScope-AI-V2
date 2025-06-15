import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { getThemeStyles } from '../../context/DesignSystem';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Enhanced Genre Distribution Pie Chart
export const GenreDistributionChart = ({ movies = [] }) => {
  const { theme } = useTheme();
  const themeColors = getThemeStyles(theme, 'colors');

  const genreCount = movies.reduce((acc, movie) => {
    (movie.genres || []).forEach(genre => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {});

  const sortedGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const colorPalette = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
    '#10b981', '#06b6d4', '#84cc16', '#f97316', '#64748b'
  ];

  const data = {
    labels: sortedGenres.map(([genre]) => genre),
    datasets: [{
      data: sortedGenres.map(([, count]) => count),
      backgroundColor: colorPalette.slice(0, sortedGenres.length),
      borderColor: themeColors.background,
      borderWidth: 3,
      hoverBorderWidth: 5,
      hoverOffset: 10
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 5,
        right: 5
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: themeColors.text,
          font: { size: 11, weight: '500' },
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10
        }
      },
      tooltip: {
        backgroundColor: themeColors.surface,
        titleColor: themeColors.text,
        bodyColor: themeColors.text,
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const percentage = ((context.raw / movies.length) * 100).toFixed(1);
            return `${context.label}: ${context.raw} movies (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Genre Distribution</h3>
        <p className="chart-subtitle">Top 10 genres from {movies.length} movies</p>
      </div>
      <div className="chart-wrapper" style={{ height: '400px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

// Enhanced Top Directors/Actors Bar Chart
export const TopTalentChart = ({ movies = [], type = 'directors' }) => {
  const { theme } = useTheme();
  const themeColors = getThemeStyles(theme, 'colors');

  const talentCount = movies.reduce((acc, movie) => {
    const talents = type === 'directors' ? (movie.directors || []) : (movie.cast || []);
    talents.forEach(talent => {
      if (typeof talent === 'string') {
        acc[talent] = (acc[talent] || 0) + 1;
      }
    });
    return acc;
  }, {});

  const sortedTalent = Object.entries(talentCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const data = {
    labels: sortedTalent.map(([name]) => name.length > 15 ? name.substring(0, 12) + '...' : name),
    datasets: [{
      label: `Number of Movies`,
      data: sortedTalent.map(([, count]) => count),
      backgroundColor: `${themeColors.primary}80`,
      borderColor: themeColors.primary,
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: themeColors.primary,
      hoverBorderWidth: 3
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: themeColors.surface,
        titleColor: themeColors.text,
        bodyColor: themeColors.text,
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (context) => sortedTalent[context[0].dataIndex][0],
          label: (context) => `${context.raw} movies`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: themeColors.textMuted,
          font: { size: 11 }
        },
        grid: {
          color: `${themeColors.border}50`,
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: themeColors.textMuted,
          font: { size: 11, weight: '500' }
        },
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  const title = type === 'directors' ? 'Top Directors' : 'Top Actors';
  const subtitle = `Most prolific ${type} in your search results`;

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-subtitle">{subtitle}</p>
      </div>
      <div className="chart-wrapper" style={{ height: '400px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

// Release Years vs Genres Heatmap (simplified for Chart.js)
export const YearGenreHeatmap = ({ movies = [] }) => {
  const { theme } = useTheme();
  const themeColors = getThemeStyles(theme, 'colors');

  // Group movies by decade and genre
  const heatmapData = {};
  movies.forEach(movie => {
    const year = parseInt(movie.year);
    if (!year) return;
    
    const decade = Math.floor(year / 10) * 10;
    (movie.genres || []).forEach(genre => {
      const key = `${decade}-${genre}`;
      heatmapData[key] = (heatmapData[key] || 0) + 1;
    });
  });

  // Get top genres and decades
  const genreCount = {};
  const decadeCount = {};
  
  Object.keys(heatmapData).forEach(key => {
    const [decade, genre] = key.split('-');
    genreCount[genre] = (genreCount[genre] || 0) + heatmapData[key];
    decadeCount[decade] = (decadeCount[decade] || 0) + heatmapData[key];
  });

  const topGenres = Object.entries(genreCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([genre]) => genre);

  const topDecades = Object.keys(decadeCount)
    .filter(decade => parseInt(decade) > 0)
    .sort((a, b) => parseInt(a) - parseInt(b));

  // Create bubble chart data
  const bubbleData = [];
  topDecades.forEach((decade, decadeIndex) => {
    topGenres.forEach((genre, genreIndex) => {
      const key = `${decade}-${genre}`;
      const count = heatmapData[key] || 0;
      if (count > 0) {
        bubbleData.push({
          x: decadeIndex,
          y: genreIndex,
          r: Math.sqrt(count) * 3 + 5
        });
      }
    });
  });

  const data = {
    datasets: [{
      label: 'Movies',
      data: bubbleData,
      backgroundColor: `${themeColors.primary}60`,
      borderColor: themeColors.primary,
      borderWidth: 2,
      hoverBackgroundColor: themeColors.primary,
      hoverBorderWidth: 3
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: themeColors.surface,
        titleColor: themeColors.text,
        bodyColor: themeColors.text,
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: () => 'Movie Distribution',
          label: (context) => {
            const decade = topDecades[Math.round(context.raw.x)];
            const genre = topGenres[Math.round(context.raw.y)];
            const count = Math.round((context.raw.r - 5) / 3) ** 2;
            return `${decade}s ${genre}: ${count} movies`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: -0.5,
        max: topDecades.length - 0.5,
        ticks: {
          stepSize: 1,
          callback: (value) => topDecades[value] ? `${topDecades[value]}s` : '',
          color: themeColors.textMuted,
          font: { size: 11 }
        },
        grid: {
          color: `${themeColors.border}30`
        },
        title: {
          display: true,
          text: 'Decades',
          color: themeColors.text,
          font: { size: 13, weight: 'bold' }
        }
      },
      y: {
        type: 'linear',
        min: -0.5,
        max: topGenres.length - 0.5,
        ticks: {
          stepSize: 1,
          callback: (value) => topGenres[value] || '',
          color: themeColors.textMuted,
          font: { size: 11 }
        },
        grid: {
          color: `${themeColors.border}30`
        },
        title: {
          display: true,
          text: 'Genres',
          color: themeColors.text,
          font: { size: 13, weight: 'bold' }
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutElastic'
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Genre-Decade Distribution</h3>
        <p className="chart-subtitle">Bubble size represents movie count</p>
      </div>
      <div className="chart-wrapper" style={{ height: '400px' }}>
        <Bar data={data} options={options} type="bubble" />
      </div>
    </div>
  );
};
