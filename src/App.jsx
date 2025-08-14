import React, { useState } from 'react';
import Portfolio from './components/Portfolio';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const [activeMenu, setActiveMenu] = useState('');

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  return (
    <div className="app-container">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="app-header">
        <nav className="app-nav">
          <ul>
            <li>
              <button 
                onClick={() => handleMenuClick('portfolio')}
                className={`menu-button ${activeMenu === 'portfolio' ? 'active' : ''}`}
              >
                Portfolio
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleMenuClick('expense-admin')}
                className={`menu-button ${activeMenu === 'expense-admin' ? 'active' : ''}`}
              >
                Expense Admin
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleMenuClick('expense-report')}
                className={`menu-button ${activeMenu === 'expense-report' ? 'active' : ''}`}
              >
                Expense Report
              </button>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="app-main">
        {activeMenu === 'portfolio' && <Portfolio />}
        {activeMenu === 'expense-admin' && <div><h2>Expense Admin</h2><p>Expense Admin content coming soon...</p></div>}
        {activeMenu === 'expense-report' && <div><h2>Expense Report</h2><p>Expense Report content coming soon...</p></div>}
        {!activeMenu && <div><h1>Welcome</h1><p>Please select a menu option above.</p></div>}
      </main>
    </div>
  );
};

export default App;