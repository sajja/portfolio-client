import React from 'react';
import './ExpenseTable.css';

const ExpenseTable = () => {
  // State for month selection and file input
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [file, setFile] = React.useState(null);

  // List of months (current year)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Set default month to current month
  React.useEffect(() => {
    const now = new Date();
    setSelectedMonth(months[now.getMonth()]);
  }, []);

  const handleMonthChange = (e) => setSelectedMonth(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleImport = () => {
    if (!selectedMonth || !file) {
      alert('Please select a month and choose a file to import.');
      return;
    }
    // TODO: Implement file upload logic here
    alert(`Importing ${file.name} for ${selectedMonth}`);
  };

  return (
    <div className="expense-table-root">
      <h2>My Expense</h2>
      <div className="expense-import-bar">
        <select value={selectedMonth} onChange={handleMonthChange}>
          <option value="">Select Month</option>
          {months.map((month, idx) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
        <button onClick={handleImport}>Import Monthly Expense Report</button>
      </div>
      <p>Expense table coming soon...</p>
    </div>
  );
};

export default ExpenseTable;
