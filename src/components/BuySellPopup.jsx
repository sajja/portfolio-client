import React from 'react';

const BuySellPopup = ({
  type, // 'buy' or 'sell'
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  rows = [],
}) => {
  if (!open) return null;
  const isBuy = type === 'buy';
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <form
        onSubmit={onSubmit}
        style={{
          background: '#fff', padding: 32, borderRadius: 10, minWidth: 400,
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)'
        }}
      >
        <h3 style={{ marginBottom: 24 }}>{isBuy ? 'Buy Stock' : 'Sell Stock'}</h3>
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
          <label style={{ width: 110, fontWeight: 500 }}>{isBuy ? 'Stock Code:' : 'Stock:'}</label>
          {isBuy ? (
            <input
              name="code"
              value={form.code}
              onChange={onFormChange}
              required
              style={{ width: '70%', padding: 8, fontSize: 16 }}
            />
          ) : (
            <select
              name="code"
              value={form.code}
              onChange={onFormChange}
              required
              style={{ width: '70%', padding: 8, fontSize: 16 }}
            >
              {rows.map((row, idx) => (
                <option key={idx} value={row.name}>{row.name}</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
          <label style={{ width: 110, fontWeight: 500 }}>Quantity:</label>
          <input
            name="qtty"
            type="number"
            value={form.qtty}
            onChange={onFormChange}
            required
            min={1}
            max={!isBuy ? (rows.find(r => r.name === form.code)?.qtty || 1) : undefined}
            style={{ width: '70%', padding: 8, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
          <label style={{ width: 110, fontWeight: 500 }}>Price:</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={onFormChange}
            required
            style={{ width: '70%', padding: 8, fontSize: 16 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 18px' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 18px' }}>{isBuy ? 'Buy' : 'Sell'}</button>
        </div>
      </form>
    </div>
  );
};

export default BuySellPopup;