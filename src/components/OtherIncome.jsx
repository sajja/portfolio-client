import React, { useState, useEffect } from 'react';
import './holdings.css';

const OtherIncome = ({ onBack }) => {
  const [otherIncomes, setOtherIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOtherIncomes = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/v1/portfolio/other-income');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform other income data
      const transformedIncomes = (data.incomes || []).map((income, index) => ({
        id: income.id || index + 1,
        source: income.source || income.name || 'Unknown Source',
        type: income.type || income.category || 'Other',
        amount: income.amount || income.value || 0,
        frequency: income.frequency || 'One-time',
        description: income.description || income.note || '',
        dateReceived: income.dateReceived || income.date,
        taxable: income.taxable !== undefined ? income.taxable : true,
        createdAt: income.createdAt
      }));
      
      setOtherIncomes(transformedIncomes);
    } catch (err) {
      console.error('Error fetching other incomes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOtherIncomes();
  }, []);

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  // Calculate totals
  const totalAmount = otherIncomes.reduce((sum, income) => sum + income.amount, 0);
  const taxableAmount = otherIncomes.filter(income => income.taxable).reduce((sum, income) => sum + income.amount, 0);
  const nonTaxableAmount = totalAmount - taxableAmount;
  const uniqueTypes = [...new Set(otherIncomes.map(income => income.type))];

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>Other Income</h2>
        </div>
        <div className="loading">Loading other income...</div>
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
          <h2>Other Income</h2>
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
        <h2>Other Income</h2>
      </div>

      {/* Other Income Summary */}
      <div className="fd-summary">
        <div className="summary-card">
          <h3>Total Income</h3>
          <p className="total-value">{formatNumber(totalAmount)}</p>
        </div>
        <div className="summary-card">
          <h3>Taxable Income</h3>
          <p className="total-value">{formatNumber(taxableAmount)}</p>
        </div>
        <div className="summary-card">
          <h3>Non-Taxable Income</h3>
          <p className="total-value">{formatNumber(nonTaxableAmount)}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Sources</h3>
          <p className="total-value">{otherIncomes.length}</p>
        </div>
        <div className="summary-card">
          <h3>Income Types</h3>
          <p className="total-value">{uniqueTypes.length}</p>
        </div>
      </div>

      {/* Other Income Table */}
      {otherIncomes.length > 0 ? (
        <div className="fd-table-container">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Taxable</th>
                <th>Date Received</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {otherIncomes.map((income) => (
                <tr key={income.id}>
                  <td className="bank-name">{income.source}</td>
                  <td>{income.type}</td>
                  <td className="interest-earned">{formatNumber(income.amount)}</td>
                  <td>{income.frequency}</td>
                  <td>
                    <span className={`taxable-status ${income.taxable ? 'taxable' : 'non-taxable'}`}>
                      {income.taxable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{income.dateReceived ? new Date(income.dateReceived).toLocaleDateString() : 'N/A'}</td>
                  <td className="description">{income.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No other income sources found</p>
          <small>Add your first income source to get started</small>
        </div>
      )}
    </div>
  );
};

export default OtherIncome;
