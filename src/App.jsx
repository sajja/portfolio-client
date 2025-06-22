import React, { useState, useEffect } from 'react';
import './SlidingPane.css'; // Import CSS for styling
import EditableTable from './components/EditableTable';
import ExpenseImport from './components/ExpenseImport';
import ExpenseSummaryCharts from './components/ExpenseSummaryCharts';

// Expense Report with tab view
const ExpenseReport = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError] = useState('');
  const [rawYear, setRawYear] = useState(new Date().getFullYear());
  const [rawMonth, setRawMonth] = useState(new Date().getMonth() + 1); // 1-based
  const [rawPage, setRawPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
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

  useEffect(() => {
    if (activeTab === 'Raw') {
      setRawLoading(true);
      setRawError('');
      fetch(`http://localhost:3000/api/v1/expense?year=${rawYear}&month=${rawMonth}&page=${rawPage}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch raw expenses');
          return res.json();
        })
        .then(data => {
          setRawExpenses(data.expenses || []);
          setHasNextPage(Array.isArray(data.expenses) && data.expenses.length > 0);
        })
        .catch(err => {
          setRawError(err.message || 'Error loading raw expenses');
          setHasNextPage(false);
        })
        .finally(() => setRawLoading(false));
    }
  }, [activeTab, rawYear, rawMonth, rawPage]);

  // Reset page to 1 when month/year changes
  useEffect(() => {
    setRawPage(1);
  }, [rawYear, rawMonth]);

  useEffect(() => {
    if (activeTab === 'Raw') {
      setRawPage(1); // Reset page to 1 when Raw Data tab is clicked
    }
  }, [activeTab]);

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
          <div className="raw-data-tab">
            <table className="raw-data-header-table">
              <thead>
                <tr>
                  <th className="raw-data-nav" onClick={handlePrevMonth} style={{ userSelect: 'none' }}>{'<'}</th>
                  <th className="raw-data-title">{
                    (() => {
                      const date = new Date(rawYear, rawMonth - 1);
                      const year = date.getFullYear();
                      const month = date.toLocaleString('default', { month: 'long' });
                      return `${year}: ${month}`;
                    })()
                  }</th>
                  <th className="raw-data-nav" onClick={handleNextMonth} style={{ userSelect: 'none' }}>{'>'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" style={{ padding: 0 }}>
                    <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 2px 8px #eee', background: '#fafbfc', marginTop: 8 }}>
                      {rawLoading ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading raw data...</div>
                      ) : rawError ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>{rawError}</div>
                      ) : (
                        <>
                          <table className="raw-data-table" style={{ minWidth: 1100, borderRadius: 8, overflow: 'hidden' }}>
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
                              {rawExpenses.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No data</td></tr>
                              ) : (
                                rawExpenses.map(exp => (
                                  <tr key={exp.id} style={{ background: exp.id % 2 === 0 ? '#f5f7fa' : '#fff' }}>
                                    <td>{exp.date}</td>
                                    <td>{exp.category}</td>
                                    <td>{exp.subcategory}</td>
                                    <td>{exp.description}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{exp.amount.toLocaleString()}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                          <div className="raw-data-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <div>
                              {rawPage > 1 && (
                                <button
                                  className="raw-data-prev-btn"
                                  style={{ padding: '4px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f7fa', color: '#222', fontWeight: 500, cursor: 'pointer' }}
                                  onClick={() => setRawPage(p => Math.max(1, p - 1))}
                                  disabled={rawLoading}
                                >
                                  &lt; Previous Page
                                </button>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#222', fontWeight: 500 }}>Page {rawPage}</span>
                              {hasNextPage && (
                                <button
                                  className="raw-data-next-btn"
                                  style={{ marginLeft: 16, padding: '4px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f7fa', color: '#222', fontWeight: 500, cursor: 'pointer' }}
                                  onClick={() => setRawPage(p => p + 1)}
                                  disabled={rawLoading}
                                >
                                  Next Page &gt;
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
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