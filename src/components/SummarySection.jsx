import React from 'react';
import './SummarySection.css'; // Make sure to create this CSS file

const SummarySection = ({ showSummary, onToggle, summaryData }) => (
  <div className="summary-section-root">
    <button className="summary-toggle-btn" onClick={onToggle}>
      <span className="summary-toggle-arrow">{showSummary ? '▼' : '▶'}</span>
      Summery
    </button>
    {showSummary && (
      <div className="summary-content">
        {summaryData ? (
          summaryData.error ? (
            <div className="summary-error">{summaryData.error}</div>
          ) : (
            <>
              <table className="summary-table">
                <thead>
                  <tr className="summary-table-header-row">
                    <th className="summary-table-header summary-table-header-left"></th>
                    <th className="summary-table-header">24 Months</th>
                    <th className="summary-table-header">12 Months</th>
                    <th className="summary-table-header summary-table-header-right">6 Months</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="summary-table-row">
                    <td className="summary-table-label">Investment</td>
                    <td className="summary-table-cell">
                      {summaryData.equity?.summary_24_months
                        ? summaryData.equity.summary_24_months.total_investment
                        : '-'}
                    </td>
                    <td className="summary-table-cell">
                      {summaryData.equity?.summary_12_months
                        ? summaryData.equity.summary_12_months.total_investment
                        : '-'}
                    </td>
                    <td className="summary-table-cell">
                      {summaryData.equity?.summary_6_months
                        ? summaryData.equity.summary_6_months.total_investment
                        : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="summary-table-label">Profit %</td>
                    <td className="summary-table-cell">
                      {summaryData.equity?.summary_24_months?.profit_percent !== undefined
                        ? summaryData.equity.summary_24_months.profit_percent + '%'
                        : '-'}
                    </td>
                    <td className="summary-table-cell">
                      {summaryData.equity?.summary_12_months?.profit_percent !== undefined
                        ? summaryData.equity.summary_12_months.profit_percent + '%'
                        : '-'}
                    </td>
                    <td className="summary-table-cell">
                      {summaryData.equity?.summary_6_months?.profit_percent !== undefined
                        ? summaryData.equity.summary_6_months.profit_percent + '%'
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    )}
  </div>
);

export default SummarySection;