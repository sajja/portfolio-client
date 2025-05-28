import React, { useState, useEffect } from 'react';
import './SlidingPane.css'; // Import CSS for styling

const EditableTable = () => {
  const [rows, setRows] = useState([]);
  const [showBuyPopup, setShowBuyPopup] = useState(false);
  const [showSellPopup, setShowSellPopup] = useState(false);
  const [buyForm, setBuyForm] = useState({ code: '', qtty: '', price: '' });
  const [sellForm, setSellForm] = useState({ code: '', qtty: '', price: '' });

  // Fetch data from API on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/v1/portfolio')
      .then(res => res.json())
      .then(data => setRows(data.stocks || []))
      .catch(() => setRows([]));
  }, []);

  useEffect(() => {
    console.log('rows:', rows);
  }, [rows]);

  const handleDelete = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  // Handlers for buy and sell buttons
  const handleBuy = () => {
    setShowBuyPopup(true);
  };

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
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/${buyForm.code}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qtty: Number(buyForm.qtty),
          price: Number(buyForm.price)
        }),
      });
      const responseBody = await response.text();
      console.log('POST /api/v1/portfolio/{stock}/buy response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody
      });

      if (!response.ok) throw new Error('Failed to add stock');
      const updated = await fetch('http://localhost:3000/api/v1/portfolio').then(res => res.json());
      setRows(updated.stocks || []);
      setShowBuyPopup(false);
      setBuyForm({ code: '', qtty: '', price: '' });
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
      const response = await fetch(`http://localhost:3000/api/v1/portfolio/${sellForm.code}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qtty: Number(sellForm.qtty),
          price: Number(sellForm.price)
        }),
      });
      const responseBody = await response.text();
      console.log('POST /api/v1/portfolio/{stock}/sell response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody
      });

      if (!response.ok) throw new Error('Failed to sell stock');
      // Optionally, refresh table data after successful POST
      const updated = await fetch('http://localhost:3000/api/v1/portfolio').then(res => res.json());
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

  return (
    <div id="portfolio">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Portfolio</span>
        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
            alt="Buy Stocks"
            title="Buy Stocks"
            style={{ width: 28, height: 28, marginRight: 12, cursor: 'pointer', verticalAlign: 'middle' }}
            onClick={handleBuy}
          />
          <img
            src="https://cdn-icons-png.flaticon.com/512/992/992683.png"
            alt="Sell Stocks"
            title="Sell Stocks"
            style={{ width: 28, height: 28, cursor: 'pointer', verticalAlign: 'middle' }}
            onClick={handleSell}
          />
        </div>
      </div>
      {/* Buy Popup */}
      {showBuyPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form
            onSubmit={handleBuySubmit}
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 10,
              minWidth: 400,
              boxShadow: '0 2px 16px rgba(0,0,0,0.25)'
            }}
          >
            <h3 style={{ marginBottom: 24 }}>Buy Stock</h3>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 110, fontWeight: 500 }}>Stock Code:</label>
              <input
                name="code"
                value={buyForm.code}
                onChange={handleBuyFormChange}
                required
                style={{ width: '70%', padding: 8, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 110, fontWeight: 500 }}>Quantity:</label>
              <input
                name="qtty"
                type="number"
                value={buyForm.qtty}
                onChange={handleBuyFormChange}
                required
                style={{ width: '70%', padding: 8, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 110, fontWeight: 500 }}>Price:</label>
              <input
                name="price"
                type="number"
                value={buyForm.price}
                onChange={handleBuyFormChange}
                required
                style={{ width: '70%', padding: 8, fontSize: 16 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={handleBuyCancel} style={{ padding: '8px 18px' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px' }}>Buy</button>
            </div>
          </form>
        </div>
      )}
      {/* Sell Popup */}
      {showSellPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form
            onSubmit={handleSellSubmit}
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 10,
              minWidth: 400,
              boxShadow: '0 2px 16px rgba(0,0,0,0.25)'
            }}
          >
            <h3 style={{ marginBottom: 24 }}>Sell Stock</h3>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 110, fontWeight: 500 }}>Stock:</label>
              <select
                name="code"
                value={sellForm.code}
                onChange={handleSellFormChange}
                required
                style={{ width: '70%', padding: 8, fontSize: 16 }}
              >
                {rows.map((row, idx) => (
                  <option key={idx} value={row.name}>{row.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 110, fontWeight: 500 }}>Quantity:</label>
              <input
                name="qtty"
                type="number"
                value={sellForm.qtty}
                onChange={handleSellFormChange}
                required
                min={1}
                max={rows.find(r => r.name === sellForm.code)?.qtty || 1}
                style={{ width: '70%', padding: 8, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <label style={{ width: 110, fontWeight: 500 }}>Price:</label>
              <input
                name="price"
                type="number"
                value={sellForm.price}
                onChange={handleSellFormChange}
                required
                style={{ width: '70%', padding: 8, fontSize: 16 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={handleSellCancel} style={{ padding: '8px 18px' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 18px' }}>Sell</button>
            </div>
          </form>
        </div>
      )}
      <table id="portfolio" className="editable-table">
        <thead>
          <tr>
            <th>EQT</th>
            <th>Price</th>
            <th>qtty</th>
            <th>Date</th>
            <th>Value</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.name}</td>
              <td>{row.price}</td>
              <td>{row.qtty}</td>
              <td>{row.date}</td>
              <td>
                {Number(row.price) && Number(row.qtty)
                  ? (Number(row.price) * Number(row.qtty)).toFixed(2)
                  : ''}
              </td>
              <td>
                <button onClick={() => handleDelete(idx)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SlidingPane = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mainContent, setMainContent] = useState('Main area');

  const handleTogglePane = () => setIsOpen((open) => !open);

  const handlePortfolioClick = (e) => {
    e.preventDefault();
    setMainContent(<EditableTable />);
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
            <a id="xx" href="" onClick={handlePortfolioClick}>pf</a>
          </div>
          <div>B</div>
          <div>C</div>
          <div>D</div>
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