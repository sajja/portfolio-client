import React, { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/AuthService';
import './modal.css';

const FXAccountModal = ({ isOpen, onClose, onSubmit, editingAccount, isLoading, error }) => {
  const [fxForm, setFxForm] = useState({
    bank: editingAccount?.bank || '',
    currency: editingAccount?.currency || '',
    amount: editingAccount?.amount || '',
    interestRate: editingAccount?.interestRate || '',
    date: editingAccount?.date || ''
  });

  React.useEffect(() => {
    if (editingAccount) {
      setFxForm({
        bank: editingAccount.bank || '',
        currency: editingAccount.currency || '',
        amount: editingAccount.amount || '',
        interestRate: editingAccount.interestRate || '',
        date: editingAccount.date ? editingAccount.date.split('T')[0] : ''
      });
    } else {
      setFxForm({
        bank: '',
        currency: 'USD',
        amount: '',
        interestRate: '',
        date: new Date().toISOString().split('T')[0] // Default to today
      });
    }
  }, [editingAccount, isOpen]);

  const handleFormChange = (field, value) => {
    setFxForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fxForm.bank || fxForm.bank.trim() === '') {
      toast.error('Please enter the bank name');
      return;
    }
    
    if (!fxForm.currency || fxForm.currency.trim() === '') {
      toast.error('Please select a currency');
      return;
    }
    
    if (!fxForm.amount || fxForm.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!fxForm.interestRate || fxForm.interestRate < 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }
    
    if (!fxForm.date) {
      toast.error('Please select a date');
      return;
    }
    
    try {
      const fxData = {
        bankName: fxForm.bank.trim(),
        currency: fxForm.currency.toUpperCase(),
        amount: parseFloat(fxForm.amount),
        interestRate: parseFloat(fxForm.interestRate),
        date: fxForm.date
      };

      // Use the onSubmit prop if provided (for editing), otherwise create new
      if (onSubmit) {
        await onSubmit(fxData);
      } else {
        const response = await authService.makeAuthenticatedRequest('api/v1/portfolio/fx', {
          method: 'PUT',
          body: JSON.stringify(fxData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add FX account');
        }

        const result = await response.json();
        
        console.log('FX account added successfully:', result);
        toast.success(`FX account of ${fxForm.amount} ${fxForm.currency} added for ${fxForm.bank}`);
      }
      
      handleClose(true);

    } catch (error) {
      console.error('Error adding FX account:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = (shouldRefetch = false) => {
    setFxForm({
      bank: '',
      currency: 'USD',
      amount: '',
      interestRate: '',
      date: new Date().toISOString().split('T')[0]
    });
    onClose(shouldRefetch);
  };

  if (!isOpen) return null;

  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD',
    'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'INR', 'BRL',
    'ZAR', 'KRW', 'MXN', 'THB', 'MYR', 'PHP', 'IDR', 'TRY', 'ILS', 'AED'
  ];

  return (
    <div className="fx-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>{editingAccount ? 'Edit FX Account' : 'Add Foreign Exchange Account'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fx-bank">Bank Name</label>
            <input
              type="text"
              id="fx-bank"
              value={fxForm.bank}
              onChange={(e) => handleFormChange('bank', e.target.value)}
              placeholder="Enter bank name"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fx-currency">Currency</label>
            <select
              id="fx-currency"
              value={fxForm.currency}
              onChange={(e) => handleFormChange('currency', e.target.value)}
              disabled={isLoading}
              required
            >
              <option value="">Select currency</option>
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fx-amount">Amount</label>
            <input
              type="number"
              id="fx-amount"
              value={fxForm.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0.01"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fx-interest-rate">Interest Rate (%)</label>
            <input
              type="number"
              id="fx-interest-rate"
              value={fxForm.interestRate}
              onChange={(e) => handleFormChange('interestRate', e.target.value)}
              placeholder="Enter annual interest rate"
              step="0.01"
              min="0"
              max="100"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fx-date">Date</label>
            <input
              type="date"
              id="fx-date"
              value={fxForm.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : editingAccount ? 'Update FX Account' : 'Add FX Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FXAccountModal;
