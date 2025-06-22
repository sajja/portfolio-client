import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';
import './PortfolioTable.css';
import EquityTransactionSummaryTable from './EquityTransactionSummaryTable';

const initialWidths = {
  EQT: 80,
  Price: 100,
  qtty: 100,
  Date: 110,
  Value: 150,
  Comment: 350,
  notes: 350,
  Delete: 50,
};

const customStyles = {
  table: {
    style: {
      width: '80vw',
      minHeight: '40vh',
      height: '60vh',
      background: '#fff',
    },
  },
  responsiveWrapper: {
    style: {
      width: '80vw',
      minHeight: '40vh',
      height: '60vh',
    },
  },
  rows: {
    style: {
      minHeight: '36px',
    },
  },
  headRow: {
    style: {
      minHeight: '36px',
      backgroundColor: '#888',
    },
  },
  headCells: {
    style: {
      backgroundColor: '#888',
      color: '#fff',
      fontWeight: 600,
      fontSize: 15,
    },
  },
  striped: {},
};

const PortfolioTable = ({ rows, onShowTransactions, onCommentChange, onNotesChange, onDelete }) => {
  const [colWidths] = useState({ ...initialWidths });

  const columns = [
    {
      name: 'EQT',
      selector: row => row.symbol, // instead of row.name
      cell: row => (
        <span
          style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
          title="Show transactions"
          onClick={() => onShowTransactions(row.symbol)}
        >
          {row.symbol}
        </span>
      ),
      sortable: true,
      width: `${colWidths.EQT}px`,
    },
    {
      name: 'Price',
      selector: row => row.avg_price,
      sortable: true,
      width: `${colWidths.Price}px`,
    },
    {
      name: 'qtty',
      selector: row => row.qtty,
      sortable: true,
      width: `${colWidths.qtty}px`,
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
      width: `${colWidths.Date}px`,
    },
    {
      name: 'Purchase Value',
      selector: row =>
        Number(row.avg_price) && Number(row.qtty)
          ? (Number(row.avg_price) * Number(row.qtty)).toFixed(2)
          : '',
      width: `${colWidths.Value}px`,
    },
    {
      name: 'Traded price',
      selector: row =>
        Number(row.lastTradedPrice) && Number(row.qtty)
          ? (Number(row.lastTradedPrice)).toFixed(2)
          : '',
      width: `${colWidths.Value}px`,
    },
 
    {
      name: 'Comment',
      cell: (row, idx) => (
        <textarea
          rows={4}
          placeholder="Add comment"
          style={{
            width: `${Math.max(colWidths.Comment - 70, 200)}px`,
            minWidth: '200px',
            maxWidth: '100%',
            resize: 'both',
            boxSizing: 'border-box',
            overflow: 'auto',
            height: '60px',
            background: '#f7fafd', // lighter background
          }}
          value={row.comment|| ''}
          onChange={e => onCommentChange(idx, e.target.value)}
        />
      ),
      ignoreRowClick: true,
      width: `${colWidths.Comment}px`,
    },
    {
      name: <span style={{ fontSize: '1.15em', fontWeight: 'bold', letterSpacing: '1px' }}>NOTES</span>,
      cell: (row) => (
        <textarea
          rows={6} // Increased from 4 to 6
          placeholder="No note`s"
          style={{
            width: `${Math.max(colWidths.notes - 20, 350)}px`, // Wider textarea
            minWidth: '350px', // Increased min width
            maxWidth: '100%',
            resize: 'both',
            boxSizing: 'border-box',
            overflow: 'auto',
            height: '100px', // Increased height
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#333',
            background: '#f7fafd', // lighter background
          }}
          value={row.notes || ''}
          readOnly
        />
      ),
      ignoreRowClick: true,
      width: `${colWidths.notes + 50}px`, // Make the column itself wider
    },
    {
      name: '', // Empty header for save and delete
      cell: (row, idx) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Save button */}
          <img
            src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
            alt="Save"
            title="Save Comment"
            style={{ width: 22, height: 22, cursor: 'pointer', marginRight: 8 }}
            onClick={async () => {
              try {
                const response = await fetch(
                  `http://localhost:3000/api/v1/portfolio/equity/${encodeURIComponent(row.symbol)}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment: row.comment || '', notes: row.notes || '' }),
                  }
                );
                if (!response.ok) throw new Error('Failed to save comment');
                alert('Comment and notes saved!');
              } catch (err) {
                alert('Error saving comment: ' + err.message);
              }
            }}
          />
          {/* Delete button */}
          <img
            src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png"
            alt="Delete"
            title="Delete"
            style={{ width: 22, height: 22, cursor: 'pointer' }}
            onClick={() => onDelete(idx)}
          />
        </div>
      ),
      button: true,
      width: `${colWidths.Delete + 30}px`, // Make space for both icons
    },
  ];

  return (
    <div className="portfolio-table-container">
      <DataTableExtensions columns={columns} data={rows}>
        <DataTable
          dense
          highlightOnHover
          striped
          noHeader
          pagination={false}
          customStyles={customStyles}
        />
      </DataTableExtensions>
    </div>
  );
};

export default PortfolioTable;