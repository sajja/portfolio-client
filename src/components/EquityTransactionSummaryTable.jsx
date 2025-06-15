import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';

const columns = [
	{
		name: 'Stock',
		selector: (row) => row.stock,
		sortable: true,
		width: '120px',
	},
	{
		name: 'Type',
		selector: (row) => row.type,
		sortable: true,
		width: '110px', // Increased from 80px to 110px
	},
	{
		name: 'Quantity',
		selector: (row) => row.qtty,
		sortable: true,
		width: '120px',
	},
	{
		name: 'Price',
		selector: (row) => row.price,
		sortable: true,
		width: '100px',
	},
	{
		name: 'Date',
		selector: (row) => row.date,
		sortable: true,
		width: '140px',
	},
	{
		name: 'Profit/Loss',
		selector: (row) => (row.profit_loss !== null ? row.profit_loss : ''),
		sortable: true,
		width: '150px',
	},
];

const customStyles = {
	table: {
		style: {
			width: '95vw',
			minHeight: '20vh',
			background: '#fff',
			color: '#000', // Set table font color to black
		},
	},
	rows: {
		style: {
			minHeight: '36px',
			color: '#000', // Set row font color to black
		},
	},
	headRow: {
		style: {
			minHeight: '36px',
			backgroundColor: '#888',
			color: '#000', // Set header row font color to black
		},
	},
	headCells: {
		style: {
			backgroundColor: '#888',
			color: '#000', // Set header cell font color to black
			fontWeight: 600,
			fontSize: 15,
		},
	},
};

const EquityTransactionSummaryTable = () => {
	const [data, setData] = useState([]);
	const [filterText, setFilterText] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSummary = async () => {
			try {
				const res = await fetch(
					'http://localhost:3000/api/v1/portfolio/equity/transactions'
				);
				const json = await res.json();
				setData(json.transactions || []);
			} catch (err) {
				setData([]);
			} finally {
				setLoading(false);
			}
		};
		fetchSummary();
	}, []);

	// Filter logic: filter by stock, type, or date (case-insensitive)
	const filteredData = data.filter(
		(row) =>
			row.stock?.toLowerCase().includes(filterText.toLowerCase()) ||
			row.type?.toLowerCase().includes(filterText.toLowerCase()) ||
			row.date?.toLowerCase().includes(filterText.toLowerCase())
	);

	return (
		<div style={{ margin: '16px 0' }}>
			<div style={{ marginBottom: 12 }}>
				<input
					type="text"
					placeholder="Filter by stock, type, or date"
					value={filterText}
					onChange={(e) => setFilterText(e.target.value)}
					style={{
						padding: 6,
						fontSize: 15,
						borderRadius: 4,
						border: '1px solid #bbb',
						width: 260,
						marginRight: 8,
					}}
				/>
			</div>
			<DataTable
				columns={columns}
				data={filteredData}
				dense
				highlightOnHover
				striped
				noHeader
				pagination={false}
				customStyles={customStyles}
				progressPending={loading}
			/>
		</div>
	);
};

export default EquityTransactionSummaryTable;