import React, { useState } from 'react';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!buyForm.symbol || buyForm.symbol.trim() === '') {
      alert('Please enter a stock symbol');
      return;
    }
    
    if (!buyForm.quantity || buyForm.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (!buyForm.buyPrice || buyForm.buyPrice <= 0) {
      alert('Please enter a valid buy price');
      return;
    }
    
    // Here you would typically make an API call to buy the stock
    console.log('Buying stock:', {
      symbol: buyForm.symbol.toUpperCase(),
      quantity: parseFloat(buyForm.quantity),
      buyPrice: parseFloat(buyForm.buyPrice),
      totalValue: parseFloat(buyForm.quantity) * parseFloat(buyForm.buyPrice)
    });
    
    alert(`Buy order submitted: ${buyForm.quantity} shares of ${buyForm.symbol.toUpperCase()} at $${buyForm.buyPrice} each`);
    handleClose();
  };

  const handleClose = () => {
    setBuyForm({
      symbol: '',
      quantity: '',
      buyPrice: ''
    });
    onClose();
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
