import React, { useState } from 'react';
import Holdings from './Holdings';

const Portfolio = () => {
  const [currentView, setCurrentView] = useState('portfolio');

  if (currentView === 'holdings') {
    return <Holdings onBack={() => setCurrentView('portfolio')} />;
  }

  return (
    <div className="portfolio-container">
      <h2>Portfolio</h2>
      <p>Portfolio content coming soon...</p>
      
      {/* Placeholder for future portfolio features */}
      <div className="portfolio-content">
        <div 
          className="portfolio-section clickable" 
          onClick={() => setCurrentView('holdings')}
        >
          <h3>Holdings</h3>
          <p>Your current investment holdings will be displayed here.</p>
          <span className="click-hint">Click to view →</span>
        </div>
        
        <div className="portfolio-section">
          <h3>Performance</h3>
          <p>Portfolio performance metrics and charts will be shown here.</p>
        </div>
        
        <div className="portfolio-section">
          <h3>Analytics</h3>
          <p>Detailed analytics and insights about your portfolio.</p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
