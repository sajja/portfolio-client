import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './modal.css';

const DividendModal = ({ isOpen, onClose, holdings }) => {
  const [dividendForm, setDividendForm] = useState({
    symbol: '',
    amount: '',
    date: ''
  });

  const handleFormChange = (field, value) => {
    setDividendForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dividendForm.symbol || dividendForm.symbol.trim() === '') {
      toast.error('Please select a stock symbol');
      return;
    }
    
    if (!dividendForm.amount || dividendForm.amount <= 0) {
      toast.error('Please enter a valid dividend amount');
      return;
    }
    
    if (!dividendForm.date) {
      toast.error('Please select a dividend date');
      return;
    }
    
    // Check if user owns the stock
    const ownedStock = holdings.find(holding => holding.symbol === dividendForm.symbol);
    if (!ownedStock) {
      toast.error('You do not own this stock');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/equity/${dividendForm.symbol.toUpperCase()}/dividend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(dividendForm.amount),
          date: dividendForm.date,
          type: 'cash',
          symbol: dividendForm.symbol.toUpperCase()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register dividend');
      }

      const result = await response.json();
      
      console.log('Dividend registered successfully:', result);
      toast.success(`Dividend of $${dividendForm.amount} registered for ${dividendForm.symbol}`);
      handleClose(true);

    } catch (error) {
      console.error('Error registering dividend:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = (shouldRefetch = false) => {
    setDividendForm({
      symbol: '',
      amount: '',
      date: ''
    });
    onClose(shouldRefetch);
  };

  if (!isOpen) return null;

  return (
    <div className="dividend-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>Register Dividend</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="dividend-symbol">Stock Symbol</label>
            <select
              id="dividend-symbol"
              value={dividendForm.symbol}
              onChange={(e) => handleFormChange('symbol', e.target.value)}
              required
            >
              <option value="">Select a stock</option>
              {holdings.map((holding) => (
                <option key={holding.symbol} value={holding.symbol}>
                  {holding.symbol} ({holding.shares} shares)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dividend-amount">Dividend Amount ($)</label>
            <input
              type="number"
              id="dividend-amount"
              value={dividendForm.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              placeholder="Total dividend amount received"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dividend-date">Dividend Date</label>
            <input
              type="date"
              id="dividend-date"
              value={dividendForm.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Register Dividend</button>
        </form>
      </div>
    </div>
  );
};

export default DividendModal;
