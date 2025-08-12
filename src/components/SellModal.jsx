import React, { useState } from 'react';
import './modal.css';

const SellModal = ({ isOpen, onClose, holdings }) => {
  const [sellForm, setSellForm] = useState({
    selectedStock: '',
    quantity: '',
    sellPrice: ''
  });

  const handleFormChange = (field, value) => {
    setSellForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedHolding = holdings.find(h => h.symbol === sellForm.selectedStock);
    
    if (!selectedHolding) {
      alert('Please select a stock to sell');
      return;
    }
    
    if (!sellForm.quantity || sellForm.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (parseFloat(sellForm.quantity) > selectedHolding.shares) {
      alert(`You can only sell up to ${selectedHolding.shares} shares of ${selectedHolding.symbol}`);
      return;
    }
    
    if (!sellForm.sellPrice || sellForm.sellPrice <= 0) {
      alert('Please enter a valid sell price');
      return;
    }
    
    // Here you would typically make an API call to sell the stock
    console.log('Selling stock:', {
      symbol: sellForm.selectedStock,
      quantity: parseFloat(sellForm.quantity),
      sellPrice: parseFloat(sellForm.sellPrice),
      totalValue: parseFloat(sellForm.quantity) * parseFloat(sellForm.sellPrice)
    });
    
    alert(`Sell order submitted: ${sellForm.quantity} shares of ${sellForm.selectedStock} at $${sellForm.sellPrice} each`);
    handleClose();
  };

  const handleClose = () => {
    setSellForm({
      selectedStock: '',
      quantity: '',
      sellPrice: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="sell-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>Sell Stock</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="stock-select">Select Stock</label>
            <select
              id="stock-select"
              value={sellForm.selectedStock}
              onChange={(e) => handleFormChange('selectedStock', e.target.value)}
              required
            >
              <option value="">-- Select a stock --</option>
              {holdings.map((holding) => (
                <option key={holding.id} value={holding.symbol}>
                  {holding.symbol} - {holding.shares} shares
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={sellForm.quantity}
              onChange={(e) => handleFormChange('quantity', e.target.value)}
              placeholder="Number of shares to sell"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sellPrice">Sell Price</label>
            <input
              type="number"
              id="sellPrice"
              value={sellForm.sellPrice}
              onChange={(e) => handleFormChange('sellPrice', e.target.value)}
              placeholder="Price per share"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <button type="submit" className="submit-btn">Submit Sell Order</button>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
