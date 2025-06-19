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
    <div style={{ padding: 32, color: '#000', width: '100vw', height: '100vh', background: '#fff', boxSizing: 'border-box' }}>
      <h2>Expense Report</h2>
      <div style={{ display: 'flex', borderBottom: '2px solid #1976d2', marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? '#1976d2' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#1976d2',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1976d2' : 'none',
              fontWeight: 600,
              fontSize: 18,
              padding: '10px 28px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
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
        {activeTab === 'Raw' && <div>Raw Data report coming soon...</div>}
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