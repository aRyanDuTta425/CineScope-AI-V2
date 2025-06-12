import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const HeatmapChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <h3>No heatmap data available</h3>
        <p>Genre vs. Year distribution will appear here when data is loaded.</p>
      </div>
    );
  }

  // Process data for heatmap visualization
  const processedData = data.map((item, index) => ({
    x: item.year || 2000, // Default year if missing
    y: index + 1, // Use index for y-axis (genre position)
    v: item.count || 1, // Value for color intensity
    genre: item.genre || 'Unknown'
  }));

  const maxCount = Math.max(...processedData.map(d => d.v));

  const chartData = {
    datasets: [
      {
        label: 'Movies',
        data: processedData,
        backgroundColor: (context) => {
          const value = context.parsed.v;
          const intensity = value / maxCount;
          return `rgba(102, 126, 234, ${0.3 + intensity * 0.7})`;
        },
        borderColor: 'rgba(102, 126, 234, 0.8)',
        borderWidth: 1,
        pointRadius: (context) => {
          const value = context.parsed.v;
          const intensity = value / maxCount;
          return 4 + intensity * 8; // Size based on count
        },
        pointHoverRadius: (context) => {
          const value = context.parsed.v;
          const intensity = value / maxCount;
          return 6 + intensity * 10;
        }
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Genre Distribution Over Years (Heatmap)',
        color: 'var(--text-primary)',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: '600'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            const point = context[0];
            const dataPoint = processedData[point.dataIndex];
            return `${dataPoint.genre || 'Genre'} (${point.parsed.x})`;
          },
          label: function(context) {
            const dataPoint = processedData[context.dataIndex];
            return `Movies: ${dataPoint.v}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Release Year',
          color: 'var(--text-primary)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500'
          }
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          stepSize: 10
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Genres',
          color: 'var(--text-primary)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: '500'
          }
        },
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          callback: function(value, index) {
            const dataPoint = processedData[index];
            return dataPoint ? dataPoint.genre : '';
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 50;
        }
        return delay;
      }
    },
    interaction: {
      intersect: false,
      mode: 'point'
    }
  };

  return (
    <div className="chart-container">
      <Scatter data={chartData} options={options} />
    </div>
  );
};

export default HeatmapChart;
