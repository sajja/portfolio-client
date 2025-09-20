import React, { useState, useEffect } from 'react';
import './holdings.css';

const IndexFunds = ({ onBack }) => {
  const [indexFunds, setIndexFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIndexFunds = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/v1/portfolio/index-funds');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform index funds data
      const transformedFunds = (data.funds || []).map((fund, index) => ({
        id: fund.id || index + 1,
        name: fund.fundName || fund.name || 'Unknown Fund',
        units: fund.units || 0,
        nav: fund.nav || fund.currentPrice || 0,
        investedAmount: fund.investedAmount || (fund.units * fund.purchasePrice) || 0,
        currentValue: (fund.units || 0) * (fund.nav || fund.currentPrice || 0),
        gainLoss: ((fund.units || 0) * (fund.nav || fund.currentPrice || 0)) - (fund.investedAmount || (fund.units * fund.purchasePrice) || 0),
        gainLossPercent: fund.investedAmount ? (((fund.units || 0) * (fund.nav || fund.currentPrice || 0)) - fund.investedAmount) / fund.investedAmount * 100 : 0,
        category: fund.category || 'Mixed',
        amc: fund.amc || 'Unknown AMC',
        purchaseDate: fund.purchaseDate,
        createdAt: fund.createdAt
      }));
      
      setIndexFunds(transformedFunds);
    } catch (err) {
      console.error('Error fetching index funds:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexFunds();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // Calculate totals
  const totalInvestedAmount = indexFunds.reduce((sum, fund) => sum + fund.investedAmount, 0);
  const totalCurrentValue = indexFunds.reduce((sum, fund) => sum + fund.currentValue, 0);
  const totalGainLoss = indexFunds.reduce((sum, fund) => sum + fund.gainLoss, 0);
  const totalGainLossPercent = totalInvestedAmount > 0 ? (totalGainLoss / totalInvestedAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>Index Funds</h2>
        </div>
        <div className="loading">Loading index funds...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>Index Funds</h2>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="holdings-container">
      <div className="holdings-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Portfolio
        </button>
        <h2>Index Funds</h2>
      </div>

      {/* Index Funds Summary */}
      <div className="fd-summary">
        <div className="summary-card">
          <h3>Total Invested</h3>
          <p className="total-value">{formatCurrency(totalInvestedAmount)}</p>
        </div>
        <div className="summary-card">
          <h3>Current Value</h3>
          <p className="total-value">{formatCurrency(totalCurrentValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gain/Loss</h3>
          <p className={`gain-loss ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(totalGainLoss)} ({formatPercent(totalGainLossPercent)})
          </p>
        </div>
        <div className="summary-card">
          <h3>Number of Funds</h3>
          <p className="total-value">{indexFunds.length}</p>
        </div>
      </div>

      {/* Index Funds Table */}
      {indexFunds.length > 0 ? (
        <div className="fd-table-container">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Fund Name</th>
                <th>AMC</th>
                <th>Category</th>
                <th>Units</th>
                <th>Current NAV</th>
                <th>Invested Amount</th>
                <th>Current Value</th>
                <th>Gain/Loss</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {indexFunds.map((fund) => (
                <tr key={fund.id}>
                  <td className="bank-name">{fund.name}</td>
                  <td>{fund.amc}</td>
                  <td>{fund.category}</td>
                  <td>{fund.units.toLocaleString()}</td>
                  <td>{formatCurrency(fund.nav)}</td>
                  <td>{formatCurrency(fund.investedAmount)}</td>
                  <td>{formatCurrency(fund.currentValue)}</td>
                  <td className={`gain-loss ${fund.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(fund.gainLoss)}
                  </td>
                  <td className={`gain-loss ${fund.gainLossPercent >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(fund.gainLossPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No index funds found</p>
          <small>Add your first index fund investment to get started</small>
        </div>
      )}
    </div>
  );
};

export default IndexFunds;
