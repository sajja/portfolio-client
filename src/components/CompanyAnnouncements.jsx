import React, { useState, useEffect } from 'react';

const CompanyAnnouncements = () => {
  const [myCompanies, setMyCompanies] = useState([]);
  const [otherCompanies, setOtherCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyAnnouncements = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch companies I own with dividend announcements
        const res = await fetch('http://localhost:3000/api/v1/companies/dividend?own=true');
        if (!res.ok) throw new Error('Failed to fetch dividends');
        const data = await res.json();
        // Map to correct fields for table columns
        const companies = (data.dividends || []).map(div => ({
          symbol: div.symbol,
          remarks: div.remarks || '-',
          xd_date: div.xd_date || '-',
          payment_date: div.payment_date || '-',
          div_ps: div.div_ps || '-',
        }));
        setMyCompanies(companies);

        // Example static data for other companies (can be replaced with real API)
        setOtherCompanies([
          { name: 'Gamma Inc', announcement: 'New product launch next month.' },
          { name: 'Delta PLC', announcement: 'Rights issue announced.' },
        ]);
      } catch (err) {
        setError(err.message || 'Failed to load company announcements');
        setMyCompanies([{ symbol: 'Error', remarks: err.message, xd_date: '-', payment_date: '-', div_ps: '-' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyAnnouncements();
  }, []);

  if (loading) {
    return <div>Loading company announcements...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="company-announcements-table">
      <h2>Company Announcements</h2>
      <div>
        <div style={{ flex: 1, marginBottom: 32 }}>
          <h3>Companies I Own</h3>
          <table className="styled-table" width={'100%'}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Remarks</th>
                <th>XD Date</th>
                <th>Payment Date</th>
                <th>Div/Share</th>
              </tr>
            </thead>
            <tbody>
              {myCompanies.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No announcements</td></tr>
              ) : (
                myCompanies.map((div, i) => (
                  <tr key={i}>
                    <td>{div.symbol}</td>
                    <td colSpan={1}>
                      <textarea
                        readOnly
                        value={div.remarks}
                        style={{ minWidth: 400, maxWidth: 600, width: '100%', whiteSpace: 'pre-line', wordBreak: 'break-word', background: '#f7fafd', border: '1px solid #ddd', borderRadius: 4, padding: 6, fontSize: '1em', color: '#222', resize: 'vertical' }}
                      />
                    </td>
                    <td>{div.xd_date}</td>
                    <td>{div.payment_date}</td>
                    <td>{div.div_ps}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1 }}>
          <h3>All Other Companies</h3>
          <table className="styled-table">
            <thead>
              <tr><th>Company</th><th>Announcement</th></tr>
            </thead>
            <tbody>
              {otherCompanies.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No announcements</td></tr>
              ) : (
                otherCompanies.map((c, i) => (
                  <tr key={i}><td>{c.name}</td><td>{c.announcement}</td></tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnnouncements;
