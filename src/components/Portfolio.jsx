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
          <h3>Equity</h3>
          <p>Your current equity holdings will be displayed here.</p>
          <span className="click-hint">Click to view →</span>
        </div>
        
        <div className="portfolio-section">
          <h3>Fixed Deposits</h3>
          <p>Your fixed deposit investments and interest tracking will be shown here.</p>
        </div>
        
        <div className="portfolio-section">
          <h3>FX Accounts</h3>
          <p>Foreign exchange accounts and currency holdings will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
