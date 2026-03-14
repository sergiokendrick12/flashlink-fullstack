import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, FileText, TrendingUp, Clock, ChevronRight, ArrowRight, MapPin, Download, Plus, Search } from 'lucide-react';
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
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  reviewing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Reviewing' },
  quoted: { bg: '#D1FAE5', color: '#065F46', label: 'Quoted' },
  accepted: { bg: '#D1FAE5', color: '#065F46', label: 'Accepted' },
  rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
};

const shipmentSteps = ['booked', 'picked_up', 'in_transit', 'at_port', 'customs', 'out_for_delivery', 'delivered'];

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

function ShipmentProgress({ status }) {
  const currentIndex = shipmentSteps.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 8, marginBottom: 4 }}>
      {shipmentSteps.map((step, i) => {
        const done = i <= currentIndex;
        const current = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div style={{
              width: current ? 10 : 8, height: current ? 10 : 8,
              borderRadius: '50%',
              background: done ? '#0B1C3F' : '#E5E7EB',
              border: current ? '2px solid #F0A500' : 'none',
              flexShrink: 0,
              transition: 'all 0.2s'
            }} />
            {i < shipmentSteps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentIndex ? '#0B1C3F' : '#E5E7EB' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/quotes/my?t=' + Date.now()).catch(() => ({ data: { data: [] } })),
      api.get('/shipments/my?t=' + Date.now()).catch(() => ({ data: { data: [] } })),
    ]).then(([qRes, sRes]) => {
      setQuotes(qRes.data.data || qRes.data || []);
      setShipments(sRes.data.data || sRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const activeShipments = shipments.filter(s => s.status !== 'delivered' && s.status !== 'exception');
  const deliveredShipments = shipments.filter(s => s.status === 'delivered');
  const pendingQuotes = quotes.filter(q => q.status === 'pending');

  const cards = [
    { icon: <FileText size={20} />, label: 'Total Quotes', value: quotes.length, color: '#0B1C3F', bg: '#EEF2FF', link: '/quotes' },
    { icon: <Package size={20} />, label: 'Active Shipments', value: activeShipments.length, color: '#92400E', bg: '#FEF3C7', link: '/shipments' },
    { icon: <TrendingUp size={20} />, label: 'Delivered', value: deliveredShipments.length, color: '#065F46', bg: '#D1FAE5', link: '/shipments' },
    { icon: <Clock size={20} />, label: 'Pending Quotes', value: pendingQuotes.length, color: '#1E40AF', bg: '#DBEAFE', link: '/quotes' },
  ];

  const quickActions = [
    { icon: <Plus size={18} />, label: 'Request Quote', to: '/get-quote', primary: true },
    { icon: <Search size={18} />, label: 'Track Shipment', to: '/track', primary: false },
    { icon: <Package size={18} />, label: 'My Shipments', to: '/shipments', primary: false },
    { icon: <FileText size={18} />, label: 'My Quotes', to: '/quotes', primary: false },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: '2.5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', margin: '0 0 4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{getGreeting()}</p>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'white', margin: '0 0 6px' }}>
                {user?.firstName} {user?.lastName} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', margin: 0 }}>
                {activeShipments.length > 0
                  ? `You have ${activeShipments.length} active shipment${activeShipments.length > 1 ? 's' : ''} in progress.`
                  : 'Welcome to your FlashLink dashboard.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {quickActions.map((a, i) => (
                <Link key={i} to={a.to} style={{
                  background: a.primary ? '#F0A500' : 'rgba(255,255,255,0.1)',
                  color: a.primary ? '#0B1C3F' : 'white',
                  padding: '9px 18px', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  border: a.primary ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  textDecoration: 'none'
                }}>
                  {a.icon} {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 5%' }}>

        {/* Welcome Banner for new users */}
        {!loading && shipments.length === 0 && quotes.length === 0 && (
          <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', borderRadius: 12, padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'white', margin: '0 0 8px' }}>🚀 Welcome to FlashLink!</h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', margin: 0, maxWidth: 480 }}>
                You're all set! Start by requesting a freight quote and we'll handle the rest — from pickup to delivery.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '10px 22px', borderRadius: 6, fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none' }}>Request a Quote →</Link>
              <Link to="/track" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 22px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>Track Shipment</Link>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {cards.map((c, i) => (
            <Link key={i} to={c.link} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 10, padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: 46, height: 46, background: c.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#0B1C3F', lineHeight: 1 }}>{loading ? '–' : c.value}</div>
                  <div style={{ fontSize: '0.76rem', color: '#9CA3AF', marginTop: 3, fontWeight: 600 }}>{c.label}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

          {/* Active Shipments */}
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: 0 }}>Active Shipments</h2>
              <Link to="/shipments" style={{ color: '#F0A500', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>View all <ChevronRight size={13} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
            ) : shipments.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>No shipments yet</p>
                <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '8px 18px', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>Request a Quote</Link>
              </div>
            ) : shipments.slice(0, 4).map(s => (
              <div key={s._id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{s.trackingNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={11} /> {s.origin?.city || s.origin?.country} → {s.destination?.city || s.destination?.country}
                    </div>
                    {s.estimatedDelivery && s.status !== 'delivered' && (
                      <div style={{ fontSize: '0.72rem', color: '#F0A500', fontWeight: 600, marginTop: 2 }}>
                        🗓 ETA: {new Date(s.estimatedDelivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ background: shipmentColors[s.status]?.bg || '#F3F4F6', color: shipmentColors[s.status]?.color || '#6B7280', padding: '2px 9px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>
                      {s.status?.replace(/_/g, ' ')}
                    </span>
                    {s.status === 'delivered' && (
                      <button onClick={() => downloadInvoice(s._id, s.trackingNumber)} style={{ background: 'none', border: 'none', color: '#F0A500', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}>
                        <Download size={11} /> Invoice
                      </button>
                    )}
                  </div>
                </div>
                <ShipmentProgress status={s.status} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>Booked</span>
                  <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>Delivered</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Quotes */}
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: 0 }}>Recent Quotes</h2>
              <Link to="/quotes" style={{ color: '#F0A500', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>View all <ChevronRight size={13} /></Link>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
            ) : quotes.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>No quote requests yet</p>
                <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '8px 18px', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>Request a Quote</Link>
              </div>
            ) : quotes.slice(0, 5).map(q => (
              <div key={q._id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{q.quoteNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>
                    {q.serviceType} · {q.origin?.country} → {q.destination?.country}
                  </div>
                  {q.quotedPrice && (
                    <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 700, marginTop: 2 }}>
                      💰 {q.currency || 'USD'} {q.quotedPrice.toLocaleString()}
                    </div>
                  )}
                  <button onClick={() => downloadPDF(q._id, q.quoteNumber)} style={{ fontSize: '0.7rem', color: '#F0A500', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Download size={11} /> Download PDF
                  </button>
                </div>
                <span style={{ background: statusColors[q.status]?.bg || '#F3F4F6', color: statusColors[q.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700 }}>
                  {statusColors[q.status]?.label || q.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Delivered */}
        {deliveredShipments.length > 0 && (
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: 0 }}>✅ Recently Delivered</h2>
              <Link to="/shipments" style={{ color: '#F0A500', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>View all <ChevronRight size={13} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 0 }}>
              {deliveredShipments.slice(0, 3).map(s => (
                <div key={s._id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{s.trackingNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>{s.origin?.country} → {s.destination?.country}</div>
                    {s.actualDelivery && <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: 2, fontWeight: 600 }}>Delivered {new Date(s.actualDelivery).toLocaleDateString()}</div>}
                  </div>
                  <button onClick={() => downloadInvoice(s._id, s.trackingNumber)} style={{ background: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Download size={12} /> Invoice
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}