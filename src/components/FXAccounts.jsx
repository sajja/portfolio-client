import React, { useState, useEffect } from 'react';
import './holdings.css';

const FXAccounts = ({ onBack }) => {
  const [fxAccounts, setFxAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFXAccounts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/v1/portfolio/fx');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform FX deposits data
      const transformedAccounts = (data.fxDeposits || []).map((deposit, index) => ({
        id: deposit.id || index + 1,
        currency: deposit.currency || 'USD',
        amount: deposit.amount || 0,
        interestRate: deposit.interestRate || 0,
        usdValue: deposit.amount || 0, // Assuming amounts are already in USD or need conversion
        bank: deposit.bankName || 'Unknown Bank',
        date: deposit.date,
        createdAt: deposit.createdAt
      }));
      
      setFxAccounts(transformedAccounts);
    } catch (err) {
      console.error('Error fetching FX accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFXAccounts();
  }, []);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate totals
  const totalUSDValue = fxAccounts.reduce((sum, account) => sum + account.usdValue, 0);
  const uniqueCurrencies = [...new Set(fxAccounts.map(account => account.currency))];
  const averageInterestRate = fxAccounts.length > 0 
    ? fxAccounts.reduce((sum, account) => sum + (account.interestRate || 0), 0) / fxAccounts.length
    : 0;

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>FX Deposits</h2>
        </div>
        <div className="loading">Loading FX deposits...</div>
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
          <h2>FX Deposits</h2>
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
        <h2>FX Deposits</h2>
      </div>

      {/* FX Accounts Summary */}
      <div className="fx-summary">
        <div className="summary-card">
          <h3>Total USD Value</h3>
          <p className="total-value">{formatCurrency(totalUSDValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Deposits</h3>
          <p className="total-value">{fxAccounts.length}</p>
        </div>
        <div className="summary-card">
          <h3>Currencies</h3>
          <p className="total-value">{uniqueCurrencies.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Interest Rate</h3>
          <p className="interest-rate">{averageInterestRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* FX Accounts Table */}
      {fxAccounts.length > 0 ? (
        <div className="fx-table-container">
          <table className="fx-table">
            <thead>
              <tr>
                <th>Bank</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Date</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {fxAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="bank-name">{account.bank}</td>
                  <td className="currency">{account.currency}</td>
                  <td className="usd-value">{formatCurrency(account.amount, account.currency)}</td>
                  <td className="interest-rate">{account.interestRate.toFixed(2)}%</td>
                  <td>{account.date ? new Date(account.date).toLocaleDateString() : 'N/A'}</td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No FX deposits found</p>
          <small>Add your first foreign exchange deposit to get started</small>
        </div>
      )}
    </div>
  );
};

export default FXAccounts;
