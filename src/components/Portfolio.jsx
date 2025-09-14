import React, { useState, useEffect } from 'react';
import Holdings from './Holdings';
import FixedDeposits from './FixedDeposits';
import './holdings.css';

const Portfolio = () => {
  const [currentView, setCurrentView] = useState('portfolio');
  const [portfolioData, setPortfolioData] = useState({
    equity: { value: 0, count: 0 },
    fixedDeposits: { value: 0, count: 0 },
    fx: { value: 0, count: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch all portfolio data in parallel
      const [equityResponse, fdResponse, fxResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/portfolio/equity').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/fd').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/fx-accounts').catch(() => ({ ok: false }))
      ]);
      
      let equityData = { stocks: [] };
      let fdData = { fixedDeposits: [] };
      let fxData = { accounts: [] };
      
      if (equityResponse.ok) {
        equityData = await equityResponse.json();
      }
      
      if (fdResponse.ok) {
        fdData = await fdResponse.json();
      }
      
      if (fxResponse.ok) {
        fxData = await fxResponse.json();
      }
      
      // Calculate equity value
      const equityValue = equityData.stocks.reduce((sum, stock) => {
        return sum + (stock.qtty * stock.lastTradedPrice);
      }, 0);
      
      // Calculate fixed deposits value
      const fdValue = (fdData.fixedDeposits || []).reduce((sum, fd) => {
        return sum + (fd.maturityValue || fd.principalAmount || 0);
      }, 0);
      
      // Calculate FX value (assuming in USD)
      const fxValue = (fxData.accounts || []).reduce((sum, fx) => {
        return sum + ((fx.balance || 0) * (fx.exchange_rate || 1));
      }, 0);
      
      setPortfolioData({
        equity: { 
          value: equityValue, 
          count: equityData.stocks.length 
        },
        fixedDeposits: { 
          value: fdValue, 
          count: (fdData.fixedDeposits || []).length 
        },
        fx: { 
          value: fxValue, 
          count: (fxData.accounts || []).length 
        }
      });
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent.toFixed(1)}%`;
  };

  // Calculate totals and allocations
  const totalPortfolioValue = portfolioData.equity.value + portfolioData.fixedDeposits.value + portfolioData.fx.value;
  const equityAllocation = totalPortfolioValue > 0 ? (portfolioData.equity.value / totalPortfolioValue) * 100 : 0;
  const fdAllocation = totalPortfolioValue > 0 ? (portfolioData.fixedDeposits.value / totalPortfolioValue) * 100 : 0;
  const fxAllocation = totalPortfolioValue > 0 ? (portfolioData.fx.value / totalPortfolioValue) * 100 : 0;

  if (currentView === 'holdings') {
    return <Holdings onBack={() => setCurrentView('portfolio')} />;
  }

  if (currentView === 'fixed-deposits') {
    return <FixedDeposits onBack={() => setCurrentView('portfolio')} />;
  }

  return (
    <div className="portfolio-container">
      <h2>Portfolio Overview</h2>
      
      {loading ? (
        <div className="loading-container">
          <p>Loading portfolio data...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error loading portfolio: {error}</p>
          <button onClick={fetchPortfolioData} className="retry-button">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div className="portfolio-overview">
            <div className="summary-card-large">
              <h3>Total Portfolio Value</h3>
              <p className="total-value-large">{formatCurrency(totalPortfolioValue)}</p>
            </div>
            
            {/* Asset Allocation */}
            <div className="asset-allocation">
              <h3>Asset Allocation</h3>
              <div className="allocation-grid">
                <div className="allocation-item">
                  <div className="allocation-header">
                    <span className="asset-type">Equity Holdings</span>
                    <span className="allocation-percent">{formatPercent(equityAllocation)}</span>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill equity-fill" 
                      style={{ width: `${equityAllocation}%` }}
                    ></div>
                  </div>
                  <div className="allocation-details">
                    <span className="allocation-value">{formatCurrency(portfolioData.equity.value)}</span>
                    <span className="allocation-count">{portfolioData.equity.count} holdings</span>
                  </div>
                </div>
                
                <div className="allocation-item">
                  <div className="allocation-header">
                    <span className="asset-type">Fixed Deposits</span>
                    <span className="allocation-percent">{formatPercent(fdAllocation)}</span>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill fd-fill" 
                      style={{ width: `${fdAllocation}%` }}
                    ></div>
                  </div>
                  <div className="allocation-details">
                    <span className="allocation-value">{formatCurrency(portfolioData.fixedDeposits.value)}</span>
                    <span className="allocation-count">{portfolioData.fixedDeposits.count} deposits</span>
                  </div>
                </div>
                
                <div className="allocation-item">
                  <div className="allocation-header">
                    <span className="asset-type">FX Accounts</span>
                    <span className="allocation-percent">{formatPercent(fxAllocation)}</span>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill fx-fill" 
                      style={{ width: `${fxAllocation}%` }}
                    ></div>
                  </div>
                  <div className="allocation-details">
                    <span className="allocation-value">{formatCurrency(portfolioData.fx.value)}</span>
                    <span className="allocation-count">{portfolioData.fx.count} accounts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="quick-stats">
            <div className="stat-card" onClick={() => setCurrentView('holdings')}>
              <h4>Equity Holdings</h4>
              <div className="stat-numbers">
                <span className="stat-count">{portfolioData.equity.count} stocks</span>
                <span className="stat-value">{formatCurrency(portfolioData.equity.value)}</span>
                <span className="stat-change">{formatPercent(equityAllocation)} of portfolio</span>
              </div>
              <span className="click-hint">Click to view →</span>
            </div>
            
            <div className="stat-card" onClick={() => setCurrentView('fixed-deposits')}>
              <h4>Fixed Deposits</h4>
              <div className="stat-numbers">
                <span className="stat-count">{portfolioData.fixedDeposits.count} deposits</span>
                <span className="stat-value">{formatCurrency(portfolioData.fixedDeposits.value)}</span>
                <span className="stat-change">{formatPercent(fdAllocation)} of portfolio</span>
              </div>
              <span className="click-hint">Click to view →</span>
            </div>
            
            <div className="stat-card">
              <h4>FX Accounts</h4>
              <div className="stat-numbers">
                <span className="stat-count">{portfolioData.fx.count} accounts</span>
                <span className="stat-value">{formatCurrency(portfolioData.fx.value)}</span>
                <span className="stat-change">{formatPercent(fxAllocation)} of portfolio</span>
              </div>
              <span className="click-hint">Coming soon</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
