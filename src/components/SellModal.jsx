import React, { useState } from 'react';
import toast from 'react-hot-toast';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedHolding = holdings.find(h => h.symbol === sellForm.selectedStock);
    
    if (!selectedHolding) {
      toast.error('Please select a stock to sell');
      return;
    }
    
    if (!sellForm.quantity || sellForm.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    if (parseFloat(sellForm.quantity) > selectedHolding.shares) {
      toast.error(`You can only sell up to ${selectedHolding.shares} shares of ${selectedHolding.symbol}`);
      return;
    }
    
    if (!sellForm.sellPrice || sellForm.sellPrice <= 0) {
      toast.error('Please enter a valid sell price');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/equity/${sellForm.selectedStock}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qtty: parseFloat(sellForm.quantity),
          price: parseFloat(sellForm.sellPrice),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit sell order');
      }

      const result = await response.json();
      
      console.log('Sell order successful:', result);
      handleClose(true);

    } catch (error) {
      console.error('Error submitting sell order:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleClose = (shouldRefetch = false) => {
    setSellForm({
      selectedStock: '',
      quantity: '',
      sellPrice: ''
    });
    onClose(shouldRefetch);
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
