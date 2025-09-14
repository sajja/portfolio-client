import React, { useState, useEffect } from 'react';
import './modal.css';

const DividendInfoModal = ({ isOpen, onClose, holdings }) => {
  const [dividendData, setDividendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate date ranges for different periods
  const getDateRanges = () => {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
    
    const twentyFourMonthsAgo = new Date(today);
    twentyFourMonthsAgo.setFullYear(today.getFullYear() - 2);

    return {
      sixMonths: {
        from: sixMonthsAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      },
      twelveMonths: {
        from: twelveMonthsAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      },
      twentyFourMonths: {
        from: twentyFourMonthsAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      }
    };
  };

  // Fetch dividend data from backend
  const fetchDividendData = async () => {
    if (!isOpen) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const dateRanges = getDateRanges();
      
      // Fetch data for all three periods
      const [sixMonthData, twelveMonthData, twentyFourMonthData] = await Promise.all([
        fetch(`http://localhost:3000/api/v1/portfolio/equity/dividends?from_date=${dateRanges.sixMonths.from}&to_date=${dateRanges.sixMonths.to}`),
        fetch(`http://localhost:3000/api/v1/portfolio/equity/dividends?from_date=${dateRanges.twelveMonths.from}&to_date=${dateRanges.twelveMonths.to}`),
        fetch(`http://localhost:3000/api/v1/portfolio/equity/dividends?from_date=${dateRanges.twentyFourMonths.from}&to_date=${dateRanges.twentyFourMonths.to}`)
      ]);

      if (!sixMonthData.ok || !twelveMonthData.ok || !twentyFourMonthData.ok) {
        throw new Error(`Failed to fetch dividend data. Server responded with: ${sixMonthData.status || twelveMonthData.status || twentyFourMonthData.status}`);
      }

      const [sixMonthResponse, twelveMonthResponse, twentyFourMonthResponse] = await Promise.all([
        sixMonthData.json(),
        twelveMonthData.json(),
        twentyFourMonthData.json()
      ]);

      setDividendData({
        sixMonths: sixMonthResponse,
        twelveMonths: twelveMonthResponse,
        twentyFourMonths: twentyFourMonthResponse
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dividend data:', err);
      // Fallback to dummy data on error
      const dummyData = generateDummyDividendData();
      setDividendData({
        sixMonths: { dividends: [] },
        twelveMonths: { dividends: [] },
        twentyFourMonths: { dividends: [] },
        isDummy: true,
        dummyData
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio summary from real data
  const calculatePortfolioSummary = () => {
    if (!dividendData) return {};

    const calculatePeriodSummary = (data, periodName, monthsCount) => {
      const dividends = data.dividends || [];
      const totalDividends = dividends.reduce((sum, div) => sum + div.amount, 0);
      const uniqueStocks = new Set(dividends.map(div => div.symbol));
      const averageMonthlyYield = monthsCount > 0 ? (totalDividends / monthsCount) / 1000 * 100 : 0; // Rough yield calculation
      
      return {
        period: periodName,
        totalDividends,
        averageMonthlyYield,
        stocksCount: uniqueStocks.size,
        paymentsCount: dividends.length
      };
    };

    return {
      sixMonths: calculatePeriodSummary(dividendData.sixMonths, '6 Months', 6),
      twelveMonths: calculatePeriodSummary(dividendData.twelveMonths, '12 Months', 12),
      twentyFourMonths: calculatePeriodSummary(dividendData.twentyFourMonths, '24 Months', 24)
    };
  };

  // Calculate individual stock dividend data
  const calculateStockDividends = () => {
    if (!dividendData || !holdings) return [];

    const allDividends = dividendData.twelveMonths.dividends || [];
    const stockDividendMap = new Map();

    // Group dividends by symbol
    allDividends.forEach(dividend => {
      if (!stockDividendMap.has(dividend.symbol)) {
        stockDividendMap.set(dividend.symbol, []);
      }
      stockDividendMap.get(dividend.symbol).push(dividend);
    });

    // Calculate metrics for each stock
    return Array.from(stockDividendMap.entries()).map(([symbol, dividends]) => {
      const holding = holdings.find(h => h.symbol === symbol);
      if (!holding) return null;

      const totalAmount = dividends.reduce((sum, div) => sum + div.amount, 0);
      const quarterlyDividend = totalAmount / 4; // Approximate quarterly dividend
      const annualYield = holding.currentPrice > 0 ? (totalAmount / (holding.currentPrice * holding.shares)) * 100 : 0;
      const sortedDividends = dividends.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return {
        symbol,
        shares: holding.shares,
        quarterlyDividend: quarterlyDividend / holding.shares, // Per share
        annualYield,
        lastPayment: {
          date: new Date(sortedDividends[0].date).toLocaleDateString(),
          amount: sortedDividends[0].amount
        },
        paymentHistory: sortedDividends.slice(0, 4).map(div => ({
          month: new Date(div.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: div.amount,
          perShare: div.amount / holding.shares
        }))
      };
    }).filter(stock => stock !== null);
  };

  useEffect(() => {
    fetchDividendData();
  }, [isOpen]);

  // Generate dummy dividend data as fallback
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
        paymentHistory: ['Aug 2025', 'May 2025', 'Feb 2025', 'Nov 2024'].map((month, index) => ({
          month,
          amount: (quarterlyDividend + (Math.random() - 0.5) * 0.2) * holding.shares,
          perShare: quarterlyDividend + (Math.random() - 0.5) * 0.2
        }))
      };
    }).filter(stock => stock.quarterlyDividend > 0); // Only show dividend-paying stocks

    return { portfolioSummary, stockDividends };
  };

  // Use real data if available, otherwise fallback to dummy data
  const portfolioSummary = dividendData && !dividendData.isDummy ? 
    calculatePortfolioSummary() : 
    dividendData?.dummyData?.portfolioSummary || generateDummyDividendData().portfolioSummary;
  
  const stockDividends = dividendData && !dividendData.isDummy ? 
    calculateStockDividends() : 
    dividendData?.dummyData?.stockDividends || generateDummyDividendData().stockDividends;

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
        
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dividend data...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>Unable to load dividend data from server</p>
              <small>Showing sample data instead. Error: {error}</small>
            </div>
          </div>
        )}
        
        {/* Data Display - only show when not loading */}
        {!loading && (
          <>
            {/* Data Source Indicator */}
            {dividendData?.isDummy && (
              <div className="data-source-indicator">
                <span className="demo-badge">📝 Demo Data</span>
                <small>Real dividend data unavailable - displaying sample information</small>
              </div>
            )}
            
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
                            {stock.lastPayment ? `${stock.lastPayment.date} - ${formatCurrency(stock.lastPayment.amount)}` : 'N/A'}
                          </span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default DividendInfoModal;
