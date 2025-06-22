import React, { useState, useEffect } from 'react';
import PortfolioTable from './PortfolioTable';
import BuySellPopup from './BuySellPopup';
import TransactionPopup from './TransactionPopup';
import SummarySection from './SummarySection';
import EquityTransactionSummaryTable from './EquityTransactionSummaryTable';
import './EditableTable.css';

// Define API base URL
const API_BASE = 'http://localhost:3000/api/v1';

// CollapsibleEquitySummary component
const CollapsibleEquitySummary = () => {
  const [open, setOpen] = useState(false); // Not expanded by default

  return (
    <div className="collapsible-summary-root">
      <button
        className="collapsible-summary-btn"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="collapsible-summary-arrow">{open ? '▼' : '▶'}</span>
        Equity Transaction Summary
      </button>
      {open && (
        <div className="collapsible-summary-content">
          <EquityTransactionSummaryTable />
        </div>
      )}
    </div>
  );
};

const EditableTable = () => {
  const [rows, setRows] = useState([]);
  const [showBuyPopup, setShowBuyPopup] = useState(false);
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [buyForm, setBuyForm] = useState({ code: '', qtty: '', price: '' });
  const [sellForm, setSellForm] = useState({ code: '', qtty: '', price: '' });
  const [showTxnPopup, setShowTxnPopup] = useState(false);
  const [txnRows, setTxnRows] = useState([]);
  const [txnStock, setTxnStock] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showTransactionsSection, setShowTransactionsSection] = useState(true);

  // Fetch portfolio and notes, then merge notes into portfolio rows
  const fetchPortfolio = async () => {
    // Fetch portfolio equity
    const res = await fetch(`${API_BASE}/portfolio/equity`);
    const data = await res.json();
    const stocks = data.stocks || [];

    // Fetch notes (dividend remarks)
    let notesMap = {};
    try {
      const notesRes = await fetch(`${API_BASE}/companies/dividend?own=true`);
      const notesJson = await notesRes.json();
      console.log('Notes JSON:', notesJson); // <-- Print notes JSON to console
      // For each symbol, concatenate all non-null remarks for that symbol
      notesMap = (notesJson.dividends || []).reduce((acc, div) => {
        if (div.remarks) {
          acc[div.symbol] = acc[div.symbol]
            ? acc[div.symbol] + '\n' + div.remarks
            : div.remarks;
        }
        return acc;
      }, {});
    } catch (err) {
      // If notes fetch fails, just skip notes
      notesMap = {};
    }
    console.log('Notes map:', notesMap); // <-- Print notes map to console
    // Merge notes into portfolio rows
    const mergedRows = stocks.map(row => ({
      ...row,
      notes: notesMap[row.symbol] || '', // row.name is the stock symbol
    }));
    console.log('Merged rows:', mergedRows); // <-- Print merged rows to console

    setRows(mergedRows);
  };

  // Call fetchPortfolio on mount or after save/delete
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleDelete = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleBuy = () => setShowBuyPopup(true);

  const handleSell = () => {
    setSellForm({ code: rows[0]?.name || '', qtty: '', price: '' });
    setShowSellPopup(true);
  };

  const handleBuyFormChange = (e) => {
    const { name, value } = e.target;
    setBuyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSellFormChange = (e) => {
    const { name, value } = e.target;
    setSellForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/portfolio/equity/${buyForm.code}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qtty: Number(buyForm.qtty),
          price: Number(buyForm.price)
        }),
      });
      if (!response.ok) throw new Error('Failed to add stock');
      const updated = await fetch(`${API_BASE}/portfolio/equity`).then(res => res.json());
      setRows(updated.stocks || []);
      setShowBuyPopup(false);
      setBuyForm({ code: '', qtty: '', avg_price: '' });
    } catch (err) {
      alert('Error adding stock: ' + err);
    }
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    const stock = rows.find(r => r.name === sellForm.code);
    if (!stock) {
      alert('Invalid stock selected');
      return;
    }
    if (Number(sellForm.qtty) > Number(stock.qtty)) {
      alert('Sell quantity cannot exceed available quantity');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/portfolio/equity/${sellForm.code}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qtty: Number(sellForm.qtty),
          price: Number(sellForm.price)
        }),
      });
      if (!response.ok) throw new Error('Failed to sell stock');
      const updated = await fetch(`${API_BASE}/portfolio/equity`).then(res => res.json());
      setRows(updated.stocks || []);
      setShowSellPopup(false);
      setSellForm({ code: '', qtty: '', price: '' });
    } catch (err) {
      alert('Error selling stock: ' + err);
    }
  };

  const handleBuyCancel = () => {
    setShowBuyPopup(false);
    setBuyForm({ code: '', qtty: '', price: '' });
  };

  const handleSellCancel = () => {
    setShowSellPopup(false);
    setSellForm({ code: '', qtty: '', price: '' });
  };

  const handleShowTransactions = async (stockName) => {
    setTxnStock(stockName);
    setShowTxnPopup(true);
    try {
      const res = await fetch(`${API_BASE}/portfolio/equity/${stockName}/transactions`);
      const data = await res.json();
      setTxnRows(data.transactions || []);
    } catch {
      setTxnRows([]);
    }
  };

  const handleTxnClose = () => {
    setShowTxnPopup(false);
    setTxnRows([]);
    setTxnStock('');
  };

  const handleToggleSummary = async () => {
    if (!showSummary && !summaryData) {
      try {
        const res = await fetch(`${API_BASE}/portfolio/summary`);
        const data = await res.json();
        setSummaryData(data);
        console.log('summaryData:', data); // <-- Print summaryData to console
      } catch {
        setSummaryData({ error: 'Failed to load summary' });
      }
    }
    setShowSummary((prev) => !prev);
  };

  const handleCommentChange = (idx, value) => {
    const updatedRows = [...rows];
    updatedRows[idx] = { ...updatedRows[idx], comment: value };
    setRows(updatedRows);
  };

  return (
    <div id="portfolio">
      <div className="portfolio-title">Portfolio</div>
      
      <div className="portfolio-summary-section">
        <SummarySection showSummary={showSummary} onToggle={handleToggleSummary} summaryData={summaryData} />
      </div>

      <CollapsibleEquitySummary />

      {/* Equity - Current Section */}
      <div className="portfolio-equity-current">
        <span className="portfolio-equity-current-title">Equity - Current</span>
        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
            alt="Buy Stocks"
            title="Buy Stocks"
            className="portfolio-action-icon portfolio-action-buy"
            onClick={handleBuy}
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/992/992683.png"
            alt="Sell Stocks"
            title="Sell Stocks"
            className="portfolio-action-icon"
            onClick={handleSell}
          />
        </div>
      </div>
      <PortfolioTable
        rows={rows}
        onShowTransactions={handleShowTransactions}
        onCommentChange={handleCommentChange}
        onDelete={handleDelete}
      />

      <BuySellPopup
        type="buy"
        open={showBuyPopup}
        onClose={handleBuyCancel}
        onSubmit={handleBuySubmit}
        form={buyForm}
        onFormChange={handleBuyFormChange}
      />
      <BuySellPopup
        type="sell"
        open={showSellPopup}
        onClose={handleSellCancel}
        onSubmit={handleSellSubmit}
        form={sellForm}
        onFormChange={handleSellFormChange}
        rows={rows}
      />
      <TransactionPopup
        open={showTxnPopup}
        onClose={handleTxnClose}
        stock={txnStock}
        transactions={txnRows}
      />
    </div>
  );
};

export default EditableTable;