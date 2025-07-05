import React, { useEffect, useState } from 'react';
import './ExpenseImport.css'; // Reuse some of the expense import styles

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ExpenseAdmin = () => {
  const [importedMonths, setImportedMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/expense/admin/summary')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch imported months');
        return res.json();
      })
      .then(data => {
        setImportedMonths(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch(err => setError(err.message || 'Error loading imported months'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteClick = (year, month) => {
    setToDelete({ year, month });
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setShowConfirm(false);
    setToastMsg('Deleting...');
    try {
      const res = await fetch('http://localhost:3000/api/v1/expense/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: toDelete.year, month: toDelete.month })
      });
      if (!res.ok) throw new Error('Failed to delete imported data');
      setToastMsg('Deleted successfully!');
      setImportedMonths(prev => prev.filter(m => !(m.year === toDelete.year && m.month === toDelete.month)));
    } catch (err) {
      setToastMsg('Delete failed: ' + (err.message || 'Unknown error'));
    } finally {
      setTimeout(() => setToastMsg(''), 2500);
      setToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setToDelete(null);
  };

  return (
    <div className="expense-table-root">
      <h2>Expense months imported</h2>
      <div className="expense-table-scroll" style={{ maxWidth: 500, marginTop: 24 }}>
        <table className="expense-preview-table styled-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3}>Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={3} style={{ color: 'red' }}>{error}</td></tr>
            ) : importedMonths.length === 0 ? (
              <tr><td colSpan={3}>No imported months found.</td></tr>
            ) : (
              importedMonths.map(({ year, month }, idx) => (
                <tr key={year + '-' + month}>
                  <td>{year}</td>
                  <td>{monthNames[month]}</td>
                  <td>
                    <button className="import-btn" style={{padding: '4px 16px'}} onClick={() => handleDeleteClick(year, month)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Confirmation Toast */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          background: '#fff',
          color: '#222',
          padding: '18px 32px',
          borderRadius: 8,
          boxShadow: '0 2px 8px #888',
          zIndex: 9999,
          fontSize: 17,
          fontWeight: 500,
          border: '1.5px solid #1976d2',
        }}>
          <div style={{marginBottom: 12}}>Delete data for {toDelete?.year} {monthNames[toDelete?.month]}?</div>
          <button className="import-btn" style={{marginRight: 16}} onClick={handleConfirmDelete}>Yes, Delete</button>
          <button className="import-btn" style={{background:'#eee', color:'#222'}} onClick={handleCancelDelete}>Cancel</button>
        </div>
      )}
      {/* Status Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: '#1976d2',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: 8,
          boxShadow: '0 2px 8px #888',
          zIndex: 9999,
          fontSize: 17,
          fontWeight: 500,
        }}>{toastMsg}</div>
      )}
    </div>
  );
};

export default ExpenseAdmin;
