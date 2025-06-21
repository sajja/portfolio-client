import React from 'react';
import './ExpenseTable.css';
import Papa from 'papaparse';

const ExpenseTable = () => {
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [importStatus, setImportStatus] = React.useState('');
  const [parsedRows, setParsedRows] = React.useState([]);
  const [allRows, setAllRows] = React.useState([]);
  const [showToast, setShowToast] = React.useState(false);

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
    setAllRows([]);
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
        setParsedRows(data.slice(0, 5)); // for preview
        setAllRows(data); // store all rows for import
      },
      error: (err) => {
        setImportStatus('Error parsing file: ' + err.message);
      }
    });
  };

  // Helper to get month number from month name
  const getMonthNumber = (monthName) => {
    const idx = months.findIndex(m => m === monthName);
    return idx === -1 ? null : idx + 1;
  };

  // Helper to get year options (current and previous year)
  const getYearOptions = () => {
    const now = new Date();
    return [now.getFullYear(), now.getFullYear() - 1];
  };

  const showToastMessage = (msg) => {
    setImportStatus(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Import button handler
  const handleImportClick = async () => {
    if (!allRows.length) return;
    const monthNum = getMonthNumber(selectedMonth);
    if (!monthNum) {
      showToastMessage('Invalid month selected.');
      return;
    }
    // Filter allRows for selected year and month
    const filteredRows = allRows.filter(row => {
      if (!row.Date) return false;
      const dateObj = new Date(row.Date);
      return (
        dateObj.getFullYear() === selectedYear &&
        dateObj.getMonth() + 1 === monthNum
      );
    });
    if (filteredRows.length === 0) {
      showToastMessage('No expenses found for selected year and month.');
      return;
    }
    console.log('All rows to import:', filteredRows);
    const payload = {
      Year: selectedYear,
      Month: monthNum,
      Expenses: filteredRows,
    };
    try {
      showToastMessage('Importing...');
      const res = await fetch('http://localhost:3000/api/v1/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error);
      }
      showToastMessage('Import successful!');
    } catch (err) {
      showToastMessage('Import failed: ' + err.message);
    }
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
            <label htmlFor="year-select" style={{ marginRight: 8, fontWeight: 500 }}>Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 15, marginRight: 16 }}
            >
              {getYearOptions().map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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
            <button className="import-btn" style={{padding: '8px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer'}} onClick={handleImportClick}>Import</button>
          </div>
        </div>
      )}
      <p>Expense table coming soon...</p>
      {/* Toast notification for import status */}
      {showToast && (
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
        }}>
          {importStatus}
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
