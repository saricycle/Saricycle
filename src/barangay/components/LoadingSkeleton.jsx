import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ 
  type = 'text', 
  width = '100%', 
  height = '20px', 
  rows = 1,
  className = '' 
}) => {
  if (type === 'card') {
    return (
      <div className={`skeleton-card ${className}`}>
        <div className="skeleton-card-header">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton-card-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
        </div>
        <div className="skeleton-card-body">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`skeleton-table ${className}`}>
        <div className="skeleton-table-header">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton skeleton-table-cell"></div>
          ))}
        </div>
        <div className="skeleton-table-body">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="skeleton-table-row">
              {Array.from({ length: 6 }).map((_, cellIndex) => (
                <div key={cellIndex} className="skeleton skeleton-table-cell"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className={`skeleton-stats ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton-stat-card">
            <div className="skeleton skeleton-stat-icon"></div>
            <div className="skeleton-stat-content">
              <div className="skeleton skeleton-stat-title"></div>
              <div className="skeleton skeleton-stat-number"></div>
              <div className="skeleton skeleton-stat-subtitle"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{ width, height }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;