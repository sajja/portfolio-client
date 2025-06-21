import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ExpenseSummaryCharts = ({ summary }) => {
  const [pieData, setPieData] = useState(null);
  const [subcatTable, setSubcatTable] = useState(null);
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
        setSubcatTable({
          cat,
          rows: subcats.map(([subcat, value]) => ({ subcat, value })),
        });
      } else {
        setSubcatTable({ cat, rows: [] });
      }
    }
  };

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
          <div style={{ width: 320, height: 280, background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px #eee', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
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
                  <tr key={i}>
                    <td style={{ padding: '4px 8px' }}>{row.subcat}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ExpenseSummaryCharts;
