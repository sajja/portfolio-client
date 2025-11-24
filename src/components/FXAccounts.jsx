import React, { useState, useEffect } from 'react';
import authService from '../services/AuthService';
import FXAccountModal from './FXAccountModal';
import './holdings.css';

const FXAccounts = ({ onBack }) => {
  const [fxAccounts, setFxAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFXAccounts = async () => {
    try {
      setLoading(true);
      
      const response = await authService.makeAuthenticatedRequest('api/v1/portfolio/fx');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform FX deposits data
      const transformedAccounts = (data.fxDeposits || []).map((deposit, index) => ({
        id: deposit.id || index + 1,
        currency: deposit.currency || 'USD',
        amount: deposit.amount || 0,
        interestRate: deposit.interestRate || 0,
        usdValue: deposit.amount || 0, // Assuming amounts are already in USD or need conversion
        bank: deposit.bankName || 'Unknown Bank',
        date: deposit.date,
        createdAt: deposit.createdAt
      }));
      
      setFxAccounts(transformedAccounts);
    } catch (err) {
      console.error('Error fetching FX accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    setIsDeleting(true);

    try {
      const response = await authService.makeAuthenticatedRequest(`api/v1/portfolio/fx/${accountToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete FX account: ${response.status}`);
      }

      // Remove the account from local state
      setFxAccounts(prevAccounts => 
        prevAccounts.filter(account => account.id !== accountToDelete.id)
      );

      console.log(`Successfully deleted FX account ${accountToDelete.id}`);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error deleting FX account:', error);
      alert(`Failed to delete FX account: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (account = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const closeModal = (shouldRefetch = false) => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setIsLoading(false);
    setError(null);
    
    if (shouldRefetch) {
      fetchFXAccounts();
    }
  };

  const handleSubmit = async (fxData) => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (editingAccount) {
        // Update existing account
        response = await authService.makeAuthenticatedRequest(`api/v1/portfolio/fx/${editingAccount.id}`, {
          method: 'POST',
          body: JSON.stringify(fxData),
        });
      } else {
        // Create new account
        response = await authService.makeAuthenticatedRequest('api/v1/portfolio/fx', {
          method: 'PUT',
          body: JSON.stringify(fxData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingAccount ? 'update' : 'create'} FX account`);
      }

      const result = await response.json();
      console.log('FX account operation successful:', result);
      
      // Close modal and refresh data
      closeModal(true);
      
    } catch (error) {
      console.error('Error with FX account operation:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFXAccounts();
  }, []);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate totals
  const totalUSDValue = fxAccounts.reduce((sum, account) => sum + account.usdValue, 0);
  const uniqueCurrencies = [...new Set(fxAccounts.map(account => account.currency))];
  const averageInterestRate = fxAccounts.length > 0 
    ? fxAccounts.reduce((sum, account) => sum + (account.interestRate || 0), 0) / fxAccounts.length
    : 0;

  if (loading) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>FX Deposits</h2>
        </div>
        <div className="loading">Loading FX deposits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holdings-container">
        <div className="holdings-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>FX Deposits</h2>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="holdings-container">
      <div className="holdings-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            ← Back to Portfolio
          </button>
          <h2>FX Deposits</h2>
        </div>
        <button className="action-btn fx-btn" onClick={() => openModal()}>
          <span className="btn-icon">💱</span>
          Add FX Account
        </button>
      </div>

      {/* FX Accounts Summary */}
      <div className="fx-summary">
        <div className="summary-card">
          <h3>Total USD Value</h3>
          <p className="total-value">{formatCurrency(totalUSDValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Number of Deposits</h3>
          <p className="total-value">{fxAccounts.length}</p>
        </div>
        <div className="summary-card">
          <h3>Currencies</h3>
          <p className="total-value">{uniqueCurrencies.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Interest Rate</h3>
          <p className="interest-rate">{averageInterestRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* FX Accounts Table */}
      {fxAccounts.length > 0 ? (
        <div className="fx-table-container">
          <table className="fx-table">
            <thead>
              <tr>
                <th>Bank</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Date</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fxAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="bank-name">{account.bank}</td>
                  <td className="currency">{account.currency}</td>
                  <td className="usd-value">{formatCurrency(account.amount, account.currency)}</td>
                  <td className="interest-rate">{account.interestRate.toFixed(2)}%</td>
                  <td>{account.date ? new Date(account.date).toLocaleDateString() : 'N/A'}</td>
                  <td>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleDeleteClick(account)}
                      className="delete-btn"
                      title="Delete FX Account"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No FX deposits found</p>
          <small>Add your first foreign exchange deposit to get started</small>
        </div>
      )}

      {/* Add/Edit FX Account Modal */}
      <FXAccountModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingAccount={editingAccount}
        isLoading={isLoading}
        error={error}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        accountInfo={accountToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, accountInfo, isDeleting }) => {
  if (!isOpen || !accountInfo) return null;

  return (
    <div className="delete-modal">
      <div className="modal-content">
        <span className="close" onClick={onCancel}>&times;</span>
        <h2>🗑️ Confirm Delete</h2>
        
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this FX account?</p>
          
          <div className="account-details">
            <div className="form-group">
              <label>Bank:</label>
              <span>{accountInfo.bank}</span>
            </div>
            <div className="form-group">
              <label>Currency:</label>
              <span>{accountInfo.currency}</span>
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <span>{accountInfo.amount} {accountInfo.currency}</span>
            </div>
          </div>
          
          <div className="warning-text">
            <span>⚠️</span>
            <p>This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="btn-delete"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};;

export default FXAccounts;
