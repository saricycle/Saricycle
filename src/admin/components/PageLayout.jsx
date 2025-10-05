import React from 'react';
import './PageLayout.css';

const PageLayout = ({ 
  title, 
  description, 
  children, 
  className = '',
  sidebar = null,
  headerActions = null 
}) => {
  return (
    <div className={`page-layout ${className}`}>
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-section">
            <h1 className="page-title">{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          {headerActions && (
            <div className="page-header-actions">
              {headerActions}
            </div>
          )}
        </div>
      </div>
      
      <div className={`page-content ${sidebar ? 'has-sidebar' : ''}`}>
        <div className="page-main">
          {children}
        </div>
        {sidebar && (
          <div className="page-sidebar">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;