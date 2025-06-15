import React from 'react';

const TransactionPopup = ({ open, onClose, stock, transactions }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      color: '#000', // Set font color to black for overlay
    }}>
      <div style={{
        background: '#fff',
        padding: 32,
        borderRadius: 10,
        minWidth: 500,
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        color: '#000', // Set font color to black for popup
      }}>
        <h3 style={{ marginBottom: 24, color: '#000' }}>Transactions for {stock}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000' }}>
          <thead>
            <tr>
              <th style={{ color: '#000' }}>Date</th>
              <th style={{ color: '#000' }}>Type</th>
              <th style={{ color: '#000' }}>Quantity</th>
              <th style={{ color: '#000' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#000' }}>No transactions found.</td>
              </tr>
            ) : (
              transactions.map((txn, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#000' }}>{txn.date}</td>
                  <td style={{ color: '#000' }}>{txn.type}</td>
                  <td style={{ color: '#000' }}>{txn.qtty}</td>
                  <td style={{ color: '#000' }}>{txn.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: '8px 18px'  }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPopup;