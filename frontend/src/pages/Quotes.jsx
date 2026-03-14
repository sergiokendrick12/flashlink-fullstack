import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Search, Download } from 'lucide-react';
import api from '../utils/api';

const statusColors = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  reviewing: { bg: '#DBEAFE', color: '#1E40AF' },
  quoted: { bg: '#D1FAE5', color: '#065F46' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
};

const downloadPDF = async (quoteId, quoteNumber) => {
  const token = localStorage.getItem('fl_token');
  const res = await fetch(`http://localhost:5000/api/quotes/${quoteId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FlashLink-${quoteNumber}.pdf`;
  a.click();
};

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/quotes/my?t=' + Date.now())
      .then(res => setQuotes(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = quotes.filter(q => {
    const matchSearch = q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.origin?.country?.toLowerCase().includes(search.toLowerCase()) ||
      q.destination?.country?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || q.status === filter;
    return matchSearch && matchFilter;
  });

  const acceptQuote = async (id) => {
    await api.put('/quotes/' + id, { status: 'accepted' });
    setQuotes(q => q.map(x => x._id === id ? { ...x, status: 'accepted' } : x));
  };

  const rejectQuote = async (id) => {
    await api.put('/quotes/' + id, { status: 'rejected' });
    setQuotes(q => q.map(x => x._id === id ? { ...x, status: 'rejected' } : x));
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'reviewing', label: 'Reviewing' },
    { key: 'quoted', label: 'Quoted' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>
      {/* Header */}
      <div style={{ background: '#0B1C3F', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>My Quotes</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 6 }}>View and manage all your quote requests</p>
          </div>
          <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '10px 22px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            + New Quote
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 5%' }}>
        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by quote number or country..."
              style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', background: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: filter === f.key ? '#0B1C3F' : 'white', color: filter === f.key ? 'white' : '#6B7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>Loading quotes...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: '#0B1C3F', fontFamily: 'Syne', fontWeight: 700, margin: '0 0 8px' }}>No quotes found</h3>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
              {quotes.length === 0 ? "You haven't requested any quotes yet." : "No quotes match your search."}
            </p>
            {quotes.length === 0 && (
              <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '10px 22px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem' }}>Request a Quote</Link>
            )}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Quote #', 'Service', 'Route', 'Date', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{q.quoteNumber}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6B7280', textTransform: 'capitalize' }}>{q.serviceType}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6B7280' }}>
                      {q.origin?.country} → {q.destination?.country}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#9CA3AF' }}>
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {q.quotedPrice ? (
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065F46' }}>{q.currency || 'USD'} {q.quotedPrice.toLocaleString()}</div>
                          {q.validUntil && <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 2 }}>Valid until {new Date(q.validUntil).toLocaleDateString()}</div>}
                          {q.agentNotes && <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2, fontStyle: 'italic' }}>{q.agentNotes}</div>}
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: statusColors[q.status]?.bg || '#F3F4F6', color: statusColors[q.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {q.status === 'quoted' && (
                          <>
                            <button onClick={() => acceptQuote(q._id)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#D1FAE5', color: '#065F46', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>✅ Accept</button>
                            <button onClick={() => rejectQuote(q._id)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>❌ Reject</button>
                          </>
                        )}
                        <button onClick={() => downloadPDF(q._id, q.quoteNumber)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F0A500', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                          <Download size={14} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}