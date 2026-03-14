import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Clock, ChevronRight, Search, Download } from 'lucide-react';
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

const downloadInvoice = async (shipmentId, trackingNumber) => {
  const token = localStorage.getItem('fl_token');
  const res = await fetch(`http://localhost:5000/api/shipments/${shipmentId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FlashLink-Invoice-${trackingNumber}.pdf`;
  a.click();
};

export default function Shipments() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/shipments/my?t=' + Date.now())
      .then(res => setShipments(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = shipments.filter(s => {
    const matchSearch = s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.origin?.city?.toLowerCase().includes(search.toLowerCase()) ||
      s.destination?.city?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'booked', label: 'Booked' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>
      {/* Header */}
      <div style={{ background: '#0B1C3F', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>My Shipments</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 6 }}>Track and manage all your shipments</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 5%' }}>
        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by tracking number or city..."
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

        {/* Shipments List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>Loading shipments...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ color: '#0B1C3F', fontFamily: 'Syne', fontWeight: 700, margin: '0 0 8px' }}>No shipments found</h3>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
              {shipments.length === 0 ? "You don't have any shipments yet." : "No shipments match your search."}
            </p>
            {shipments.length === 0 && (
              <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '10px 22px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem' }}>Request a Quote</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(s => (
              <div key={s._id} style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, background: shipmentColors[s.status]?.bg || '#F3F4F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={22} color={shipmentColors[s.status]?.color || '#6B7280'} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', fontFamily: 'Syne' }}>{s.trackingNumber}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {s.origin?.city || s.origin?.country} → {s.destination?.city || s.destination?.country}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {s.estimatedDelivery ? `Est. delivery: ${new Date(s.estimatedDelivery).toLocaleDateString()}` : 'Delivery date TBD'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: shipmentColors[s.status]?.bg || '#F3F4F6', color: shipmentColors[s.status]?.color || '#6B7280', padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                      {s.status?.replace(/_/g, ' ')}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4, textTransform: 'capitalize' }}>{s.serviceType}</div>
                  </div>
                  {s.status === 'delivered' && (
                    <button onClick={() => downloadInvoice(s._id, s.trackingNumber)} style={{ background: '#F4F6FA', color: '#0B1C3F', padding: '8px 14px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, border: 'none', cursor: 'pointer' }}>
                      <Download size={13} /> Invoice
                    </button>
                  )}
                  <Link to={`/track/${s.trackingNumber}`} style={{ background: '#0B1C3F', color: 'white', padding: '8px 16px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                    Track <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}