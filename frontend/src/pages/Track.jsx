import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, MapPin, Package, Calendar, Clock, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusSteps = ['booked', 'picked_up', 'in_transit', 'at_port', 'customs', 'out_for_delivery', 'delivered'];

const statusConfig = {
  booked:           { label: 'Booked',            icon: '📋', color: '#6366F1', bg: '#EEF2FF' },
  picked_up:        { label: 'Picked Up',          icon: '📦', color: '#F59E0B', bg: '#FEF3C7' },
  in_transit:       { label: 'In Transit',         icon: '🚢', color: '#3B82F6', bg: '#DBEAFE' },
  at_port:          { label: 'At Port',            icon: '⚓', color: '#8B5CF6', bg: '#EDE9FE' },
  customs:          { label: 'Customs',            icon: '📋', color: '#EF4444', bg: '#FEE2E2' },
  out_for_delivery: { label: 'Out for Delivery',   icon: '🚛', color: '#F97316', bg: '#FEF0E6' },
  delivered:        { label: 'Delivered',          icon: '✅', color: '#10B981', bg: '#D1FAE5' },
  exception:        { label: 'Exception',          icon: '⚠️', color: '#EF4444', bg: '#FEE2E2' },
};

const serviceIcons = {
  express: '✈️', freight: '🚢', rail: '🚂', road: '🚛',
  customs: '📋', warehousing: '🏭', port: '⚓',
};

