import React, { useState } from 'react';
import './modal.css';

const IndexFundModal = ({ onSave, onClose }) => {
  const [fundHolder, setFundHolder] = useState('');
  const [fundType, setFundType] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ fundHolder, fundType, amount: parseFloat(amount), rate: parseFloat(rate) });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add New Index Fund</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fund Holder</label>
            <input
              type="text"
              value={fundHolder}
              onChange={(e) => setFundHolder(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Fund Type</label>
            <input
              type="text"
              value={fundType}
              onChange={(e) => setFundType(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Investment Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndexFundModal;
