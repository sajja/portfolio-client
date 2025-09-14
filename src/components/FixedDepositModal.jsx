import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './modal.css';

const FixedDepositModal = ({ isOpen, onClose }) => {
  const [fdForm, setFdForm] = useState({
    bank: '',
    principal: '',
    interestRate: '',
    maturityPeriod: ''
  });

  const handleFormChange = (field, value) => {
    setFdForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fdForm.bank || fdForm.bank.trim() === '') {
      toast.error('Please enter the bank name');
      return;
    }
    
    if (!fdForm.principal || fdForm.principal <= 0) {
      toast.error('Please enter a valid principal amount');
      return;
    }
    
    if (!fdForm.interestRate || fdForm.interestRate <= 0) {
      toast.error('Please enter a valid interest rate');
      return;
    }
    
    if (!fdForm.maturityPeriod || fdForm.maturityPeriod <= 0) {
      toast.error('Please enter a valid maturity period');
      return;
    }
    
    try {
      // Calculate maturity date
      const today = new Date();
      const maturityDate = new Date(today);
      maturityDate.setMonth(today.getMonth() + parseInt(fdForm.maturityPeriod));
      
      const fdData = {
        bank: fdForm.bank.trim(),
        principal: parseFloat(fdForm.principal),
        interest_rate: parseFloat(fdForm.interestRate),
        maturity_period_months: parseInt(fdForm.maturityPeriod),
        maturity_date: maturityDate.toISOString().split('T')[0], // YYYY-MM-DD format
        start_date: today.toISOString().split('T')[0]
      };

      const response = await fetch('http://localhost:3000/api/v1/portfolio/fixed-deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fdData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add fixed deposit');
      }

      const result = await response.json();
      
      console.log('Fixed deposit added successfully:', result);
      toast.success(`Fixed deposit of $${fdForm.principal} added for ${fdForm.bank}`);
      handleClose(true);

    } catch (error) {
      console.error('Error adding fixed deposit:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = (shouldRefetch = false) => {
    setFdForm({
      bank: '',
      principal: '',
      interestRate: '',
      maturityPeriod: ''
    });
    onClose(shouldRefetch);
  };

  if (!isOpen) return null;

  return (
    <div className="fd-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>Add Fixed Deposit</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fd-bank">Bank Name</label>
            <input
              type="text"
              id="fd-bank"
              value={fdForm.bank}
              onChange={(e) => handleFormChange('bank', e.target.value)}
              placeholder="Enter bank name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fd-principal">Principal Amount ($)</label>
            <input
              type="number"
              id="fd-principal"
              value={fdForm.principal}
              onChange={(e) => handleFormChange('principal', e.target.value)}
              placeholder="Enter principal amount"
              step="0.01"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fd-interest-rate">Interest Rate (%)</label>
            <input
              type="number"
              id="fd-interest-rate"
              value={fdForm.interestRate}
              onChange={(e) => handleFormChange('interestRate', e.target.value)}
              placeholder="Enter annual interest rate"
              step="0.01"
              min="0.01"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fd-maturity-period">Maturity Period (Months)</label>
            <input
              type="number"
              id="fd-maturity-period"
              value={fdForm.maturityPeriod}
              onChange={(e) => handleFormChange('maturityPeriod', e.target.value)}
              placeholder="Enter maturity period in months"
              min="1"
              max="360"
              required
            />
          </div>
          <button type="submit" className="submit-btn">Add Fixed Deposit</button>
        </form>
      </div>
    </div>
  );
};

export default FixedDepositModal;