export default function Track() {
  const { trackingNumber: urlTrack } = useParams();
  const [trackNum, setTrackNum] = useState(urlTrack || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!trackNum.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const { data } = await api.get(`/shipments/track/${trackNum.trim()}`);
      setShipment(data.data);
    } catch (err) {
      setShipment(null);
      if (err.response?.status !== 404) toast.error('Error looking up shipment');
    } finally { setLoading(false); }
  };

  React.useEffect(() => { if (urlTrack) handleSearch(); }, []);

  const currentStepIdx = shipment ? statusSteps.indexOf(shipment.status) : -1;
  const cfg = shipment ? (statusConfig[shipment.status] || statusConfig.booked) : null;
  const progress = shipment ? Math.round(((currentStepIdx + 1) / statusSteps.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#F4F6FA' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: '4rem 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.04) 0px, rgba(240,165,0,0.04) 1px, transparent 1px, transparent 60px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: '1rem' }}>
            <MapPin size={14} color="#F0A500" />
            <span style={{ color: '#F0A500', fontSize: '0.78rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Real-Time Tracking</span>
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', margin: '0 0 0.75rem' }}>
            Track Your <span style={{ color: '#F0A500' }}>Shipment</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '2rem', fontSize: '0.95rem' }}>Enter your FlashLink tracking number for live updates</p>
          <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 560, margin: '0 auto', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', borderRadius: 8 }}>
            <input
              value={trackNum}
              onChange={e => setTrackNum(e.target.value)}
              placeholder="e.g. FL-TRK-1773133025695"
              style={{ flex: 1, padding: '16px 20px', border: 'none', borderRadius: '8px 0 0 8px', fontSize: '0.95rem', outline: 'none' }}
            />
            <button type="submit" style={{ background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '16px 28px', borderRadius: '0 8px 8px 0', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              <Search size={18} /> Track
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '2.5rem auto', padding: '0 5%' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: '#6B7280', fontWeight: 600 }}>Searching for your shipment...</p>
          </div>
        )}

        {/* Not Found */}
        {!loading && searched && !shipment && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F', margin: '0 0 8px' }}>Shipment Not Found</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>No shipment found for <strong>{trackNum}</strong>. Please check and try again.</p>
          </div>
        )}

        {/* Results */}
        {!loading && shipment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Status Banner */}
            <div style={{ background: `linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)`, borderRadius: 12, padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: cfg.color, borderRadius: '50%', opacity: 0.08, transform: 'translate(50px, -80px)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Tracking Number</p>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#F0A500', margin: '0 0 8px' }}>{shipment.trackingNumber}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    <span>{serviceIcons[shipment.serviceType] || '📦'}</span>
                    <span style={{ textTransform: 'capitalize' }}>{shipment.serviceType}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <MapPin size={13} />
                    <span>{shipment.origin?.city || shipment.origin?.country} → {shipment.destination?.city || shipment.destination?.country}</span>
                  </div>
                </div>
                <div style={{ background: cfg.bg, color: cfg.color, padding: '10px 20px', borderRadius: 20, fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>{cfg.icon}</span> {cfg.label}
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>JOURNEY PROGRESS</span>
                  <span style={{ fontSize: '0.72rem', color: '#F0A500', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #F0A500, #F59E0B)', borderRadius: 3, width: `${progress}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>

            {/* Timeline Steps */}
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.5rem' }}>📍 Shipment Journey</h3>
              <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 600 }}>
                  {statusSteps.map((s, i) => {
                    const done = i <= currentStepIdx;
                    const current = i === currentStepIdx;
                    const sc = statusConfig[s];
                    return (
                      <React.Fragment key={s}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: done ? (current ? cfg.color : '#0B1C3F') : '#F3F4F6', color: done ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: current ? '1.2rem' : '1rem', fontWeight: 700, transition: 'all 0.3s', boxShadow: current ? `0 0 0 4px ${cfg.color}30` : 'none', border: current ? `2px solid ${cfg.color}` : 'none' }}>
                            {i < currentStepIdx ? <CheckCircle size={20} /> : sc.icon}
                          </div>
                          <span style={{ fontSize: '0.65rem', color: done ? '#0B1C3F' : '#9CA3AF', fontWeight: current ? 800 : done ? 600 : 400, marginTop: 8, textAlign: 'center', lineHeight: 1.3, maxWidth: 60 }}>{sc.label}</span>
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div style={{ flex: 1, height: 3, margin: '20px 4px 0', borderRadius: 2, background: i < currentStepIdx ? '#0B1C3F' : '#E5E7EB', transition: 'background 0.3s', minWidth: 20 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Route + Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

              {/* Route Card */}
              <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>🗺️ Route Details</h3>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '1rem' }}>
                  <div style={{ flex: 1, background: '#F4F6FA', borderRadius: 8, padding: '1rem' }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', margin: '0 0 6px' }}>From</p>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F', margin: '0 0 2px', fontSize: '0.95rem' }}>{shipment.origin?.city || '—'}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{shipment.origin?.country}</p>
                    {shipment.origin?.port && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '4px 0 0' }}>Port: {shipment.origin.port}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}>→</div>
                  <div style={{ flex: 1, background: '#F4F6FA', borderRadius: 8, padding: '1rem' }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', margin: '0 0 6px' }}>To</p>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F', margin: '0 0 2px', fontSize: '0.95rem' }}>{shipment.destination?.city || '—'}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{shipment.destination?.country}</p>
                    {shipment.destination?.port && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '4px 0 0' }}>Port: {shipment.destination.port}</p>}
                  </div>
                </div>
                {(shipment.estimatedDelivery || shipment.actualDelivery) && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: shipment.actualDelivery ? '#D1FAE5' : '#FEF3C7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color={shipment.actualDelivery ? '#065F46' : '#92400E'} />
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: shipment.actualDelivery ? '#065F46' : '#92400E', margin: 0 }}>{shipment.actualDelivery ? 'DELIVERED ON' : 'ESTIMATED DELIVERY'}</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: shipment.actualDelivery ? '#065F46' : '#92400E', margin: 0 }}>{new Date(shipment.actualDelivery || shipment.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cargo Details */}
              <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>📦 Cargo Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Service Type', value: shipment.serviceType, capitalize: true },
                    { label: 'Cargo Type', value: shipment.cargo?.type, capitalize: true },
                    { label: 'Description', value: shipment.cargo?.description },
                    { label: 'Weight', value: shipment.cargo?.weight ? `${shipment.cargo.weight} ${shipment.cargo.weightUnit || 'tons'}` : null },
                    { label: 'Volume', value: shipment.cargo?.volume ? `${shipment.cargo.volume} m³` : null },
                    { label: 'Containers', value: shipment.cargo?.containers ? `${shipment.cargo.containers} × ${shipment.cargo.containerType || ''}` : null },
                  ].filter(i => i.value).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #F9FAFB' }}>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '0.85rem', color: '#0B1C3F', fontWeight: 600, textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event History */}
            {shipment.events?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.5rem' }}>🕐 Tracking History</h3>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 17, top: 0, bottom: 0, width: 2, background: '#F3F4F6' }} />
                  {[...shipment.events].reverse().map((ev, i) => {
                    const evCfg = statusConfig[ev.status] || statusConfig.booked;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '1.25rem', position: 'relative' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === 0 ? evCfg.bg : '#F3F4F6', color: i === 0 ? evCfg.color : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, zIndex: 1, border: i === 0 ? `2px solid ${evCfg.color}` : '2px solid #E5E7EB' }}>
                          {evCfg.icon}
                        </div>
                        <div style={{ flex: 1, paddingTop: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: i === 0 ? '#0B1C3F' : '#6B7280', margin: 0, textTransform: 'capitalize' }}>{ev.status?.replace(/_/g, ' ')}</p>
                            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{new Date(ev.timestamp).toLocaleString()}</span>
                          </div>
                          {ev.description && <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '3px 0 0' }}>{ev.description}</p>}
                          {(ev.location?.city || ev.location?.country) && (
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={11} /> {[ev.location.city, ev.location.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}