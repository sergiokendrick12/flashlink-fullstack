import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Package, FileText, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const shipmentColors = {
  booked: { bg: '#EDE9FE', color: '#5B21B6' },
  picked_up: { bg: '#DBEAFE', color: '#1E40AF' },
  in_transit: { bg: '#FEF3C7', color: '#92400E' },
  at_port: { bg: '#FEF3C7', color: '#92400E' },
  customs: { bg: '#FEE2E2', color: '#991B1B' },
  out_for_delivery: { bg: '#D1FAE5', color: '#065F46' },
  delivered: { bg: '#D1FAE5', color: '#065F46' },
  exception: { bg: '#FEE2E2', color: '#991B1B' },
};

const statusColors = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  reviewing: { bg: '#DBEAFE', color: '#1E40AF' },
  quoted: { bg: '#D1FAE5', color: '#065F46' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [shipments, setShipments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/shipments/my').catch(() => ({ data: { data: [] } })),
      api.get('/quotes/my').catch(() => ({ data: { data: [] } })),
    ]).then(([sRes, qRes]) => {
      setShipments(sRes.data.data || []);
      setQuotes(qRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const q = query.toLowerCase().trim();

  const filteredShipments = shipments.filter(s => {
    if (filter === 'quotes') return false;
    if (!q) return filter === 'all' || filter === 'shipments';
    return (
      s.trackingNumber?.toLowerCase().includes(q) ||
      s.origin?.city?.toLowerCase().includes(q) ||
      s.origin?.country?.toLowerCase().includes(q) ||
      s.destination?.city?.toLowerCase().includes(q) ||
      s.destination?.country?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q) ||
      s.serviceType?.toLowerCase().includes(q)
    );
  });

  const filteredQuotes = quotes.filter(q2 => {
    if (filter === 'shipments') return false;
    if (!q) return filter === 'all' || filter === 'quotes';
    return (
      q2.quoteNumber?.toLowerCase().includes(q) ||
      q2.origin?.country?.toLowerCase().includes(q) ||
      q2.destination?.country?.toLowerCase().includes(q) ||
      q2.status?.toLowerCase().includes(q) ||
      q2.serviceType?.toLowerCase().includes(q)
    );
  });

  const totalResults = filteredShipments.length + filteredQuotes.length;
  const hasQuery = q.length > 0;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'shipments', label: `Shipments (${shipments.length})` },
    { key: 'quotes', label: `Quotes (${quotes.length})` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: '2.5rem 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'white', margin: '0 0 6px' }}>Search</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
            Search across all your shipments and quotes
          </p>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <SearchIcon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: focused ? '#F0A500' : '#9CA3AF', transition: 'color 0.2s' }} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search by tracking number, city, country, status..."
              style={{
                width: '100%', padding: '14px 16px 14px 46px',
                border: focused ? '2px solid #F0A500' : '2px solid transparent',
                borderRadius: 8, fontSize: '0.95rem', outline: 'none',
                boxSizing: 'border-box', background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'border 0.2s',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', background: filter === f.key ? '#F0A500' : 'rgba(255,255,255,0.15)', color: filter === f.key ? '#0B1C3F' : 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 5%' }}>

        {/* Results count */}
        {hasQuery && (
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 500 }}>
            {totalResults === 0 ? `No results for "${query}"` : `${totalResults} result${totalResults > 1 ? 's' : ''} for "${query}"`}
          </p>
        )}

        {!hasQuery && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: 500 }}>
              Start typing to search your shipments and quotes
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              {['FL-TRK', 'delivered', 'China', 'express'].map(hint => (
                <button key={hint} onClick={() => setQuery(hint)} style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}>
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>Loading...</div>
        )}

        {/* Shipments Results */}
        {filteredShipments.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>
              📦 Shipments — {filteredShipments.length}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredShipments.map(s => (
                <Link key={s._id} to={`/track/${s.trackingNumber}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 10, padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 42, height: 42, background: shipmentColors[s.status]?.bg || '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={18} color={shipmentColors[s.status]?.color || '#6B7280'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B1C3F', fontFamily: 'Syne' }}>{s.trackingNumber}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} /> {s.origin?.city || s.origin?.country} → {s.destination?.city || s.destination?.country}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 1, textTransform: 'capitalize' }}>{s.serviceType}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ background: shipmentColors[s.status]?.bg || '#F3F4F6', color: shipmentColors[s.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {s.status?.replace(/_/g, ' ')}
                      </span>
                      <ChevronRight size={16} color="#9CA3AF" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quotes Results */}
        {filteredQuotes.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>
              📋 Quotes — {filteredQuotes.length}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredQuotes.map(q2 => (
                <Link key={q2._id} to="/quotes" style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 10, padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 42, height: 42, background: statusColors[q2.status]?.bg || '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} color={statusColors[q2.status]?.color || '#6B7280'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B1C3F', fontFamily: 'Syne' }}>{q2.quoteNumber}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} /> {q2.origin?.country} → {q2.destination?.country}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 1, textTransform: 'capitalize' }}>{q2.serviceType}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ background: statusColors[q2.status]?.bg || '#F3F4F6', color: statusColors[q2.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                        {q2.status}
                      </span>
                      <ChevronRight size={16} color="#9CA3AF" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {hasQuery && totalResults === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😕</div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F', margin: '0 0 8px' }}>No results found</h3>
            <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>Try searching by tracking number, city, country or status</p>
          </div>
        )}
      </div>
    </div>
  );
}