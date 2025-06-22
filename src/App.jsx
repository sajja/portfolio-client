import React, { useState, useEffect } from 'react';
import './SlidingPane.css'; // Import CSS for styling
import EditableTable from './components/EditableTable';
import ExpenseImport from './components/ExpenseImport';
import ExpenseSummaryCharts from './components/ExpenseSummaryCharts';
import ExpenseRawData from './components/ExpenseRawData'; // Import the new ExpenseRawData component

// Expense Report with tab view
const ExpenseReport = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tabs = [
    { key: 'Summary', label: 'Summary' },
    { key: 'ByCategory', label: 'By Category' },
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

  const handlePrevMonth = () => {
    setRawMonth(prev => {
      if (prev === 1) {
        setRawYear(y => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };
  const handleNextMonth = () => {
    setRawMonth(prev => {
      if (prev === 12) {
        setRawYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

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
        {activeTab === 'Raw' && (
          <ExpenseRawData />
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
    setMainContent(<ExpenseImport />);
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