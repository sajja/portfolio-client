import React from 'react';

const TransactionPopup = ({ open, onClose, stock, transactions }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', padding: 32, borderRadius: 10, minWidth: 500,
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)'
      }}>
        <h3 style={{ marginBottom: 24 }}>Transactions for {stock}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No transactions found.</td>
              </tr>
            ) : (
              transactions.map((txn, idx) => (
                <tr key={idx}>
                  <td>{txn.date}</td>
                  <td>{txn.type}</td>
                  <td>{txn.qtty}</td>
                  <td>{txn.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: '8px 18px' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPopup;