import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './modal.css';

const BuyModal = ({ isOpen, onClose }) => {
  const [buyForm, setBuyForm] = useState({
    symbol: '',
    quantity: '',
    buyPrice: ''
  });

  const handleFormChange = (field, value) => {
    setBuyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!buyForm.symbol || buyForm.symbol.trim() === '') {
      toast.error('Please enter a stock symbol');
      return;
    }
    
    if (!buyForm.quantity || buyForm.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    if (!buyForm.buyPrice || buyForm.buyPrice <= 0) {
      toast.error('Please enter a valid buy price');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/equity/${buyForm.symbol.toUpperCase()}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qtty: parseFloat(buyForm.quantity),
          price: parseFloat(buyForm.buyPrice),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit buy order');
      }

      const result = await response.json();
      
      console.log('Buy order successful:', result);
      handleClose(true);

    } catch (error) {
      console.error('Error submitting buy order:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = (shouldRefetch = false) => {
    setBuyForm({
      symbol: '',
      quantity: '',
      buyPrice: ''
    });
    onClose(shouldRefetch);
  };

  if (!isOpen) return null;

  return (
    <div className="buy-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>Buy Stock</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="buy-symbol">Stock Symbol</label>
            <input
              type="text"
              id="buy-symbol"
              value={buyForm.symbol}
              onChange={(e) => handleFormChange('symbol', e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, MSFT, GOOGL"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="buy-quantity">Quantity</label>
            <input
              type="number"
              id="buy-quantity"
              value={buyForm.quantity}
              onChange={(e) => handleFormChange('quantity', e.target.value)}
              placeholder="Number of shares"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="buyPrice">Buy Price</label>
            <input
              type="number"
              id="buyPrice"
              value={buyForm.buyPrice}
              onChange={(e) => handleFormChange('buyPrice', e.target.value)}
              placeholder="Price per share"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <button type="submit" className="submit-btn">Submit Buy Order</button>
        </form>
      </div>
    </div>
  );
};

export default BuyModal;
