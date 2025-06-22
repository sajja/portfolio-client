import React, { useState, useEffect } from 'react';

const ExpenseRawData = () => {
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError] = useState('');
  const [rawYear, setRawYear] = useState(new Date().getFullYear());
  const [rawMonth, setRawMonth] = useState(new Date().getMonth() + 1); // 1-based
  const [rawPage, setRawPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    setRawLoading(true);
    setRawError('');
    fetch(`http://localhost:3000/api/v1/expense?year=${rawYear}&month=${rawMonth}&page=${rawPage}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch raw expenses');
        return res.json();
      })
      .then(data => {
        setRawExpenses(data.expenses || []);
        setHasNextPage(Array.isArray(data.expenses) && data.expenses.length > 0);
      })
      .catch(err => {
        setRawError(err.message || 'Error loading raw expenses');
        setHasNextPage(false);
      })
      .finally(() => setRawLoading(false));
  }, [rawYear, rawMonth, rawPage]);

  useEffect(() => {
    setRawPage(1);
  }, [rawYear, rawMonth]);

  useEffect(() => {
    setRawPage(1);
  }, []);

  const handlePrevMonth = () => {
    setRawMonth(prev => {
      if (prev === 1) {
        setRawYear(y => y - 1);
        return 12;
      }
      return prev - 1;
    });
  };
  const handleNextMonth = () => {
    setRawMonth(prev => {
      if (prev === 12) {
        setRawYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  return (
    <div className="raw-data-tab">
      <table className="raw-data-header-table">
        <thead>
          <tr>
            <th className="raw-data-nav" onClick={handlePrevMonth} style={{ userSelect: 'none' }}>{'<'}</th>
            <th className="raw-data-title">{
              (() => {
                const date = new Date(rawYear, rawMonth - 1);
                const year = date.getFullYear();
                const month = date.toLocaleString('default', { month: 'long' });
                return `${year}: ${month}`;
              })()
            }</th>
            <th className="raw-data-nav" onClick={handleNextMonth} style={{ userSelect: 'none' }}>{'>'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="3" style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 2px 8px #eee', background: '#fafbfc', marginTop: 8 }}>
                {rawLoading ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading raw data...</div>
                ) : rawError ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>{rawError}</div>
                ) : (
                  <>
                    <table className="raw-data-table" style={{ minWidth: 1100, borderRadius: 8, overflow: 'hidden' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Subcategory</th>
                          <th>Description</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawExpenses.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No data</td></tr>
                        ) : (
                          rawExpenses.map(exp => (
                            <tr key={exp.id} style={{ background: exp.id % 2 === 0 ? '#f5f7fa' : '#fff' }}>
                              <td>{exp.date}</td>
                              <td>{exp.category}</td>
                              <td>{exp.subcategory}</td>
                              <td>{exp.description}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{exp.amount.toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div className="raw-data-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div>
                        {rawPage > 1 && (
                          <button
                            className="raw-data-prev-btn"
                            style={{ padding: '4px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f7fa', color: '#222', fontWeight: 500, cursor: 'pointer' }}
                            onClick={() => setRawPage(p => Math.max(1, p - 1))}
                            disabled={rawLoading}
                          >
                            &lt; Previous Page
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#222', fontWeight: 500 }}>Page {rawPage}</span>
                        {hasNextPage && (
                          <button
                            className="raw-data-next-btn"
                            style={{ marginLeft: 16, padding: '4px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f7fa', color: '#222', fontWeight: 500, cursor: 'pointer' }}
                            onClick={() => setRawPage(p => p + 1)}
                            disabled={rawLoading}
                          >
                            Next Page &gt;
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseRawData;
