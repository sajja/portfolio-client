import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ExpenseSummaryCharts = ({ summary }) => {
  const [pieData, setPieData] = useState(null);
  const [subcatTable, setSubcatTable] = useState(null);
  const [selectedSubcat, setSelectedSubcat] = useState(null);
  const [subcatTransactions, setSubcatTransactions] = useState([]);
  const [loadingSubcat, setLoadingSubcat] = useState(false);
  const [subcatError, setSubcatError] = useState(null);
  if (!summary) return null;

  // Get months in reverse order
  const months = Object.keys(summary).slice().reverse();

  // Chart for monthly totals
  const totalChartData = {
    labels: months,
    datasets: [
      {
        label: 'Total Expense',
        data: months.map(m => summary[m]?.total ?? 0),
        backgroundColor: '#1976d2',
      },
    ],
  };

  // Chart click handler for month bars
  const handleBarClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const chart = elements[0];
      const month = totalChartData.labels[chart.index];
      // Toggle pie chart: hide if same month is clicked again
      if (pieData && pieData.month === month) {
        setPieData(null);
        setSubcatTable(null); // Hide subcat table when changing month
        return;
      }
      const monthData = summary[month];
      if (monthData && monthData.categories) {
        // New structure: categories is an object with {total, subcategories}
        let cats = Object.entries(monthData.categories)
          .map(([cat, val]) => ({ cat, total: val.total ?? 0 }))
          .sort((a, b) => b.total - a.total);
        // Show only top 10 categories
        cats = cats.slice(0, 10);
        const pie = {
          labels: cats.map(c => c.cat),
          datasets: [
            {
              data: cats.map(c => c.total),
              backgroundColor: cats.map((_, i) => `hsl(${(i * 47) % 360}, 60%, 60%)`),
            },
          ],
        };
        setPieData({ pie, month });
        setSubcatTable(null); // Hide subcat table when changing month
      } else {
        setPieData(null);
        setSubcatTable(null);
      }
    }
  };

  // Pie chart click handler
  const handlePieClick = (event, elements) => {
    if (elements && elements.length > 0 && pieData) {
      const chart = elements[0];
      const cat = pieData.pie.labels[chart.index];
      const monthData = summary[pieData.month];
      if (monthData && monthData.categories && monthData.categories[cat] && monthData.categories[cat].subcategories) {
        const subcats = Object.entries(monthData.categories[cat].subcategories);
        const catTotal = monthData.categories[cat].total ?? 0;
        setSubcatTable({
          cat,
          rows: subcats.map(([subcat, value]) => ({
            subcat,
            value: catTotal > 0 ? ((value / catTotal) * 100).toFixed(1) + '%' : '0%'
          })),
        });
        setSelectedSubcat(null); // Reset selected subcat when pie changes
      } else {
        setSubcatTable({ cat, rows: [] });
        setSelectedSubcat(null);
      }
    }
  };

  // Handler for subcategory click
  const handleSubcatClick = (subcat) => {
    setSelectedSubcat(subcat);
  };

  // Fetch transactions for selected subcategory
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedSubcat || !pieData) {
        setSubcatTransactions([]);
        setSubcatError(null);
        return;
      }
      setLoadingSubcat(true);
      setSubcatError(null);
      try {
        const year = pieData.month.split('-')[0];
        const month = pieData.month.split('-')[1];
        const resp = await fetch(`http://localhost:3000/api/v1/expense?year=${year}&month=${month}`);
        if (!resp.ok) throw new Error('Failed to fetch expenses');
        const data = await resp.json();
        // Filter for selected category and subcategory
        const cat = subcatTable.cat;
        const filtered = (data.expenses || []).filter(e => e.category === cat && e.subcategory === selectedSubcat);
        setSubcatTransactions(filtered);
      } catch (e) {
        setSubcatError(e.message);
        setSubcatTransactions([]);
      } finally {
        setLoadingSubcat(false);
      }
    };
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcat, pieData, subcatTable?.cat]);

  // Chart for monthly category breakdown
//   const summaryArr = months.map(m => summary[m] || {});
//   const allCats = Array.from(new Set(
//     summaryArr.flatMap(m => m.categories ? Object.keys(m.categories) : [])
//   ));
//   const categoryChartData = {
//     labels: months,
//     datasets: allCats.map((cat, i) => ({
//       label: cat,
//       data: summaryArr.map(m => (m.categories && m.categories[cat] !== undefined) ? m.categories[cat] : 0),
//       backgroundColor: `hsl(${(i * 47) % 360}, 60%, 60%)`,
//     })),
//   };
  return (
    <>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ maxWidth: 400, minWidth: 320, background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 2px 8px #eee', height: 260 }}>
          <Bar
            key="total-expense-bar"
            data={totalChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Monthly Total Expenses' },
              },
              scales: {
                y: { beginAtZero: true }
              },
              onClick: handleBarClick
            }}
            height={180}
          />
        </div>
        {pieData && (
          <div style={{ width: 520, height: 280, background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h4 style={{ textAlign: 'center', margin: 0 }}>{pieData.month} Category Breakdown</h4>
            <Pie
              data={pieData.pie}
              options={{
                plugins: {
                  legend: { display: true, position: 'right' },
                  title: { display: false },
                },
                responsive: false,
                maintainAspectRatio: false,
                onClick: handlePieClick,
              }}
              width={250}
              height={180}
            />
          </div>
        )}
        {subcatTable && (
          <div style={{ width: 320, height: selectedSubcat ? 420 : 280, background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px #eee', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <h4 style={{ textAlign: 'center', margin: 0, width: '100%' }}>Subcategory Breakdown</h4>
            <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Subcategory</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {subcatTable.rows.map((row, i) => (
                  <tr key={i} style={{ cursor: 'pointer', background: selectedSubcat === row.subcat ? '#e3f2fd' : undefined }} onClick={() => handleSubcatClick(row.subcat)}>
                    <td style={{ padding: '4px 8px' }}>{row.subcat}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedSubcat && (
              <div style={{ marginTop: 18, width: '100%' }}>
                <h5 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>Transactions for <span style={{ color: '#1976d2' }}>{selectedSubcat}</span></h5>
                {loadingSubcat ? (
                  <div style={{ textAlign: 'center', color: '#888', margin: '12px 0' }}>Loading...</div>
                ) : subcatError ? (
                  <div style={{ color: 'red', textAlign: 'center', margin: '12px 0' }}>{subcatError}</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ textAlign: 'left', padding: '3px 6px' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '3px 6px' }}>Description</th>
                        <th style={{ textAlign: 'right', padding: '3px 6px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subcatTransactions.length === 0 ? (
                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 8 }}>No transactions found.</td></tr>
                      ) : (
                        subcatTransactions.map(txn => (
                          <tr key={txn.id}>
                            <td style={{ padding: '3px 6px' }}>{txn.date}</td>
                            <td style={{ padding: '3px 6px' }}>{txn.description}</td>
                            <td style={{ padding: '3px 6px', textAlign: 'right' }}>₹{txn.amount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ExpenseSummaryCharts;
