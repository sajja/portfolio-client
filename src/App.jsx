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
  const [companyAnnouncements, setCompanyAnnouncements] = useState(null);

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

  const handleCompanyAnnouncementsClick = async (e) => {
    e.preventDefault();
    // Fetch companies I own with dividend announcements
    let myCompanies = [];
    try {
      const res = await fetch('http://localhost:3000/api/v1/companies/dividend?own=true');
      if (!res.ok) throw new Error('Failed to fetch dividends');
      const data = await res.json();
      // Map to correct fields for table columns
      myCompanies = (data.dividends || []).map(div => ({
        symbol: div.symbol,
        remarks: div.remarks || '-',
        xd_date: div.xd_date || '-',
        payment_date: div.payment_date || '-',
        div_ps: div.div_ps || '-',
      }));
    } catch (err) {
      myCompanies = [{ symbol: 'Error', remarks: err.message, xd_date: '-', payment_date: '-', div_ps: '-' }];
    }
    // Example static data for other companies (can be replaced with real API)
    const otherCompanies = [
      { name: 'Gamma Inc', announcement: 'New product launch next month.' },
      { name: 'Delta PLC', announcement: 'Rights issue announced.' },
    ];
    setCompanyAnnouncements({ myCompanies, otherCompanies });
    setMainContent(
      <div className="company-announcements-table">
        <h2>Company Announcements</h2>
        <div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            <h3>Companies I Own</h3>
            <table className="styled-table" width={'100%'}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Remarks</th>
                  <th>XD Date</th>
                  <th>Payment Date</th>
                  <th>Div/Share</th>
                </tr>
              </thead>
              <tbody>
                {myCompanies.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No announcements</td></tr>
                ) : (
                  myCompanies.map((div, i) => (
                    <tr key={i}>
                      <td>{div.symbol}</td>
                      <td colSpan={1}>
                        <textarea
                          readOnly
                          value={div.remarks}
                          style={{ minWidth: 400, maxWidth: 600, width: '100%', whiteSpace: 'pre-line', wordBreak: 'break-word', background: '#f7fafd', border: '1px solid #ddd', borderRadius: 4, padding: 6, fontSize: '1em', color: '#222', resize: 'vertical' }}
                        />
                      </td>
                      <td>{div.xd_date}</td>
                      <td>{div.payment_date}</td>
                      <td>{div.div_ps}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ flex: 1 }}>
            <h3>All Other Companies</h3>
            <table className="styled-table">
              <thead>
                <tr><th>Company</th><th>Announcement</th></tr>
              </thead>
              <tbody>
                {otherCompanies.length === 0 ? (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No announcements</td></tr>
                ) : (
                  otherCompanies.map((c, i) => (
                    <tr key={i}><td>{c.name}</td><td>{c.announcement}</td></tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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
            <a id="ann" href="" onClick={handleCompanyAnnouncementsClick}>Company announcements</a>
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