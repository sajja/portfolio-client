import React, { useState, useEffect } from 'react';
import './holdings.css';

const Holdings = ({ onBack }) => {
  const [holdings, setHoldings] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({
    selectedStock: '',
    quantity: '',
    sellPrice: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch holdings and profit summary in parallel
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
        
        setHoldings(transformedHoldings);
        setProfitSummary(summaryData.equity);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalMarketValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / (totalMarketValue - totalGainLoss)) * 100;

  // Calculate profits from API data
  const calculateProfit = (investment, profitPercent) => {
    return (investment * profitPercent) / 100;
  };

  // Handle sell modal functions
  const handleSellClick = () => {
    setShowSellModal(true);
  };

  const handleSellModalClose = () => {
    setShowSellModal(false);
    setSellForm({
      selectedStock: '',
      quantity: '',
      sellPrice: ''
    });
  };

  const handleSellFormChange = (field, value) => {
    setSellForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSellSubmit = (e) => {
    e.preventDefault();
    const selectedHolding = holdings.find(h => h.symbol === sellForm.selectedStock);
    
    if (!selectedHolding) {
      alert('Please select a stock to sell');
      return;
    }
    
    if (!sellForm.quantity || sellForm.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (parseFloat(sellForm.quantity) > selectedHolding.shares) {
      alert(`You can only sell up to ${selectedHolding.shares} shares of ${selectedHolding.symbol}`);
      return;
    }
    
    if (!sellForm.sellPrice || sellForm.sellPrice <= 0) {
      alert('Please enter a valid sell price');
      return;
    }
    
    // Here you would typically make an API call to sell the stock
    console.log('Selling stock:', {
      symbol: sellForm.selectedStock,
      quantity: parseFloat(sellForm.quantity),
      sellPrice: parseFloat(sellForm.sellPrice),
      totalValue: parseFloat(sellForm.quantity) * parseFloat(sellForm.sellPrice)
    });
    
    alert(`Sell order submitted: ${sellForm.quantity} shares of ${sellForm.selectedStock} at $${sellForm.sellPrice} each`);
    handleSellModalClose();
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
            <button className="action-btn buy-btn" onClick={() => console.log('Buy clicked')}>
              <span className="btn-icon">+</span>
              Buy Stock
            </button>
            <button className="action-btn sell-btn" onClick={handleSellClick}>
              <span className="btn-icon">−</span>
              Sell Stock
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
              <tr key={holding.id}>
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

      {showSellModal && (
        <div className="sell-modal">
          <div className="modal-content">
            <span className="close" onClick={handleSellModalClose}>&times;</span>
            <h2>Sell Stock</h2>
            <form onSubmit={handleSellSubmit}>
              <div className="form-group">
                <label htmlFor="stock-select">Select Stock</label>
                <select
                  id="stock-select"
                  value={sellForm.selectedStock}
                  onChange={(e) => handleSellFormChange('selectedStock', e.target.value)}
                  required
                >
                  <option value="">-- Select a stock --</option>
                  {holdings.map((holding) => (
                    <option key={holding.id} value={holding.symbol}>
                      {holding.symbol} - {holding.shares} shares
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={sellForm.quantity}
                  onChange={(e) => handleSellFormChange('quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sellPrice">Sell Price</label>
                <input
                  type="number"
                  id="sellPrice"
                  value={sellForm.sellPrice}
                  onChange={(e) => handleSellFormChange('sellPrice', e.target.value)}
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Submit Sell Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holdings;
