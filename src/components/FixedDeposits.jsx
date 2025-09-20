import React, { useState, useEffect } from 'react';
import FixedDepositModal from './FixedDepositModal';
import './holdings.css';

const FixedDeposits = ({ onBack }) => {
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFixedDepositModal, setShowFixedDepositModal] = useState(false);

  const fetchFixedDeposits = async () => {
    try {
      setLoading(true);
      
      const fdResponse = await fetch('http://localhost:3000/api/v1/portfolio/fd');
      
      if (!fdResponse.ok) {
        throw new Error(`HTTP error! Status: ${fdResponse.status}`);
      }
      
      const fdData = await fdResponse.json();
      
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
      
      setFixedDeposits(transformedFDs);
    } catch (err) {
      console.error('Error fetching fixed deposits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixedDeposits();
  }, []);

  const handleAddFDClick = () => {
    setShowFixedDepositModal(true);
  };

  const handleFixedDepositModalClose = (success) => {
    setShowFixedDepositModal(false);
    if (success) {
      fetchFixedDeposits(); // Refresh the data
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.currentValue, 0);
  const totalInterestEarned = fixedDeposits.reduce((sum, fd) => sum + fd.interestEarned, 0);
  const averageInterestRate = fixedDeposits.length > 0 
    ? fixedDeposits.reduce((sum, fd) => sum + fd.interestRate, 0) / fixedDeposits.length
    : 0;

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>Fixed Deposits</h2>
        </div>
        <div className="loading">Loading fixed deposits...</div>
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
          <h2>Fixed Deposits</h2>
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
        <h2>Fixed Deposits</h2>
      </div>

      {/* Fixed Deposits Summary */}
      <div className="fd-summary">
        <div className="summary-card">
          <h3>Total FD Value</h3>
          <p className="total-value">{formatCurrency(totalFDValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Interest Earned</h3>
          <p className="interest-earned positive">{formatCurrency(totalInterestEarned)}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Deposits</h3>
          <p className="fd-count">{fixedDeposits.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Interest Rate</h3>
          <p className="interest-rate">{averageInterestRate.toFixed(2)}%</p>
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

      {/* Fixed Deposits Table */}
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

      {/* Fixed Deposit Modal */}
      <FixedDepositModal
        isOpen={showFixedDepositModal}
        onClose={handleFixedDepositModalClose}
      />
    </div>
  );
};

export default FixedDeposits;
