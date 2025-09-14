import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './modal.css';

const TransactionModal = ({ isOpen, onClose, stockSymbol }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && stockSymbol) {
      fetchTransactions();
    }
  }, [isOpen, stockSymbol]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/equity/${stockSymbol}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
      toast.error(`Error fetching transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTransactions([]);
    setError(null);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPercent = (percent) => {
    if (percent === null || percent === undefined) return '-';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const calculateProfitLossPercent = (transaction, avgBuyPrice) => {
    // Only calculate percentage for sell transactions
    if (transaction.type !== 'sell' || !avgBuyPrice || avgBuyPrice === 0) {
      return null;
    }
    
    const sellPrice = transaction.price;
    return ((sellPrice - avgBuyPrice) / avgBuyPrice) * 100;
  };

  // Calculate average buy price from all buy transactions
  const getAverageBuyPrice = () => {
    const buyTransactions = transactions.filter(t => t.type === 'buy');
    if (buyTransactions.length === 0) return 0;
    
    let totalQuantity = 0;
    let totalValue = 0;
    
    buyTransactions.forEach(transaction => {
      totalQuantity += transaction.qtty;
      totalValue += transaction.qtty * transaction.price;
    });
    
    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="transaction-modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>{stockSymbol} Transactions</h2>
        
        {loading && (
          <div className="loading-container">
            <p>Loading transactions...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={fetchTransactions} className="retry-button">
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && transactions.length === 0 && (
          <div className="no-transactions">
            <p>No transactions found for {stockSymbol}</p>
          </div>
        )}
        
        {!loading && !error && transactions.length > 0 && (
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Profit/Loss</th>
                  <th>P/L %</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => {
                  const avgBuyPrice = getAverageBuyPrice();
                  const profitLossPercent = calculateProfitLossPercent(transaction, avgBuyPrice);
                  
                  return (
                    <tr key={index}>
                      <td>
                        <span className={`transaction-type ${transaction.type}`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{transaction.qtty.toLocaleString()}</td>
                      <td>{formatCurrency(transaction.price)}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        {transaction.profit_loss !== null ? (
                          <span className={`profit-loss ${transaction.profit_loss >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(transaction.profit_loss)}
                          </span>
                        ) : (
                          <span className="no-profit-loss">-</span>
                        )}
                      </td>
                      <td>
                        {profitLossPercent !== null ? (
                          <span className={`profit-loss ${profitLossPercent >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(profitLossPercent)}
                          </span>
                        ) : (
                          <span className="no-profit-loss">-</span>
                        )}
                      </td>
                      <td>{formatCurrency(transaction.qtty * transaction.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
