import React, { useState, useEffect } from 'react';
import './holdings.css';
import IndexFundModal from './IndexFundModal';

const IndexFunds = ({ onBack }) => {
  const [indexFunds, setIndexFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { fundId, field }
  const [editValue, setEditValue] = useState('');

  const fetchIndexFunds = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/v1/portfolio/indexfund');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform index funds data
      const transformedFunds = (data.indexFunds || []).map((fund, index) => ({
        id: fund.id || index + 1,
        fundHolder: fund.fundHolder || 'Unknown Holder',
        fundType: fund.fundType || 'Unknown Type',
        amount: fund.amount || 0,
        rate: fund.rate || 0,
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

  const handleSaveFund = async (fundData) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/portfolio/indexfund', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await fetchIndexFunds(); // Refresh the list
      setIsModalOpen(false); // Close the modal
    } catch (err) {
      console.error('Error saving index fund:', err);
      setError(err.message);
    }
  };

  const handleCellClick = (fund, field) => {
    setEditingCell({ fundId: fund.id, field });
    setEditValue(fund[field]);
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = async () => {
    if (!editingCell) return;

    const { fundId, field } = editingCell;
    const originalFund = indexFunds.find(f => f.id === fundId);
    const numericValue = parseFloat(editValue);

    if (originalFund && originalFund[field] !== numericValue && !isNaN(numericValue)) {
      const updatedFund = {
        ...originalFund,
        [field]: numericValue,
      };

      // The API for a PUT request might not need the id in the body
      delete updatedFund.id; 
      delete updatedFund.createdAt;

      try {
        const response = await fetch(`http://localhost:3000/api/v1/portfolio/indexfund/${fundId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFund),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Refresh data locally for immediate feedback
        setIndexFunds(indexFunds.map(f =>
          f.id === fundId ? { ...f, [field]: numericValue } : f
        ));

      } catch (err) {
        console.error('Error updating index fund:', err);
        setError(err.message);
        // Optionally revert state on error
      }
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent.toFixed(2)}%`;
  };

  // Calculate totals
  const totalInvestedAmount = indexFunds.reduce((sum, fund) => sum + fund.amount, 0);

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

      {isModalOpen && (
        <IndexFundModal
          onSave={handleSaveFund}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Index Funds Summary */}
      <div className="fd-summary">
        <div className="summary-card">
          <h3>Total Invested</h3>
          <p className="total-value">{formatNumber(totalInvestedAmount)}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Funds</h3>
          <p className="total-value">{indexFunds.length}</p>
        </div>
        <div className="summary-card action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setIsModalOpen(true)}>
              <span className="btn-icon">📈</span>
              Add Fund
            </button>
          </div>
        </div>
      </div>

      {/* Index Funds Table */}
      {indexFunds.length > 0 ? (
        <div className="fd-table-container">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Fund Holder</th>
                <th>Fund Type</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {indexFunds.map((fund) => (
                <tr key={fund.id}>
                  <td className="bank-name">{fund.fundHolder}</td>
                  <td>{fund.fundType}</td>
                  <td onClick={() => handleCellClick(fund, 'amount')}>
                    {editingCell?.fundId === fund.id && editingCell?.field === 'amount' ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      formatNumber(fund.amount)
                    )}
                  </td>
                  <td className="interest-rate" onClick={() => handleCellClick(fund, 'rate')}>
                    {editingCell?.fundId === fund.id && editingCell?.field === 'rate' ? (
                       <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      formatPercent(fund.rate)
                    )}
                  </td>
                  <td>{new Date(fund.createdAt).toLocaleDateString()}</td>
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
