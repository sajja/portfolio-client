import React, { useState, useEffect } from 'react';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import TransactionModal from './TransactionModal';
import DividendModal from './DividendModal';
import DividendInfoModal from './DividendInfoModal';
import './holdings.css';

const Holdings = ({ onBack }) => {
  const [holdings, setHoldings] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDividendModal, setShowDividendModal] = useState(false);
  const [showDividendInfoModal, setShowDividendInfoModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [commentValue, setCommentValue] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch equity portfolio data
      const [holdingsResponse, summaryResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/portfolio/equity'),
        fetch('http://localhost:3000/api/v1/portfolio/summary')
      ]);
      
      if (!holdingsResponse.ok || !summaryResponse.ok) {
        throw new Error(`HTTP error! Holdings: ${holdingsResponse.status}, Summary: ${summaryResponse.status}`);
      }
      
      const [holdingsData, summaryData] = await Promise.all([
        holdingsResponse.json(),
        summaryResponse.json()
      ]);
      
      // Transform holdings data
      const transformedHoldings = holdingsData.stocks.map((stock, index) => {
        const calculatedMarketValue = stock.qtty * stock.lastTradedPrice;
        const marketValue = calculatedMarketValue === 0 ? 1000 : calculatedMarketValue;
         
        return {
          id: index + 1,
          symbol: stock.symbol,
          shares: stock.qtty,
          avgPrice: stock.avg_price,
          currentPrice: stock.lastTradedPrice,
          marketValue: marketValue,
          gainLoss: (stock.lastTradedPrice - stock.avg_price) * stock.qtty,
          gainLossPercent: ((stock.lastTradedPrice - stock.avg_price) / stock.avg_price) * 100,
          date: stock.date,
          comment: stock.comment
        };
      });
      
      setHoldings(transformedHoldings);
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

  // Comment editing functions
  const handleCommentEdit = (symbol, currentComment) => {
    setEditingComment(symbol);
    setCommentValue(currentComment || '');
  };

  const handleCommentSave = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/equity/${symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentValue })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setHoldings(prev => 
        prev.map(holding => 
          holding.symbol === symbol 
            ? { ...holding, comment: commentValue }
            : holding
        )
      );

      setEditingComment(null);
      setCommentValue('');
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment. Please try again.');
    }
  };

  const handleCommentCancel = () => {
    setEditingComment(null);
    setCommentValue('');
  };

  const handleCommentKeyPress = (e, symbol) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommentSave(symbol);
    } else if (e.key === 'Escape') {
      handleCommentCancel();
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

  const formatPositionSizing = (percent) => {
    return `${percent.toFixed(2)}%`;
  };

  // Helper function to determine CSS class based on gain percentage
  const getGainLossClass = (gainLoss, gainLossPercent) => {
    if (gainLoss < 0) {
      return 'negative';
    } else if (gainLossPercent >= 100) {
      return 'exceptional-appreciation';
    } else if (gainLossPercent >= 60) {
      return 'strong-positive';
    } else if (gainLossPercent >= 50) {
      return 'very-high-appreciation';
    } else if (gainLossPercent >= 30) {
      return 'high-appreciation';
    } else if (gainLossPercent > 0 && gainLossPercent < 30) {
      return 'low-appreciation';
    } else {
      return 'positive';
    }
  };

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button onClick={onBack} className="back-button">
            ← Back to Portfolio
          </button>
          <h2>Equity Holdings</h2>
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
          <h2>Equity Holdings</h2>
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
          <h2>Equity Holdings</h2>
          <button 
            className="dividend-info-btn" 
            onClick={handleDividendInfoClick}
            title="View Dividend Information"
          >
            📈
          </button>
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

      {/* Equity Content */}
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
                <th>PS</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const originalInvestment = holding.shares * holding.avgPrice;
                const totalOriginalInvestment = totalMarketValue - totalGainLoss;
                const positionSizing = totalOriginalInvestment > 0 ? (originalInvestment / totalOriginalInvestment) * 100 : 0;

                return (
                  <tr key={holding.id}>
                    <td className="symbol" onClick={() => handleRowClick(holding.symbol)}>{holding.symbol}</td>
                    <td onClick={() => handleRowClick(holding.symbol)}>{holding.shares}</td>
                    <td onClick={() => handleRowClick(holding.symbol)}>{formatCurrency(holding.avgPrice)}</td>
                    <td onClick={() => handleRowClick(holding.symbol)}>{formatCurrency(holding.currentPrice)}</td>
                    <td onClick={() => handleRowClick(holding.symbol)}>{formatCurrency(holding.marketValue)}</td>
                    <td className={getGainLossClass(holding.gainLoss, holding.gainLossPercent)} onClick={() => handleRowClick(holding.symbol)}>
                      {formatCurrency(holding.gainLoss)}
                    </td>
                    <td className={getGainLossClass(holding.gainLoss, holding.gainLossPercent)} onClick={() => handleRowClick(holding.symbol)}>
                      {formatPercent(holding.gainLossPercent)}
                    </td>
                    <td className={positionSizing > 10 ? 'ps-high' : ''} onClick={() => handleRowClick(holding.symbol)}>{formatPositionSizing(positionSizing)}</td>
                    <td className="comment-cell" onClick={(e) => e.stopPropagation()}>
                      {editingComment === holding.symbol ? (
                        <div className="comment-edit-container">
                          <input
                            type="text"
                            value={commentValue}
                            onChange={(e) => setCommentValue(e.target.value)}
                            onKeyDown={(e) => handleCommentKeyPress(e, holding.symbol)}
                            onBlur={() => handleCommentSave(holding.symbol)}
                            placeholder="Add a note..."
                            className="comment-input"
                            autoFocus
                          />
                          <div className="comment-actions">
                            <button 
                              onClick={() => handleCommentSave(holding.symbol)}
                              className="comment-save-btn"
                              title="Save (Enter)"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={handleCommentCancel}
                              className="comment-cancel-btn"
                              title="Cancel (Esc)"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="comment-display"
                          onClick={() => handleCommentEdit(holding.symbol, holding.comment)}
                          title="Click to edit note"
                        >
                          {holding.comment || (
                            <span className="comment-placeholder">Add note...</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
};

export default Holdings;
