import React from 'react';
import './ExpenseTable.css';
import Papa from 'papaparse';

const ExpenseTable = () => {
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [importStatus, setImportStatus] = React.useState('');
  const [parsedRows, setParsedRows] = React.useState([]);

  // List of required headers
  const REQUIRED_HEADERS = [
    'Date', 'Amount', 'Category', 'Subcategory' , 'Description'
  ];

  // Define months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  React.useEffect(() => {
    const now = new Date();
    setSelectedMonth(months[now.getMonth()]);
  }, []);

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  // CSV file input handler
  const handleFileChange = (e) => {
    setImportStatus('');
    setParsedRows([]);
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta } = results;
        const columns = meta.fields || [];
        // Validate headers
        const missingHeaders = REQUIRED_HEADERS.filter(h => !columns.includes(h));
        if (missingHeaders.length > 0) {
          setImportStatus(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }
        if (!data || data.length === 0) {
          setImportStatus('File is empty or invalid.');
          return;
        }
        setImportStatus('File headers are correct!');
        setParsedRows(data.slice(0, 5));
      },
      error: (err) => {
        setImportStatus('Error parsing file: ' + err.message);
      }
    });
  };

  return (
    <div className="expense-table-root">
      <h2>My Expense</h2>
      <div className="expense-import-bar">
        <div style={{ display: 'inline-block', marginLeft: 0, minWidth: 180 }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ marginBottom: 8 }}
          />
        </div>
      </div>
      {/* Undo: Remove first 5 rows table, show only importStatus */}
      {importStatus && (
        <div className="import-status-message">{importStatus}</div>
      )}
      {parsedRows.length > 0 && (
        <div className="expense-preview-container">
          <strong>First 5 Rows:</strong>
          <div className="expense-table-scroll">
            <table className="expense-preview-table styled-table">
              <thead>
                <tr>
                  {Object.keys(parsedRows[0] || {}).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(parsedRows[0] || {}).map((header) => (
                      <td key={header}>{row[header] ?? <span style={{color:'#bbb'}}>-</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
            <label htmlFor="month-select" style={{ marginRight: 8, fontWeight: 500 }}>Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 15, marginRight: 16 }}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <button className="import-btn" style={{padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer'}}>Import</button>
          </div>
        </div>
      )}
      <p>Expense table coming soon...</p>
    </div>
  );
};

export default ExpenseTable;
