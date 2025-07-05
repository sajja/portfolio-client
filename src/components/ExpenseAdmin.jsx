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
                  <td><button className="import-btn" style={{padding: '4px 16px'}}>Delete</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseAdmin;
