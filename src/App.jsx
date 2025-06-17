import React, { useState, useEffect } from 'react';
import './SlidingPane.css'; // Import CSS for styling
import EditableTable from './components/EditableTable';
import ExpenseTable from './components/ExpenseTable';

// Placeholder for Expense Report
const ExpenseReport = () => (
  <div style={{ padding: 32, color: '#000', width: '100vw', height: '100vh', background: '#fff', boxSizing: 'border-box' }}>
    <h2>Expense Report</h2>
  </div>
);

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