import React from 'react';
import { Bar } from 'react-chartjs-2';

const OverallExpenseSummaryChart = ({ summary }) => {
  if (!summary) return null;
  const months = Object.keys(summary);
  const totals = months.map(m => summary[m].total);

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Total Expense',
        data: totals,
        backgroundColor: '#1976d2',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Monthly Total Expenses',
        align: 'start',
        font: { size: 16, weight: 'bold' },
        color: '#222',
        padding: { bottom: 10 },
      },
      tooltip: {
        callbacks: {
          label: ctx => `$${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 12 }, color: '#222' },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 12 }, color: '#222' },
        grid: { display: false },
      },
    },
    layout: {
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
    },
    maintainAspectRatio: false,
    barThickness: 22,
  };

  return (
    <div style={{ maxWidth: 400, minWidth: 320, margin: '0 0 4px 0', background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 2px 8px #eee', height: 260, display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ width: '100%', height: 180 }}>
        <Bar data={data} options={options} height={180} />
      </div>
    </div>
  );
};

export default OverallExpenseSummaryChart;
