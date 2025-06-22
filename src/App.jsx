import React, { useState, useEffect } from 'react';
import './SlidingPane.css'; // Import CSS for styling
import EditableTable from './components/EditableTable';
import ExpenseTable from './components/ExpenseTable';
import ExpenseSummaryCharts from './components/ExpenseSummaryCharts';

// Expense Report with tab view
const ExpenseReport = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tabs = [
    { key: 'Summary', label: 'Summary' },
    { key: 'ByCategory', label: 'By Category' },
    { key: 'ByMonth', label: 'By Month' },
    { key: 'Raw', label: 'Raw Data' },
  ];

  useEffect(() => {
    if (activeTab === 'Summary' && summary === null && !loading) {
      setLoading(true);
      setError('');
      fetch('http://localhost:3000/api/v1/expense/summary')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch summary');
          return res.json();
        })
        .then(data => {
          setSummary(data);
        })
        .catch(err => {
          setError(err.message || 'Error loading summary');
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, summary, loading]);

  return (
    <div className="expense-report-container">
      <h2 className="expense-report-title">Expense Report</h2>
      <div className="expense-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`expense-tab-btn${activeTab === tab.key ? ' active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="expense-tab-content">
        {activeTab === 'Summary' && (
          loading ? <div>Loading summary...</div> :
          error ? <div style={{color: 'red'}}>{error}</div> :
          summary ? (
            <div>
              <ExpenseSummaryCharts summary={summary} />
            </div>
          ) : <div>No summary data.</div>
        )}
        {activeTab === 'ByCategory' && <div>By Category report coming soon...</div>}
        {activeTab === 'ByMonth' && <div>By Month report coming soon...</div>}
        {activeTab === 'Raw' && (
          <div className="raw-data-tab">
            <table className="raw-data-header-table">
              <thead>
                <tr>
                  <th className="raw-data-nav">{'<'}</th>
                  <th className="raw-data-title">Year: Month</th>
                  <th className="raw-data-nav">{'>'}</th>
                </tr>
              </thead>
            </table>
            <table className="raw-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-01-03</td>
                  <td>charity</td>
                  <td>sos</td>
                  <td>Repeating:sos</td>
                  <td>₹15000</td>
                </tr>
                <tr>
                  <td>2025-01-04</td>
                  <td>Household</td>
                  <td>Appliance</td>
                  <td>Repeating:fridge</td>
                  <td>₹16400</td>
                </tr>
                <tr>
                  <td>2025-01-09</td>
                  <td>Personal</td>
                  <td>education</td>
                  <td>Repeating:audible - Stopped</td>
                  <td>₹4000</td>
                </tr>
                <tr>
                  <td>2025-01-14</td>
                  <td>investment</td>
                  <td>pension</td>
                  <td>Repeating:pension</td>
                  <td>₹7000</td>
                </tr>
                <tr>
                  <td>2025-01-28</td>
                  <td>Loans</td>
                  <td>Mortgage</td>
                  <td>Repeating:housing loan</td>
                  <td>₹50000</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SlidingPane = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mainContent, setMainContent] = useState('Main area');

  const handleTogglePane = () => setIsOpen((open) => !open);

  const handlePortfolioClick = (e) => {
    e.preventDefault();
    setMainContent(<EditableTable />);
  };

  const handleExpenseClick = (e) => {
    e.preventDefault();
    setMainContent(<ExpenseTable />);
  };

  const handleExpenseReportClick = (e) => {
    e.preventDefault();
    setMainContent(<ExpenseReport />);
  };

  return (
    <div className="container" >
      <button className="toggle-btn" onClick={handleTogglePane}>
        {isOpen ? '<' : '>'}
      </button>
      <div className={`sliding-pane${isOpen ? ' open' : ''}`}>
        <div className="pane-content">
          <h3>Me</h3>
          <div>
            <a id="pf" href="" onClick={handlePortfolioClick}>Portfolio/</a>
          </div>
          <div>
            <a id="ci" href="" >Company info</a>
          </div>
          <div>
            <a id="ann" href="">Company announcements</a>
          </div>
          <div>
            <a id="expI" href="" onClick={handleExpenseClick}>Expense import</a>
          </div>
          <div>
            <a id="expR" href="" onClick={handleExpenseReportClick}>Expense Report</a>
          </div>
          <div>E</div>
          <div>F</div>
          <div>G</div>
        </div>
      </div>
      <div id="xxx" className="main-area"  style={{flexGrow: 1}}>
        {mainContent}
      </div>
    </div>
  );
};

export default SlidingPane;