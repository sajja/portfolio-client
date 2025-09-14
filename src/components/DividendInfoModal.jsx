import React from 'react';
import './modal.css';

const DividendInfoModal = ({ isOpen, onClose, holdings }) => {
  // Generate dummy dividend data
  const generateDummyDividendData = () => {
    // Portfolio-wide dividend summary for different periods
    const portfolioSummary = {
      sixMonths: {
        period: '6 Months',
        totalDividends: Math.random() * 1500 + 500, // $500-$2000 range
        averageMonthlyYield: Math.random() * 1.5 + 1.0, // 1.0%-2.5% range
        stocksCount: Math.floor(Math.random() * 5) + 8, // 8-13 stocks paid
        paymentsCount: Math.floor(Math.random() * 15) + 20 // 20-35 payments
      },
      twelveMonths: {
        period: '12 Months',
        totalDividends: Math.random() * 3500 + 1200, // $1200-$4700 range
        averageMonthlyYield: Math.random() * 1.8 + 1.2, // 1.2%-3.0% range
        stocksCount: Math.floor(Math.random() * 7) + 12, // 12-19 stocks paid
        paymentsCount: Math.floor(Math.random() * 35) + 45 // 45-80 payments
      },
      twentyFourMonths: {
        period: '24 Months',
        totalDividends: Math.random() * 8000 + 2500, // $2500-$10500 range
        averageMonthlyYield: Math.random() * 2.2 + 1.5, // 1.5%-3.7% range
        stocksCount: Math.floor(Math.random() * 10) + 15, // 15-25 stocks paid
        paymentsCount: Math.floor(Math.random() * 75) + 90 // 90-165 payments
      }
    };

    // Individual stock dividend data
    const stockDividends = holdings.map(holding => {
      const hasRecentDividends = Math.random() > 0.3; // 70% chance of having dividends
      
      if (!hasRecentDividends) {
        return {
          symbol: holding.symbol,
          shares: holding.shares,
          quarterlyDividend: 0,
          annualYield: 0,
          lastPayment: null,
          nextExpected: null,
          paymentHistory: []
        };
      }

      const quarterlyDividend = Math.random() * 3 + 0.5; // $0.50-$3.50 per share
      const annualYield = Math.random() * 4 + 1; // 1%-5% annual yield
      
      return {
        symbol: holding.symbol,
        shares: holding.shares,
        quarterlyDividend,
        annualYield,
        lastPayment: {
          date: new Date(2025, 7, Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
          amount: quarterlyDividend * holding.shares
        },
        nextExpected: new Date(2025, 10, Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
        paymentHistory: ['Aug 2025', 'May 2025', 'Feb 2025', 'Nov 2024'].map((month, index) => ({
          month,
          amount: (quarterlyDividend + (Math.random() - 0.5) * 0.2) * holding.shares,
          perShare: quarterlyDividend + (Math.random() - 0.5) * 0.2
        }))
      };
    }).filter(stock => stock.quarterlyDividend > 0); // Only show dividend-paying stocks

    return { portfolioSummary, stockDividends };
  };

  const { portfolioSummary, stockDividends } = generateDummyDividendData();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent.toFixed(2)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="dividend-info-modal">
      <div className="modal-content dividend-info-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>📊 Dividend Summary</h2>
        
        {/* Portfolio Summary Section */}
        <div className="dividend-section">
          <div className="portfolio-summary-grid">
            {Object.values(portfolioSummary).map((summary, index) => (
              <div key={index} className="period-summary-card">
                <div className="period-header">{summary.period}</div>
                <div className="summary-metrics">
                  <div className="summary-metric">
                    <span className="metric-label">Total Dividends</span>
                    <span className="metric-value total-amount">{formatCurrency(summary.totalDividends)}</span>
                  </div>
                  <div className="summary-metric">
                    <span className="metric-label">Avg Monthly Yield</span>
                    <span className="metric-value yield-value">{formatPercent(summary.averageMonthlyYield)}</span>
                  </div>
                  <div className="summary-metric">
                    <span className="metric-label">Paying Stocks</span>
                    <span className="metric-value stocks-count">{summary.stocksCount}</span>
                  </div>
                  <div className="summary-metric">
                    <span className="metric-label">Total Payments</span>
                    <span className="metric-value payments-count">{summary.paymentsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Stock Dividends */}
        <div className="dividend-section">
          <h3>Individual Stock Dividend Information</h3>
          {stockDividends.length > 0 ? (
            <div className="stock-dividends-container">
              {stockDividends.map((stock, index) => (
                <div key={index} className="stock-dividend-card">
                  <div className="stock-header">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-shares">{stock.shares.toLocaleString()} shares</span>
                  </div>
                  
                  <div className="dividend-metrics">
                    <div className="metric">
                      <span className="metric-label">Quarterly Dividend</span>
                      <span className="metric-value">{formatCurrency(stock.quarterlyDividend)}/share</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Annual Yield</span>
                      <span className="metric-value yield-highlight">{formatPercent(stock.annualYield)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Last Payment</span>
                      <span className="metric-value">
                        {stock.lastPayment.date} - {formatCurrency(stock.lastPayment.amount)}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Next Expected</span>
                      <span className="metric-value next-payment">{stock.nextExpected}</span>
                    </div>
                  </div>

                  <div className="payment-history">
                    <h4>Recent Payments</h4>
                    <div className="payment-history-grid">
                      {stock.paymentHistory.map((payment, pIndex) => (
                        <div key={pIndex} className="payment-item">
                          <span className="payment-month">{payment.month}</span>
                          <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                          <span className="payment-per-share">({formatCurrency(payment.perShare)}/share)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-dividends">
              <p>No dividend-paying stocks found in your portfolio.</p>
              <small>Consider adding dividend-paying stocks to generate passive income!</small>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="dividend-section">
          <h3>Summary Statistics</h3>
          <div className="summary-stats">
            <div className="stat-card">
              <span className="stat-value">
                {formatCurrency(portfolioSummary.sixMonths.totalDividends)}
              </span>
              <span className="stat-label">Total 6M Dividends</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {formatPercent(portfolioSummary.twelveMonths.averageMonthlyYield)}
              </span>
              <span className="stat-label">12M Average Yield</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stockDividends.length}</span>
              <span className="stat-label">Dividend-Paying Stocks</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {formatCurrency(stockDividends.reduce((sum, stock) => sum + (stock.quarterlyDividend * stock.shares * 4), 0))}
              </span>
              <span className="stat-label">Projected Annual Income</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DividendInfoModal;
