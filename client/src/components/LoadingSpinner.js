import React from 'react';
import '../styles/LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', type = 'spinner' }) => {
  if (type === 'shimmer') {
    return <ShimmerLoader />;
  }

  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export const ShimmerLoader = () => {
  return (
    <div className="shimmer-container">
      <div className="shimmer-grid">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="shimmer-card">
            <div className="shimmer-poster"></div>
            <div className="shimmer-content">
              <div className="shimmer-line shimmer-title"></div>
              <div className="shimmer-line shimmer-year"></div>
              <div className="shimmer-line shimmer-genre"></div>
              <div className="shimmer-line shimmer-plot"></div>
              <div className="shimmer-line shimmer-plot short"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const InlineSpinner = ({ size = 'small' }) => {
  return (
    <div className={`inline-spinner ${size}`}>
      <div className="spinner-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
