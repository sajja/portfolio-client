import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/AuthService';
import './modal.css';

const ExpenseModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    category: '',
    subcategory: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    // When category changes, update subcategories
    if (expenseForm.category) {
      const selectedCategory = categories.find(cat => cat.name === expenseForm.category);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubcategories(selectedCategory.subcategories);
      } else {
        setSubcategories([]);
      }
      // Reset subcategory when category changes
      setExpenseForm(prev => ({ ...prev, subcategory: '' }));
    } else {
      setSubcategories([]);
    }
  }, [expenseForm.category, categories]);

  const fetchCategories = async () => {
    try {
      const response = await authService.makeAuthenticatedRequest('api/v1/expense/categories');
      
      if (response.ok) {
        const data = await response.json();
        // API returns: { categories: { "Auto": ["Fuel", "Maintenance"], ... } }
        // Convert to array format: [{ name: "Auto", subcategories: ["Fuel", "Maintenance"] }, ...]
        if (data.categories && typeof data.categories === 'object') {
          const categoriesArray = Object.keys(data.categories).map(categoryName => ({
            name: categoryName,
            subcategories: data.categories[categoryName]
          }));
          setCategories(categoriesArray);
        } else {
          setDefaultCategories();
        }
      } else {
        // If API fails, use some default categories
        setDefaultCategories();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories on error
      setDefaultCategories();
    }
  };

  const setDefaultCategories = () => {
    setCategories([
      { 
        name: 'Household', 
        subcategories: ['Entertainment', 'Grocery', 'Maintenance', 'Meals', 'Other']
      },
      { 
        name: 'Auto', 
        subcategories: ['Fuel', 'Maintenance']
      },
      { 
        name: 'Utility', 
        subcategories: ['Electricity', 'Internet', 'Mobile']
      },
      { 
        name: 'Investment', 
        subcategories: ['Index', 'Pension']
      },
      { 
        name: 'Other', 
        subcategories: ['Other']
      }
    ]);
  };

  const handleFormChange = (field, value) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!expenseForm.description || expenseForm.description.trim() === '') {
      toast.error('Please enter a description');
      return;
    }
    
    if (!expenseForm.category) {
      toast.error('Please select a category');
      return;
    }

    if (!expenseForm.subcategory) {
      toast.error('Please select a subcategory');
      return;
    }

    if (!expenseForm.date) {
      toast.error('Please select a date');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate a UUID for the expense
      const uuid = crypto.randomUUID();
      
      const response = await authService.makeAuthenticatedRequest('api/v1/expense', {
        method: 'POST',
        body: JSON.stringify({
          uuid: uuid,
          date: expenseForm.date,
          category: expenseForm.category,
          subcategory: expenseForm.subcategory,
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }

      const result = await response.json();
      
      console.log('Expense created successfully:', result);
      toast.success('Expense added successfully!');
      handleClose(true);

    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (shouldRefetch = false) => {
    setExpenseForm({
      amount: '',
      description: '',
      category: '',
      subcategory: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSubcategories([]);
    onClose(shouldRefetch);
  };

  if (!isOpen) return null;

  return (
    <div className="buy-modal">
      <div className="modal-content">
        <span className="close" onClick={() => handleClose(false)}>&times;</span>
        <h2>Add New Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="expense-amount">Amount</label>
            <input
              type="number"
              id="expense-amount"
              value={expenseForm.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expense-description">Description</label>
            <input
              type="text"
              id="expense-description"
              value={expenseForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="What did you spend on?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expense-category">Category</label>
            <select
              id="expense-category"
              value={expenseForm.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div className="form-group">
              <label htmlFor="expense-subcategory">Subcategory</label>
              <select
                id="expense-subcategory"
                value={expenseForm.subcategory}
                onChange={(e) => handleFormChange('subcategory', e.target.value)}
                required
              >
                <option value="">Select a subcategory</option>
                {Array.isArray(subcategories) && subcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="expense-date">Date</label>
            <input
              type="date"
              id="expense-date"
              value={expenseForm.date}
              onChange={(e) => handleFormChange('date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => handleClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
