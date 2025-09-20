import React, { useState, useEffect } from 'react';
import Holdings from './Holdings';
import FixedDeposits from './FixedDeposits';
import IndexFunds from './IndexFunds';
import FXAccounts from './FXAccounts';
import OtherIncome from './OtherIncome';
import './holdings.css';

const Portfolio = () => {
  const [currentView, setCurrentView] = useState('portfolio');
  const [portfolioData, setPortfolioData] = useState({
    equity: { value: 0, count: 0 },
    fixedDeposits: { value: 0, count: 0 },
    fx: { value: 0, count: 0 },
    indexFunds: { value: 0, count: 0 },
    otherIncome: { value: 0, count: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch all portfolio data in parallel
      const [equityResponse, fdResponse, fxResponse, indexFundsResponse, otherIncomeResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/portfolio/equity').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/fd').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/fx').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/index-funds').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/other-income').catch(() => ({ ok: false }))
      ]);
      
      let equityData = { stocks: [] };
      let fdData = { fixedDeposits: [] };
      let fxData = { fxDeposits: [] };
      let indexFundsData = { funds: [] };
      let otherIncomeData = { incomes: [] };
      
      if (equityResponse.ok) {
        equityData = await equityResponse.json();
      }
      
      if (fdResponse.ok) {
        fdData = await fdResponse.json();
      }
      
      if (fxResponse.ok) {
        fxData = await fxResponse.json();
      }
      
      if (indexFundsResponse.ok) {
        indexFundsData = await indexFundsResponse.json();
      }
      
      if (otherIncomeResponse.ok) {
        otherIncomeData = await otherIncomeResponse.json();
      }
      
      // Calculate equity value
      const equityValue = equityData.stocks.reduce((sum, stock) => {
        return sum + (stock.qtty * stock.lastTradedPrice);
      }, 0);
      
      // Calculate fixed deposits value
      const fdValue = (fdData.fixedDeposits || []).reduce((sum, fd) => {
        return sum + (fd.maturityValue || fd.principalAmount || 0);
      }, 0);
      
      // Calculate FX value (using amounts directly as USD)
      const fxValue = (fxData.fxDeposits || []).reduce((sum, fx) => {
        return sum + (fx.amount || 0);
      }, 0);
      
      // Calculate index funds value
      const indexFundsValue = (indexFundsData.funds || []).reduce((sum, fund) => {
        return sum + ((fund.units || 0) * (fund.currentPrice || fund.nav || 0));
      }, 0);
      
      // Calculate other income value
      const otherIncomeValue = (otherIncomeData.incomes || []).reduce((sum, income) => {
        return sum + (income.amount || income.value || 0);
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
          count: (fxData.fxDeposits || []).length 
        },
        indexFunds: {
          value: indexFundsValue,
          count: (indexFundsData.funds || []).length
        },
        otherIncome: {
          value: otherIncomeValue,
          count: (otherIncomeData.incomes || []).length
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
  const totalPortfolioValue = portfolioData.equity.value + portfolioData.fixedDeposits.value + portfolioData.fx.value + portfolioData.indexFunds.value + portfolioData.otherIncome.value;
  const equityAllocation = totalPortfolioValue > 0 ? (portfolioData.equity.value / totalPortfolioValue) * 100 : 0;
  const fdAllocation = totalPortfolioValue > 0 ? (portfolioData.fixedDeposits.value / totalPortfolioValue) * 100 : 0;
  const fxAllocation = totalPortfolioValue > 0 ? (portfolioData.fx.value / totalPortfolioValue) * 100 : 0;
  const indexFundsAllocation = totalPortfolioValue > 0 ? (portfolioData.indexFunds.value / totalPortfolioValue) * 100 : 0;
  const otherIncomeAllocation = totalPortfolioValue > 0 ? (portfolioData.otherIncome.value / totalPortfolioValue) * 100 : 0;

  if (currentView === 'holdings') {
    return <Holdings onBack={() => setCurrentView('portfolio')} />;
  }

  if (currentView === 'fixed-deposits') {
    return <FixedDeposits onBack={() => setCurrentView('portfolio')} />;
  }

  if (currentView === 'index-funds') {
    return <IndexFunds onBack={() => setCurrentView('portfolio')} />;
  }

  if (currentView === 'fx-accounts') {
    return <FXAccounts onBack={() => setCurrentView('portfolio')} />;
  }

  if (currentView === 'other-income') {
    return <OtherIncome onBack={() => setCurrentView('portfolio')} />;
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
                    <span className="asset-type">Index Funds</span>
                    <span className="allocation-percent">{formatPercent(indexFundsAllocation)}</span>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill index-funds-fill" 
                      style={{ width: `${indexFundsAllocation}%` }}
                    ></div>
                  </div>
                  <div className="allocation-details">
                    <span className="allocation-value">{formatCurrency(portfolioData.indexFunds.value)}</span>
                    <span className="allocation-count">{portfolioData.indexFunds.count} funds</span>
                  </div>
                </div>
                
                <div className="allocation-item">
                  <div className="allocation-header">
                    <span className="asset-type">Other Income</span>
                    <span className="allocation-percent">{formatPercent(otherIncomeAllocation)}</span>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill other-income-fill" 
                      style={{ width: `${otherIncomeAllocation}%` }}
                    ></div>
                  </div>
                  <div className="allocation-details">
                    <span className="allocation-value">{formatCurrency(portfolioData.otherIncome.value)}</span>
                    <span className="allocation-count">{portfolioData.otherIncome.count} sources</span>
                  </div>
                </div>
                
                <div className="allocation-item">
                  <div className="allocation-header">
                    <span className="asset-type">FX Deposits</span>
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
                    <span className="allocation-count">{portfolioData.fx.count} deposits</span>
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
            
            <div className="stat-card" onClick={() => setCurrentView('index-funds')}>
              <h4>Index Funds</h4>
              <div className="stat-numbers">
                <span className="stat-count">{portfolioData.indexFunds.count} funds</span>
                <span className="stat-value">{formatCurrency(portfolioData.indexFunds.value)}</span>
                <span className="stat-change">{formatPercent(indexFundsAllocation)} of portfolio</span>
              </div>
              <span className="click-hint">Click to view →</span>
            </div>
            
            <div className="stat-card" onClick={() => setCurrentView('fx-accounts')}>
              <h4>FX Deposits</h4>
              <div className="stat-numbers">
                <span className="stat-count">{portfolioData.fx.count} deposits</span>
                <span className="stat-value">{formatCurrency(portfolioData.fx.value)}</span>
                <span className="stat-change">{formatPercent(fxAllocation)} of portfolio</span>
              </div>
              <span className="click-hint">Click to view →</span>
            </div>
            
            <div className="stat-card" onClick={() => setCurrentView('other-income')}>
              <h4>Other Income</h4>
              <div className="stat-numbers">
                <span className="stat-count">{portfolioData.otherIncome.count} sources</span>
                <span className="stat-value">{formatCurrency(portfolioData.otherIncome.value)}</span>
                <span className="stat-change">{formatPercent(otherIncomeAllocation)} of portfolio</span>
              </div>
              <span className="click-hint">Click to view →</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
