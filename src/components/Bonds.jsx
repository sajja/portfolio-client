import React, { useState, useEffect } from 'react';
import './holdings.css';

// BondModal Component
const BondModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    bondType: '',
    issuer: '',
    amount: '',
    couponRate: '',
    maturityDays: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const bondTypes = [
    'Treasury Bond',
    'Corporate Debenture'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bondType.trim()) {
      newErrors.bondType = 'Type of debt instrument is required';
    }

    if (!formData.issuer.trim()) {
      newErrors.issuer = 'Authority/Issuer is required';
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid investment amount is required';
    }

    if (!formData.couponRate || isNaN(formData.couponRate) || parseFloat(formData.couponRate) < 0) {
      newErrors.couponRate = 'Valid coupon rate is required';
    }

    if (!formData.maturityDays || isNaN(formData.maturityDays) || parseInt(formData.maturityDays) <= 0) {
      newErrors.maturityDays = 'Valid maturity period in days is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate dates
      const issueDate = new Date();
      const maturityDate = new Date();
      maturityDate.setDate(maturityDate.getDate() + parseInt(formData.maturityDays));

      const bondData = {
        issuer: formData.issuer,
        bondType: formData.bondType,
        amount: parseFloat(formData.amount),
        couponRate: parseFloat(formData.couponRate),
        issueDate: issueDate.toISOString().split('T')[0],
        maturityDate: maturityDate.toISOString().split('T')[0]
      };

      console.log('Sending bond data:', bondData);

      const response = await fetch('http://localhost:3000/api/v1/portfolio/bonds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bondData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Bond added successfully:', result);

      // Success - close modal and refresh data
      onClose(true);
    } catch (error) {
      console.error('Error adding bond:', error);
      
      let errorMessage = 'Failed to add bond. Please try again.';
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000';
      } else if (error.message.includes('HTTP error!')) {
        errorMessage = `Server error: ${error.message}`;
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content bond-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Bond/Debenture</h3>
          <button onClick={handleCancel} className="close-btn">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body bond-form">
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <div className="form-group">
            <label htmlFor="bondType">Type of Debt Instrument *</label>
            <select
              id="bondType"
              name="bondType"
              value={formData.bondType}
              onChange={handleInputChange}
              className={errors.bondType ? 'error' : ''}
              required
            >
              <option value="">Select bond type...</option>
              {bondTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.bondType && <span className="field-error">{errors.bondType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="issuer">Authority/Issuer *</label>
            <input
              type="text"
              id="issuer"
              name="issuer"
              value={formData.issuer}
              onChange={handleInputChange}
              placeholder="e.g., Government of Sri Lanka, ABC Corporation Ltd"
              className={errors.issuer ? 'error' : ''}
              required
            />
            {errors.issuer && <span className="field-error">{errors.issuer}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Investment Amount (LKR) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="500000"
                min="1"
                step="1"
                className={errors.amount ? 'error' : ''}
                required
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="couponRate">Coupon Rate (%) *</label>
              <input
                type="number"
                id="couponRate"
                name="couponRate"
                value={formData.couponRate}
                onChange={handleInputChange}
                placeholder="8.5"
                min="0"
                step="0.1"
                className={errors.couponRate ? 'error' : ''}
                required
              />
              {errors.couponRate && <span className="field-error">{errors.couponRate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="maturityDays">Maturity Period (Days) *</label>
            <input
              type="number"
              id="maturityDays"
              name="maturityDays"
              value={formData.maturityDays}
              onChange={handleInputChange}
              placeholder="1825"
              min="1"
              step="1"
              className={errors.maturityDays ? 'error' : ''}
              required
            />
            {errors.maturityDays && <span className="field-error">{errors.maturityDays}</span>}
            <small className="form-help">
              {formData.maturityDays && !isNaN(formData.maturityDays) && formData.maturityDays > 0 && (
                `≈ ${(parseInt(formData.maturityDays) / 365).toFixed(1)} years`
              )}
            </small>
          </div>

          {/* Preview Section */}
          {formData.amount && formData.couponRate && formData.maturityDays && 
           !isNaN(formData.amount) && !isNaN(formData.couponRate) && !isNaN(formData.maturityDays) && (
            <div className="bond-preview">
              <h4>Investment Preview</h4>
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-label">Investment:</span>
                  <span className="preview-value">
                    {new Intl.NumberFormat('en-US').format(parseFloat(formData.amount))} LKR
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Estimated Maturity Value:</span>
                  <span className="preview-value">
                    {new Intl.NumberFormat('en-US').format(
                      Math.round(parseFloat(formData.amount) * (1 + (parseFloat(formData.couponRate) / 100) * (parseInt(formData.maturityDays) / 365)))
                    )} LKR
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Estimated Gain:</span>
                  <span className="preview-value gain">
                    +{new Intl.NumberFormat('en-US').format(
                      Math.round(parseFloat(formData.amount) * (1 + (parseFloat(formData.couponRate) / 100) * (parseInt(formData.maturityDays) / 365))) - parseFloat(formData.amount)
                    )} LKR
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="action-btn cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="action-btn submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Bond'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Bonds = ({ onBack }) => {
  const [bonds, setBonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBondModal, setShowBondModal] = useState(false);

  useEffect(() => {
    fetchBonds();
  }, []);

  const fetchBonds = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/portfolio/bonds');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBonds(data.bonds || []);
    } catch (err) {
      console.error('Error fetching bonds:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBondClick = () => {
    setShowBondModal(true);
  };

  const handleBondModalClose = (success) => {
    setShowBondModal(false);
    if (success) {
      fetchBonds(); // Refresh the data
    }
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateYield = (amount, maturityValue, issueDate, maturityDate) => {
    const yearsToMaturity = (new Date(maturityDate) - new Date(issueDate)) / (1000 * 60 * 60 * 24 * 365);
    if (yearsToMaturity <= 0) return 0;
    
    const totalReturn = ((maturityValue - amount) / amount) * 100;
    return totalReturn / yearsToMaturity;
  };

  const getTimeToMaturity = (maturityDate) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'Matured', color: '#6c757d', days: 0 };
    } else if (diffDays <= 365) {
      return { status: `${Math.floor(diffDays / 30)} months`, color: '#e74c3c', days: diffDays };
    } else {
      const years = Math.floor(diffDays / 365);
      return { status: `${years} year${years > 1 ? 's' : ''}`, color: '#27ae60', days: diffDays };
    }
  };

  const getBondTypeColor = (bondType) => {
    switch (bondType) {
      case 'Treasury Bond':
        return '#28a745'; // Green
      case 'Corporate Debenture':
        return '#007bff'; // Blue
      default:
        return '#6c757d'; // Gray
    }
  };

  const calculateTotalValue = () => {
    return bonds.reduce((sum, bond) => sum + bond.amount, 0);
  };

  const calculateTotalMaturityValue = () => {
    return bonds.reduce((sum, bond) => sum + bond.maturityValue, 0);
  };

  const calculateAverageYield = () => {
    if (bonds.length === 0) return 0;
    const totalYield = bonds.reduce((sum, bond) => {
      return sum + calculateYield(bond.amount, bond.maturityValue, bond.issueDate, bond.maturityDate);
    }, 0);
    return totalYield / bonds.length;
  };

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>Bonds & Debentures</h2>
        </div>
        <div className="loading">Loading bonds data...</div>
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
          <h2>Bonds & Debentures</h2>
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
        <h2>Bonds & Debentures</h2>
      </div>

      {/* Bonds Summary */}
      <div className="fd-summary">
        <div className="summary-card">
          <h3>Total Investment</h3>
          <p className="total-value">{formatNumber(calculateTotalValue())}</p>
        </div>
        <div className="summary-card">
          <h3>Total Maturity Value</h3>
          <p className="total-value">{formatNumber(calculateTotalMaturityValue())}</p>
        </div>
        <div className="summary-card">
          <h3>Total Instruments</h3>
          <p className="fd-count">{bonds.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Yield</h3>
          <p className="interest-rate">{calculateAverageYield().toFixed(2)}%</p>
        </div>
        <div className="summary-card action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn fd-btn" onClick={handleAddBondClick}>
              <span className="btn-icon">📈</span>
              Add Bond/Debenture
            </button>
          </div>
        </div>
      </div>

      {/* Bonds Table */}
      <div className="fd-table-container">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Issuer</th>
              <th>Type</th>
              <th>Investment Amount</th>
              <th>Coupon Rate</th>
              <th>Issue Date</th>
              <th>Maturity Date</th>
              <th>Maturity Value</th>
              <th>Interest Earned</th>
              <th>Time to Maturity</th>
            </tr>
          </thead>
          <tbody>
            {bonds.map((bond) => {
              const timeToMaturity = getTimeToMaturity(bond.maturityDate);
              const interestEarned = bond.maturityValue - bond.amount;
              
              return (
                <tr key={bond.id}>
                  <td className="bank-name">{bond.issuer}</td>
                  <td>
                    <span 
                      className="bond-type-badge" 
                      style={{ backgroundColor: getBondTypeColor(bond.bondType) }}
                    >
                      {bond.bondType}
                    </span>
                  </td>
                  <td>{formatNumber(bond.amount)}</td>
                  <td className="interest-rate">{bond.couponRate.toFixed(2)}%</td>
                  <td>{formatDate(bond.issueDate)}</td>
                  <td>{formatDate(bond.maturityDate)}</td>
                  <td className="maturity-value">{formatNumber(bond.maturityValue)}</td>
                  <td className="interest-earned positive">{formatNumber(interestEarned)}</td>
                  <td>
                    <span 
                      className="maturity-status"
                      style={{ color: timeToMaturity.color }}
                    >
                      {timeToMaturity.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bonds.length === 0 && (
          <div className="no-data">
            <p>No bonds or debentures found.</p>
            <small>Add bonds/debentures to track your fixed income investments.</small>
          </div>
        )}
      </div>
      {/* Bond Modal */}
      {showBondModal && <BondModal onClose={handleBondModalClose} />}
    </div>
  );
};

export default Bonds;