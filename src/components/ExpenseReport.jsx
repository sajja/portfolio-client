import React, { useState, useEffect } from 'react';
import authService from '../services/AuthService';
import './holdings.css';

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({
    thisMonth: 0,
    last3Months: 0,
    last6Months: 0
  });
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchExpenseData();
  }, []);

  // Function to fetch period-specific data when selection changes
  const fetchPeriodData = async (period) => {
    try {
      const now = new Date();
      let startDate, endDate = now.toISOString().split('T')[0];

      switch (period) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          break;
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
          break;
        case 'last6Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      }

      // Fetch detailed expenses for the selected period
      const expensesResponse = await authService.makeAuthenticatedRequest(
        `api/v1/expense?from_date=${startDate}&to_date=${endDate}`
      );

      if (expensesResponse.ok) {
        const expenseData = await expensesResponse.json();
        const periodExpenses = expenseData.expenses || [];
        
        // Update expenses with period-specific data
        setExpenses(periodExpenses);
      }
    } catch (error) {
      console.error('Error fetching period data:', error);
      // Keep existing data on error
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setSelectedCategory(null); // Clear category filter when period changes
    fetchPeriodData(period);
  };

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      // If clicking the same category, clear the filter
      setSelectedCategory(null);
    } else {
      // Set the new category filter
      setSelectedCategory(categoryName);
    }
  };

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date ranges for API calls
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const startDate = sixMonthsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const endDate = now.toISOString().split('T')[0];

      // First try to get monthly breakdown summary for more detailed period analysis
      let summaryData = null;
      try {
        const summaryResponse = await authService.makeAuthenticatedRequest(
          `api/v1/expense/summary?startDate=${startDate}&endDate=${endDate}`
        );
        
        if (summaryResponse.ok) {
          summaryData = await summaryResponse.json();
        }
      } catch (summaryError) {
        console.warn('Summary endpoint failed, will use expense data instead:', summaryError);
      }
      
      // Fetch detailed expenses for the table
      const expensesResponse = await authService.makeAuthenticatedRequest(
        `api/v1/expense?from_date=${startDate}&to_date=${endDate}`
      );

      if (!expensesResponse.ok) {
        throw new Error(`HTTP error! status: ${expensesResponse.status} ${expensesResponse.statusText}`);
      }

      const expenseData = await expensesResponse.json();
      const expenseList = expenseData.expenses || [];
      setExpenses(expenseList);
      
      // Process API summary data if available from summary endpoint
      if (summaryData && summaryData.monthlyBreakdown) {
        const processedSummary = processMonthlyBreakdown(summaryData.monthlyBreakdown);
        setExpenseSummary(processedSummary);
        
        // Process category data from monthly breakdown
        const processedCategories = processCategoryBreakdown(summaryData.monthlyBreakdown);
        setCategoryData(processedCategories);
      } else {
        // Calculate summary from actual expense data
        calculateExpenseSummary(expenseList);
      }


      
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError(`API Error: ${error.message}`);
      
      // Use mock data for development
      const mockExpenses = generateMockExpenses();
      setExpenses(mockExpenses);
      calculateExpenseSummary(mockExpenses);
    } finally {
      setLoading(false);
    }
  };

  const generateMockExpenses = () => {
    const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Travel', 'Groceries'];
    const mockExpenses = [];
    
    // Generate expenses for the last 6 months
    for (let i = 0; i < 180; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const expense = {
        id: i + 1,
        amount: Math.floor(Math.random() * 500) + 10,
        description: `${categories[Math.floor(Math.random() * categories.length)]} expense`,
        category: categories[Math.floor(Math.random() * categories.length)],
        date: date.toISOString().split('T')[0],
        createdAt: date.toISOString()
      };
      
      mockExpenses.push(expense);
    }
    
    return mockExpenses;
  };

  const processMonthlyBreakdown = (monthlyBreakdown) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const last3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    let thisMonth = 0;
    let last3Months = 0;
    let last6Months = 0;

    Object.entries(monthlyBreakdown).forEach(([monthKey, monthData]) => {
      const amount = monthData.total_amount || 0;
      const monthDate = new Date(monthKey + '-01');

      // This month
      if (monthKey === currentMonth) {
        thisMonth = amount;
      }

      // Last 3 months (including current month)
      if (monthDate >= last3MonthsStart) {
        last3Months += amount;
      }

      // Last 6 months (including current month)
      if (monthDate >= last6MonthsStart) {
        last6Months += amount;
      }
    });

    return {
      thisMonth,
      last3Months,
      last6Months
    };
  };

  const processCategoryBreakdown = (monthlyBreakdown) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const last3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const categoryBreakdown = {
      thisMonth: {},
      last3Months: {},
      last6Months: {}
    };

    Object.entries(monthlyBreakdown).forEach(([monthKey, monthData]) => {
      const monthDate = new Date(monthKey + '-01');
      const categories = monthData.categories || {};

      // Process each category
      Object.entries(categories).forEach(([categoryName, subCategories]) => {
        let categoryTotal = 0;
        Object.values(subCategories).forEach(subCategory => {
          categoryTotal += subCategory.amount || 0;
        });

        // This month
        if (monthKey === currentMonth) {
          categoryBreakdown.thisMonth[categoryName] = (categoryBreakdown.thisMonth[categoryName] || 0) + categoryTotal;
        }

        // Last 3 months
        if (monthDate >= last3MonthsStart) {
          categoryBreakdown.last3Months[categoryName] = (categoryBreakdown.last3Months[categoryName] || 0) + categoryTotal;
        }

        // Last 6 months
        if (monthDate >= last6MonthsStart) {
          categoryBreakdown.last6Months[categoryName] = (categoryBreakdown.last6Months[categoryName] || 0) + categoryTotal;
        }
      });
    });

    return categoryBreakdown;
  };

  const calculateExpenseSummary = (expenseList) => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const summary = {
      thisMonth: 0,
      last3Months: 0,
      last6Months: 0
    };

    expenseList.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const amount = parseFloat(expense.amount) || 0;

      if (expenseDate >= thisMonthStart) {
        summary.thisMonth += amount;
      }
      
      if (expenseDate >= last3MonthsStart) {
        summary.last3Months += amount;
      }
      
      if (expenseDate >= last6MonthsStart) {
        summary.last6Months += amount;
      }
    });

    setExpenseSummary(summary);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    let startDate;

    switch (selectedPeriod) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let filtered = expenses.filter(expense => new Date(expense.date) >= startDate);
    
    // Apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }
    
    return filtered;
  };

  const getCategoryBreakdown = () => {
    // Use API category data if available and matches selected period
    if (categoryData && categoryData[selectedPeriod]) {
      return Object.entries(categoryData[selectedPeriod])
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Top 5 categories
    }

    // Fallback to calculating from filtered expenses
    const filteredExpenses = getFilteredExpenses();
    const breakdown = {};

    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      breakdown[category] = (breakdown[category] || 0) + parseFloat(expense.amount || 0);
    });

    return Object.entries(breakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 categories
  };

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading expense data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holdings-container">
        <div className="error">
          <h3>⚠️ Using Demo Data</h3>
          <p>Could not connect to expense API at <code>api/v1/expense/summary</code>. Showing sample data for demonstration.</p>
          <small>Error: {error}</small>
          <br />
          <small>Expected API endpoint: <code>GET /api/v1/expense/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD</code></small>
        </div>
      </div>
    );
  }

  const filteredExpenses = getFilteredExpenses();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="holdings-container">
      <div className="holdings-header">
        <h2>💰 Expense Report</h2>
      </div>

      {/* Expense Summary Ribbon */}
      <div className="expense-ribbon">
        <div 
          className={`ribbon-card ${selectedPeriod === 'thisMonth' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('thisMonth')}
        >
          <div className="ribbon-icon">📅</div>
          <div className="ribbon-content">
            <h3>This Month</h3>
            <p className="ribbon-amount">{formatCurrency(expenseSummary.thisMonth)}</p>
            <small>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</small>
          </div>
        </div>

        <div 
          className={`ribbon-card ${selectedPeriod === 'last3Months' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('last3Months')}
        >
          <div className="ribbon-icon">📊</div>
          <div className="ribbon-content">
            <h3>Last 3 Months</h3>
            <p className="ribbon-amount">{formatCurrency(expenseSummary.last3Months)}</p>
            <small>Quarterly Summary</small>
          </div>
        </div>

        <div 
          className={`ribbon-card ${selectedPeriod === 'last6Months' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('last6Months')}
        >
          <div className="ribbon-icon">📈</div>
          <div className="ribbon-content">
            <h3>Last 6 Months</h3>
            <p className="ribbon-amount">{formatCurrency(expenseSummary.last6Months)}</p>
            <small>Semi-Annual Summary</small>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="expense-categories">
        <h3>Top Categories - {selectedPeriod === 'thisMonth' ? 'This Month' : selectedPeriod === 'last3Months' ? 'Last 3 Months' : 'Last 6 Months'}</h3>
        {selectedCategory && (
          <div className="selected-category-info">
            <p>📁 Showing transactions for: <strong>{selectedCategory}</strong> 
              <span 
                className="clear-filter" 
                onClick={() => handleCategoryClick(selectedCategory)}
                style={{ cursor: 'pointer', marginLeft: '10px', color: '#007bff', textDecoration: 'underline' }}
              >
                ✕ Clear filter
              </span>
            </p>
          </div>
        )}
        <div className="category-grid">
          {categoryBreakdown.map(([category, amount], index) => (
            <div 
              key={category} 
              className={`category-card ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-rank">#{index + 1}</div>
              <div className="category-info">
                <h4>{category}</h4>
                <p className="category-amount">{formatCurrency(amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="expense-table-section">
        <h3>{selectedCategory ? `${selectedCategory} Expenses` : 'Recent Expenses'} ({filteredExpenses.length} items)</h3>
        {filteredExpenses.length > 0 ? (
          <div className="expense-table-container">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.slice(0, 20).map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="expense-description">{expense.description || 'No description'}</td>
                    <td className="expense-category">
                      {expense.category}
                      {expense.subcategory && ` - ${expense.subcategory}`}
                    </td>
                    <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No expenses found for the selected period</p>
            <small>Try selecting a different time range</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseReport;