import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ExpenseSummaryCharts = ({ summary }) => {
  const [pieData, setPieData] = useState(null);
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
        return;
      }
      const monthData = summary[month];
      if (monthData && monthData.categories) {
        const cats = Object.entries(monthData.categories);
        const pie = {
          labels: cats.map(([cat]) => cat),
          datasets: [
            {
              data: cats.map(([, val]) => val),
              backgroundColor: cats.map((_, i) => `hsl(${(i * 47) % 360}, 60%, 60%)`),
            },
          ],
        };
        setPieData({ pie, month });
      } else {
        setPieData(null);
      }
    }
  };

  // Chart for monthly category breakdown
  const summaryArr = months.map(m => summary[m] || {});
  const allCats = Array.from(new Set(
    summaryArr.flatMap(m => m.categories ? Object.keys(m.categories) : [])
  ));
  const categoryChartData = {
    labels: months,
    datasets: allCats.map((cat, i) => ({
      label: cat,
      data: summaryArr.map(m => (m.categories && m.categories[cat] !== undefined) ? m.categories[cat] : 0),
      backgroundColor: `hsl(${(i * 47) % 360}, 60%, 60%)`,
    })),
  };
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
              }}
              width={250}
              height={180}
            />
          </div>
        )}
      </div>
      <div style={{ maxWidth: `80%`, minWidth: 220, background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 2px 8px #eee', height: 320 }}>
        <Bar
          key={`category-bar-${allCats.join('-')}`}
          data={categoryChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Monthly Expenses by Category' },
            },
            scales: {
              y: { beginAtZero: true }
            }
          }}
          height={240}
        />
      </div>
    </>
  );
};

export default ExpenseSummaryCharts;
