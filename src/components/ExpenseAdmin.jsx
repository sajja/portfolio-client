import React, { useState, useEffect } from 'react';
import './ExpenseImport.css'; // Reuse some of the expense import styles

const ExpenseAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState({ id: null, name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:3000/api/v1/expense/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:3000/api/v1/expense/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      setNewCategory('');
      setSuccessMessage('Category added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'An error occurred while adding the category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory.name.trim() || !editCategory.id) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:3000/api/v1/expense/categories/${editCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editCategory.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      setEditCategory({ id: null, name: '' });
      setSuccessMessage('Category updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'An error occurred while updating the category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will affect all associated expenses.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:3000/api/v1/expense/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the category');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (category) => {
    setEditCategory({ id: category.id, name: category.name });
  };

  const cancelEdit = () => {
    setEditCategory({ id: null, name: '' });
  };

  return (
    <div className="expense-table-root">
      <h2>Expense Administration</h2>
      
      {error && (
        <div className="import-status-message error">{error}</div>
      )}
      
      {successMessage && (
        <div className="import-status-message success">{successMessage}</div>
      )}
      
      <div className="expense-admin-container" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>Category Management</h3>
        
        {/* Add new category */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '6px' }}>
          <h4>Add New Category</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name"
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', flex: '1' }}
            />
            <button 
              onClick={handleAddCategory}
              disabled={loading}
              className="import-btn"
            >
              Add Category
            </button>
          </div>
        </div>
        
        {/* Categories list */}
        <div>
          <h4>Existing Categories</h4>
          {loading && <div>Loading categories...</div>}
          {!loading && categories.length === 0 ? (
            <div>No categories found. Add your first category above.</div>
          ) : (
            <div className="expense-table-scroll">
              <table className="expense-preview-table styled-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        {editCategory.id === category.id ? (
                          <input
                            type="text"
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                          />
                        ) : (
                          category.name
                        )}
                      </td>
                      <td>
                        {editCategory.id === category.id ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={handleUpdateCategory}
                              style={{ background: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => startEdit(category)}
                              style={{ background: '#2196f3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseAdmin;
