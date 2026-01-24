import React, { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import Home from './components/Home';
import Notifications from './components/Notifications';
import ExpenseReport from './components/ExpenseReport';
import { Toaster, toast } from 'react-hot-toast';
import authService from './services/AuthService';

const App = () => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize authentication when app starts
    const initializeAuth = async () => {
      const authLoadingId = toast.loading('Initializing authentication...');
      
      try {
        console.log('Initializing authentication...');
        await authService.authenticate();
        console.log('✅ Authentication initialized successfully');
        toast.success('Authentication ready', { id: authLoadingId });
      } catch (error) {
        console.error('❌ Failed to initialize authentication:', error.message);
        toast.error('Authentication unavailable - some features may be limited', { 
          id: authLoadingId,
          duration: 6000 
        });
        // App can still work without auth if backend doesn't require it yet
      } finally {
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  return (
    <div className="app-container">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 6000,
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
      <header className="app-header">
        <nav className="app-nav">
          <ul>
            <li>
              <button
                onClick={() => handleMenuClick('home')}
                className={`menu-button ${activeMenu === 'home' ? 'active' : ''}`}
                title="Home"
              >
                &#x1F3E0;
              </button>
            </li>
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
            <li>
              <button 
                onClick={() => handleMenuClick('notifications')}
                className={`menu-button ${activeMenu === 'notifications' ? 'active' : ''}`}
              >
                Notifications
              </button>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="app-main">
        {activeMenu === 'home' && <Home />}
        {activeMenu === 'portfolio' && <Portfolio />}
        {activeMenu === 'expense-admin' && <ExpenseReport initialView="admin" />}
        {activeMenu === 'expense-report' && <ExpenseReport initialView="table" />}
        {activeMenu === 'notifications' && <Notifications />}
      </main>
    </div>
  );
};

export default App;