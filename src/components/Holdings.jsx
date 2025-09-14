import React, { useState, useEffect } from 'react';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import TransactionModal from './TransactionModal';
import DividendModal from './DividendModal';
import DividendInfoModal from './DividendInfoModal';
import FixedDepositModal from './FixedDepositModal';
import './holdings.css';

const Holdings = ({ onBack }) => {
  const [holdings, setHoldings] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [fxAccounts, setFxAccounts] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [showDividendInfoModal, setShowDividendInfoModal] = useState(false);
  const [showFixedDepositModal, setShowFixedDepositModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all portfolio data in parallel
      const [holdingsResponse, summaryResponse, fdResponse, fxResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/portfolio/equity'),
        fetch('http://localhost:3000/api/v1/portfolio/summary'),
        fetch('http://localhost:3000/api/v1/portfolio/fd').catch(() => ({ ok: false })),
        fetch('http://localhost:3000/api/v1/portfolio/fx-accounts').catch(() => ({ ok: false }))
      ]);
      
      if (!holdingsResponse.ok || !summaryResponse.ok) {
        throw new Error(`HTTP error! Holdings: ${holdingsResponse.status}, Summary: ${summaryResponse.status}`);
      }
      
      const [holdingsData, summaryData] = await Promise.all([
        holdingsResponse.json(),
        summaryResponse.json()
      ]);

      // Handle optional endpoints
      let fdData = { fixedDeposits: [] };
      let fxData = { accounts: [] };
      
      if (fdResponse.ok) {
        fdData = await fdResponse.json();
      }
      
      if (fxResponse.ok) {
        fxData = await fxResponse.json();
      }
      
      // Transform holdings data
      const transformedHoldings = holdingsData.stocks.map((stock, index) => ({
        id: index + 1,
        symbol: stock.symbol,
        shares: stock.qtty,
        avgPrice: stock.avg_price,
        currentPrice: stock.lastTradedPrice,
        marketValue: stock.qtty * stock.lastTradedPrice,
        gainLoss: (stock.lastTradedPrice - stock.avg_price) * stock.qtty,
        gainLossPercent: ((stock.lastTradedPrice - stock.avg_price) / stock.avg_price) * 100,
        date: stock.date,
        comment: stock.comment
      }));

      // Transform fixed deposits data
      const transformedFDs = (fdData.fixedDeposits || []).map((fd, index) => ({
        id: fd.id || index + 1,
        bank: fd.bankName || 'Unknown Bank',
        amount: fd.principalAmount || 0,
        interestRate: fd.interestRate || 0,
        maturityPeriod: fd.maturityPeriod || 0,
        maturityValue: fd.maturityValue || 0,
        startDate: fd.startDate,
        maturityDate: fd.maturityDate,
        createdAt: fd.createdAt,
        currentValue: fd.maturityValue || fd.principalAmount || 0,
        interestEarned: (fd.maturityValue || 0) - (fd.principalAmount || 0)
      }));

      // Transform FX accounts data
      const transformedFX = (fxData.accounts || []).map((fx, index) => ({
        id: index + 1,
        currency: fx.currency || 'USD',
        balance: fx.balance || 0,
        exchangeRate: fx.exchange_rate || 1,
        usdValue: (fx.balance || 0) * (fx.exchange_rate || 1),
        lastUpdated: fx.last_updated
      }));
      
      setHoldings(transformedHoldings);
      setFixedDeposits(transformedFDs);
      setFxAccounts(transformedFX);
      setProfitSummary(summaryData.equity);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / (totalMarketValue - totalGainLoss)) * 100;

  // Calculate totals for all asset types
  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.maturityValue, 0); // Use maturity value
  const totalFXValue = fxAccounts.reduce((sum, fx) => sum + fx.usdValue, 0);
  const totalPortfolioValue = totalMarketValue + totalFDValue + totalFXValue;

  // Asset allocation percentages
  const equityAllocation = totalPortfolioValue > 0 ? (totalMarketValue / totalPortfolioValue) * 100 : 0;
  const fdAllocation = totalPortfolioValue > 0 ? (totalFDValue / totalPortfolioValue) * 100 : 0;
  const fxAllocation = totalPortfolioValue > 0 ? (totalFXValue / totalPortfolioValue) * 100 : 0;

  // Calculate profits from API data
  const calculateProfit = (investment, profitPercent) => {
    return (investment * profitPercent) / 100;
  };

  // Handle modal functions
  const handleSellClick = () => {
    setShowSellModal(true);
  };

  const handleSellModalClose = (shouldRefetch) => {
    setShowSellModal(false);
    if (shouldRefetch) {
      fetchData();
    }
  };

  const handleBuyClick = () => {
    setShowBuyModal(true);
  };

  const handleBuyModalClose = (shouldRefetch) => {
    setShowBuyModal(false);
    if (shouldRefetch) {
      fetchData();
    }
  };

  const handleRowClick = (symbol) => {
    setSelectedStock(symbol);
    setShowTransactionModal(true);
  };

  const handleTransactionModalClose = () => {
    setShowTransactionModal(false);
    setSelectedStock(null);
  };

  const handleDividendClick = () => {
    setShowDividendModal(true);
  };

  const handleDividendModalClose = (shouldRefetch) => {
    setShowDividendModal(false);
    if (shouldRefetch) {
      fetchData();
    }
  };

  const handleDividendInfoClick = () => {
    setShowDividendInfoModal(true);
  };

  const handleDividendInfoModalClose = () => {
    setShowDividendInfoModal(false);
  };

  const handleAddFDClick = () => {
    setShowFixedDepositModal(true);
  };

  const handleFixedDepositModalClose = (shouldRefetch) => {
    setShowFixedDepositModal(false);
    if (shouldRefetch) {
      fetchData();
    }
  };

  // Get profit data from API or use defaults
  const ytdProfit = profitSummary 
    ? calculateProfit(profitSummary.summary_24_months.total_investment, profitSummary.summary_24_months.profit_percent)
    : 0;
  const last12MonthsProfit = profitSummary 
    ? calculateProfit(profitSummary.summary_12_months.total_investment, profitSummary.summary_12_months.profit_percent)
    : 0;
  const last6MonthsProfit = profitSummary 
    ? calculateProfit(profitSummary.summary_6_months.total_investment, profitSummary.summary_6_months.profit_percent)
    : 0;

  const ytdProfitPercent = profitSummary ? profitSummary.summary_24_months.profit_percent : 0;
  const last12MonthsProfitPercent = profitSummary ? profitSummary.summary_12_months.profit_percent : 0;
  const last6MonthsProfitPercent = profitSummary ? profitSummary.summary_6_months.profit_percent : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // Render functions for different tabs
  const renderOverview = () => (
    <div className="overview-content">
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
                <span className="asset-type">Equity</span>
                <span className="allocation-percent">{formatPercent(equityAllocation)}</span>
              </div>
              <div className="allocation-bar">
                <div 
                  className="allocation-fill equity-fill" 
                  style={{ width: `${equityAllocation}%` }}
                ></div>
              </div>
              <span className="allocation-value">{formatCurrency(totalMarketValue)}</span>
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
              <span className="allocation-value">{formatCurrency(totalFDValue)}</span>
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
              <span className="allocation-value">{formatCurrency(totalFXValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="quick-stats">
        <div className="stat-card" onClick={() => setActiveTab('equity')}>
          <h4>Equity Holdings</h4>
          <div className="stat-numbers">
            <span className="stat-count">{holdings.length} stocks</span>
            <span className="stat-value">{formatCurrency(totalMarketValue)}</span>
            <span className={`stat-change ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalGainLoss)} ({formatPercent(totalGainLossPercent)})
            </span>
          </div>
        </div>
        
        <div className="stat-card" onClick={() => setActiveTab('fixed-deposits')}>
          <h4>Fixed Deposits</h4>
          <div className="stat-numbers">
            <span className="stat-count">{fixedDeposits.length} deposits</span>
            <span className="stat-value">{formatCurrency(totalFDValue)}</span>
            <span className="stat-change positive">
              {formatCurrency(fixedDeposits.reduce((sum, fd) => sum + fd.interestEarned, 0))} interest
            </span>
          </div>
        </div>
        
        <div className="stat-card" onClick={() => setActiveTab('fx-accounts')}>
          <h4>FX Accounts</h4>
          <div className="stat-numbers">
            <span className="stat-count">{fxAccounts.length} accounts</span>
            <span className="stat-value">{formatCurrency(totalFXValue)}</span>
            <span className="stat-change neutral">
              {fxAccounts.length} currencies
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEquityTab = () => (
    <div className="equity-content">
      <div className="holdings-summary">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <p className="total-value">{formatCurrency(totalMarketValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gain/Loss</h3>
          <p className={`gain-loss ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totalGainLoss)} ({formatPercent(totalGainLossPercent)})
          </p>
        </div>
        <div className="summary-card action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn buy-btn" onClick={handleBuyClick}>
              <span className="btn-icon">+</span>
              Buy Stock
            </button>
            <button className="action-btn sell-btn" onClick={handleSellClick}>
              <span className="btn-icon">−</span>
              Sell Stock
            </button>
            <button className="action-btn dividend-btn" onClick={handleDividendClick}>
              <span className="btn-icon">💰</span>
              Dividend
            </button>
          </div>
        </div>
      </div>

      <div className="holdings-table-container">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Shares</th>
              <th>Avg Price</th>
              <th>Current Price</th>
              <th>Market Value</th>
              <th>Gain/Loss</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.id} onClick={() => handleRowClick(holding.symbol)}>
                <td className="symbol">{holding.symbol}</td>
                <td>{holding.shares.toLocaleString()}</td>
                <td>{formatCurrency(holding.avgPrice)}</td>
                <td>{formatCurrency(holding.currentPrice)}</td>
                <td>{formatCurrency(holding.marketValue)}</td>
                <td className={`gain-loss ${holding.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(holding.gainLoss)}
                </td>
                <td className={`gain-loss ${holding.gainLossPercent >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(holding.gainLossPercent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFixedDepositsTab = () => (
    <div className="fixed-deposits-content">
      <div className="fd-summary">
        <div className="summary-card">
          <h3>Total FD Value</h3>
          <p className="total-value">{formatCurrency(totalFDValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Interest Earned</h3>
          <p className="gain-loss positive">
            {formatCurrency(fixedDeposits.reduce((sum, fd) => sum + fd.interestEarned, 0))}
          </p>
        </div>
        <div className="summary-card">
          <h3>Average Interest Rate</h3>
          <p className="interest-rate">
            {fixedDeposits.length > 0 
              ? `${(fixedDeposits.reduce((sum, fd) => sum + fd.interestRate, 0) / fixedDeposits.length).toFixed(2)}%`
              : '0.00%'
            }
          </p>
        </div>
        <div className="summary-card action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn fd-btn" onClick={handleAddFDClick}>
              <span className="btn-icon">🏦</span>
              Add Fixed Deposit
            </button>
          </div>
        </div>
      </div>

      <div className="fd-table-container">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Bank</th>
              <th>Principal Amount</th>
              <th>Interest Rate</th>
              <th>Maturity Period (Months)</th>
              <th>Maturity Value</th>
              <th>Interest Earned</th>
              <th>Start Date</th>
              <th>Maturity Date</th>
            </tr>
          </thead>
          <tbody>
            {fixedDeposits.map((fd) => (
              <tr key={fd.id}>
                <td className="bank-name">{fd.bank}</td>
                <td>{formatCurrency(fd.amount)}</td>
                <td className="interest-rate">{fd.interestRate.toFixed(2)}%</td>
                <td>{fd.maturityPeriod} months</td>
                <td className="maturity-value">{formatCurrency(fd.maturityValue)}</td>
                <td className="interest-earned positive">{formatCurrency(fd.interestEarned)}</td>
                <td>{fd.startDate ? new Date(fd.startDate).toLocaleDateString() : 'N/A'}</td>
                <td>{fd.maturityDate ? new Date(fd.maturityDate).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {fixedDeposits.length === 0 && (
          <div className="no-data">
            <p>No fixed deposits found.</p>
            <small>Add fixed deposits to track your secure investments.</small>
          </div>
        )}
      </div>
    </div>
  );

  const renderFXAccountsTab = () => (
    <div className="fx-accounts-content">
      <div className="fx-summary">
        <div className="summary-card">
          <h3>Total FX Value (USD)</h3>
          <p className="total-value">{formatCurrency(totalFXValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Currencies</h3>
          <p className="currency-count">{new Set(fxAccounts.map(fx => fx.currency)).size}</p>
        </div>
        <div className="summary-card">
          <h3>Largest Position</h3>
          <p className="largest-position">
            {fxAccounts.length > 0 
              ? formatCurrency(Math.max(...fxAccounts.map(fx => fx.usdValue)))
              : formatCurrency(0)
            }
          </p>
        </div>
      </div>

      <div className="fx-table-container">
        <table className="fx-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Balance</th>
              <th>Exchange Rate</th>
              <th>USD Value</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {fxAccounts.map((fx) => (
              <tr key={fx.id}>
                <td className="currency">{fx.currency}</td>
                <td>{fx.balance.toLocaleString()}</td>
                <td className="exchange-rate">{fx.exchangeRate.toFixed(4)}</td>
                <td className="usd-value">{formatCurrency(fx.usdValue)}</td>
                <td>{fx.lastUpdated ? new Date(fx.lastUpdated).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {fxAccounts.length === 0 && (
          <div className="no-data">
            <p>No FX accounts found.</p>
            <small>Add foreign currency accounts to track international holdings.</small>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button onClick={onBack} className="back-button">
            ← Back to Portfolio
          </button>
          <h2>Holdings</h2>
        </div>
        <div className="loading-container">
          <p>Loading holdings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button onClick={onBack} className="back-button">
            ← Back to Portfolio
          </button>
          <h2>Holdings</h2>
        </div>
        <div className="error-container">
          <p>Error loading holdings: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="holdings-container">
      <div className="holdings-header">
        <div className="header-left">
          <button onClick={onBack} className="back-button">
            ← Back to Portfolio
          </button>
          <h2>Holdings</h2>
          {activeTab === 'equity' && (
            <button 
              className="dividend-info-btn" 
              onClick={handleDividendInfoClick}
              title="View Dividend Information"
            >
              📈
            </button>
          )}
        </div>
        <div className="profit-periods">
          <div className="profit-period">
            <h4>24M Profit</h4>
            <p className={`profit-amount ${ytdProfit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(ytdProfit)}
            </p>
            <span className={`profit-percent ${ytdProfitPercent >= 0 ? 'positive' : 'negative'}`}>
              {formatPercent(ytdProfitPercent)}
            </span>
          </div>
          <div className="profit-period">
            <h4>12M Profit</h4>
            <p className={`profit-amount ${last12MonthsProfit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(last12MonthsProfit)}
            </p>
            <span className={`profit-percent ${last12MonthsProfitPercent >= 0 ? 'positive' : 'negative'}`}>
              {formatPercent(last12MonthsProfitPercent)}
            </span>
          </div>
          <div className="profit-period">
            <h4>6M Profit</h4>
            <p className={`profit-amount ${last6MonthsProfit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(last6MonthsProfit)}
            </p>
            <span className={`profit-percent ${last6MonthsProfitPercent >= 0 ? 'positive' : 'negative'}`}>
              {formatPercent(last6MonthsProfitPercent)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'equity' ? 'active' : ''}`}
          onClick={() => setActiveTab('equity')}
        >
          <span className="tab-icon">📈</span>
          Equity ({holdings.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fixed-deposits' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixed-deposits')}
        >
          <span className="tab-icon">🏦</span>
          Fixed Deposits ({fixedDeposits.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fx-accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('fx-accounts')}
        >
          <span className="tab-icon">💱</span>
          FX Accounts ({fxAccounts.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'equity' && renderEquityTab()}
        {activeTab === 'fixed-deposits' && renderFixedDepositsTab()}
        {activeTab === 'fx-accounts' && renderFXAccountsTab()}
      </div>

      {/* Modals - only show for equity tab */}
      {activeTab === 'equity' && (
        <>
          <SellModal 
            isOpen={showSellModal} 
            onClose={handleSellModalClose}
            holdings={holdings}
          />

          <BuyModal 
            isOpen={showBuyModal} 
            onClose={handleBuyModalClose}
          />

          <TransactionModal
            isOpen={showTransactionModal}
            onClose={handleTransactionModalClose}
            stockSymbol={selectedStock}
          />

          <DividendModal
            isOpen={showDividendModal}
            onClose={handleDividendModalClose}
            holdings={holdings}
          />

          <DividendInfoModal
            isOpen={showDividendInfoModal}
            onClose={handleDividendInfoModalClose}
            holdings={holdings}
          />
        </>
      )}

      {/* Fixed Deposit Modal - show for fixed-deposits tab */}
      {activeTab === 'fixed-deposits' && (
        <FixedDepositModal
          isOpen={showFixedDepositModal}
          onClose={handleFixedDepositModalClose}
        />
      )}
    </div>
  );
};

export default Holdings;
