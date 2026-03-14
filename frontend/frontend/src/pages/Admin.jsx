import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [creating, setCreating] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [pricingModal, setPricingModal] = useState(null);
  const [priceForm, setPriceForm] = useState({ quotedPrice: '', currency: 'USD', validUntil: '', agentNotes: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatSessions, setChatSessions] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatSocket, setChatSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard');
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get('/quotes?t=' + Date.now()),
      api.get('/admin/users?t=' + Date.now()),
      api.get('/shipments?t=' + Date.now()),
      api.get('/contact?t=' + Date.now()),
      api.get('/shipments/stats?t=' + Date.now()),
    ]).then(([qRes, uRes, sRes, cRes, stRes]) => {
      setQuotes(qRes.data.data || []);
      setUsers(uRes.data.data?.users || []);
      setShipments(sRes.data.data || []);
      setContacts(cRes.data.data || []);
      setStats(stRes.data.data || {});
    }).finally(() => setLoading(false));
  }, []);

  // Socket for admin chat
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      socket.emit('join', { userId: user._id, role: 'admin', name: `${user.firstName} ${user.lastName}` });
    });
    socket.on('all-chats', (sessions) => {
      setChatSessions({ ...sessions });
    });
    socket.on('new-message', (msg) => {
      setChatSessions(prev => {
        const uid = msg.userId;
        const existing = prev[uid] || [];
        const exists = existing.find(m => m.id === msg.id);
        if (exists) return prev;
        return { ...prev, [uid]: [...existing, msg] };
      });
    });
    setChatSocket(socket);
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [activeChat, chatSessions]);

  const sendAdminMessage = () => {
    if (!chatInput.trim() || !chatSocket || !activeChat) return;
    chatSocket.emit('send-message', {
      userId: activeChat,
      userName: 'FlashLink Support',
      message: chatInput.trim(),
      isAdmin: true,
    });
    setChatInput('');
  };

  const updateQuote = async (id, status) => {
    await api.put('/quotes/' + id, { status });
    setQuotes(q => q.map(x => x._id === id ? { ...x, status } : x));
  };

  const toggleUserRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await api.patch('/admin/users/' + id, { role: newRole });
    setUsers(u => u.map(x => x._id === id ? { ...x, role: newRole } : x));
    if (selectedUser?._id === id) setSelectedUser(s => ({ ...s, role: newRole }));
  };

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    await api.patch('/admin/users/' + id, { isActive: newStatus });
    setUsers(u => u.map(x => x._id === id ? { ...x, isActive: newStatus } : x));
    if (selectedUser?._id === id) setSelectedUser(s => ({ ...s, isActive: newStatus }));
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    await api.delete('/admin/users/' + id);
    setUsers(u => u.filter(x => x._id !== id));
    setSelectedUser(null);
  };

  const submitPricing = async () => {
    await api.put('/quotes/' + pricingModal._id, {
      status: 'quoted',
      quotedPrice: parseFloat(priceForm.quotedPrice),
      currency: priceForm.currency,
      validUntil: priceForm.validUntil || undefined,
      agentNotes: priceForm.agentNotes || undefined,
    });
    setQuotes(q => q.map(x => x._id === pricingModal._id ? { ...x, status: 'quoted', quotedPrice: parseFloat(priceForm.quotedPrice), currency: priceForm.currency } : x));
    setPricingModal(null);
    setPriceForm({ quotedPrice: '', currency: 'USD', validUntil: '', agentNotes: '' });
  };

  const updateShipmentStatus = async (id, status) => {
    await api.put('/shipments/' + id + '/status', { status, description: 'Status updated by admin' });
    setShipments(s => s.map(x => x._id === id ? { ...x, status } : x));
  };

  const createShipment = async (quote) => {
    setCreating(quote._id);
    try {
      const { data } = await api.post('/shipments', {
        clientId: quote.user,
        origin: quote.origin,
        destination: quote.destination,
        serviceType: quote.serviceType,
        cargo: quote.cargo,
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
      await updateQuote(quote._id, 'accepted');
      alert('Shipment created! Tracking: ' + data.data.trackingNumber);
    } catch (err) {
      alert('Failed to create shipment');
    } finally {
      setCreating(null);
    }
  };

  const downloadQuotePDF = async (quoteId, quoteNumber) => {
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

  const statusColors = {
    pending: { bg: '#FEF3C7', color: '#92400E' },
    reviewing: { bg: '#DBEAFE', color: '#1E40AF' },
    quoted: { bg: '#D1FAE5', color: '#065F46' },
    accepted: { bg: '#D1FAE5', color: '#065F46' },
    rejected: { bg: '#FEE2E2', color: '#991B1B' },
  };

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

  const contactColors = {
    new: { bg: '#DBEAFE', color: '#1E40AF' },
    read: { bg: '#F3F4F6', color: '#6B7280' },
    replied: { bg: '#D1FAE5', color: '#065F46' },
    closed: { bg: '#FEE2E2', color: '#991B1B' },
  };

  const shipmentNextStatus = {
    booked: 'picked_up', picked_up: 'in_transit', in_transit: 'at_port',
    at_port: 'customs', customs: 'out_for_delivery', out_for_delivery: 'delivered',
  };

  const shipmentNextLabel = {
    booked: '📦 Mark Picked Up', picked_up: '🚢 Mark In Transit',
    in_transit: '⚓ Mark At Port', at_port: '📋 Mark Customs',
    customs: '🚛 Mark Out for Delivery', out_for_delivery: '✅ Mark Delivered',
  };

  const chatUserIds = Object.keys(chatSessions);
  const unreadChats = chatUserIds.filter(uid => {
    const msgs = chatSessions[uid] || [];
    return msgs.length > 0 && msgs[msgs.length - 1]?.isAdmin === false;
  }).length;

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'quotes', label: 'Quotes', count: quotes.length },
    { key: 'shipments', label: 'Shipments', count: shipments.length },
    { key: 'contacts', label: 'Contacts', count: contacts.filter(c => c.status === 'new').length },
    { key: 'users', label: 'Users', count: users.length },
    { key: 'chat', label: '💬 Live Chat', count: unreadChats },
  ];

  const overviewCards = stats ? [
    { label: 'Total Shipments', value: stats.total ?? 0, icon: '🚢', color: '#0B1C3F', bg: '#EEF2FF' },
    { label: 'In Transit', value: stats.inTransit ?? 0, icon: '✈️', color: '#92400E', bg: '#FEF3C7' },
    { label: 'Delivered', value: stats.delivered ?? 0, icon: '✅', color: '#065F46', bg: '#D1FAE5' },
    { label: 'Exceptions', value: stats.exceptions ?? 0, icon: '⚠️', color: '#991B1B', bg: '#FEE2E2' },
    { label: 'Total Quotes', value: quotes.length, icon: '📋', color: '#1E40AF', bg: '#DBEAFE' },
    { label: 'Pending Quotes', value: quotes.filter(q => q.status === 'pending').length, icon: '⏳', color: '#92400E', bg: '#FEF3C7' },
    { label: 'Total Users', value: users.length, icon: '👥', color: '#5B21B6', bg: '#EDE9FE' },
    { label: 'New Messages', value: contacts.filter(c => c.status === 'new').length, icon: '✉️', color: '#991B1B', bg: '#FEE2E2' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>
      <div style={{ background: '#0B1C3F', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>Admin Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 6 }}>Manage quotes, shipments, contacts and users</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 22px', borderRadius: 6, border: 'none', background: tab === t.key ? '#F0A500' : 'white', color: tab === t.key ? '#0B1C3F' : '#6B7280', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative' }}>
              {t.label}{t.count !== undefined && t.count > 0 ? ` (${t.count})` : ''}
              {(t.key === 'contacts' && contacts.filter(c => c.status === 'new').length > 0) && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {contacts.filter(c => c.status === 'new').length}
                </span>
              )}
              {(t.key === 'chat' && unreadChats > 0) && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadChats}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading...</div> : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {overviewCards.map((card, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 52, height: 52, background: card.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{card.icon}</div>
                      <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color, fontFamily: 'Syne', lineHeight: 1 }}>{card.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 4, fontWeight: 600 }}>{card.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F' }}>Recent Quotes</span>
                      <button onClick={() => setTab('quotes')} style={{ background: 'none', border: 'none', color: '#F0A500', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>View all →</button>
                    </div>
                    {quotes.slice(0, 4).map(q => (
                      <div key={q._id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B1C3F' }}>{q.quoteNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{q.origin?.country} → {q.destination?.country}</div>
                        </div>
                        <span style={{ background: statusColors[q.status]?.bg, color: statusColors[q.status]?.color, padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>{q.status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F' }}>Recent Shipments</span>
                      <button onClick={() => setTab('shipments')} style={{ background: 'none', border: 'none', color: '#F0A500', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>View all →</button>
                    </div>
                    {shipments.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>No shipments yet</div>
                    ) : shipments.slice(0, 4).map(s => (
                      <div key={s._id} style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B1C3F' }}>{s.trackingNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{s.origin?.country} → {s.destination?.country}</div>
                        </div>
                        <span style={{ background: shipmentColors[s.status]?.bg, color: shipmentColors[s.status]?.color, padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>{s.status?.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto', display: tab === 'overview' ? 'none' : 'block' }}>

              {/* QUOTES TAB */}
              {tab === 'quotes' && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Quote #', 'Service', 'Route', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(q => (
                      <tr key={q._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{q.quoteNumber}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280', textTransform: 'capitalize' }}>{q.serviceType}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{q.origin?.country} → {q.destination?.country}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>
                          {q.quotedPrice ? `${q.currency || 'USD'} ${q.quotedPrice.toLocaleString()}` : <span style={{ color: '#9CA3AF', fontWeight: 400 }}>—</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: statusColors[q.status]?.bg || '#F3F4F6', color: statusColors[q.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{q.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {q.status === 'pending' && (<>
                              <button onClick={() => updateQuote(q._id, 'reviewing')} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Review</button>
                              <button onClick={() => updateQuote(q._id, 'rejected')} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                            </>)}
                            {q.status === 'reviewing' && (<>
                              <button onClick={() => { setPricingModal(q); setPriceForm({ quotedPrice: '', currency: 'USD', validUntil: '', agentNotes: '' }); }} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#D1FAE5', color: '#065F46', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>💰 Add Price</button>
                              <button onClick={() => updateQuote(q._id, 'rejected')} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                            </>)}
                            {q.status === 'quoted' && (
                              <button onClick={() => createShipment(q)} disabled={creating === q._id} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#F0A500', color: '#0B1C3F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                {creating === q._id ? 'Creating...' : '🚢 Create Shipment'}
                              </button>
                            )}
                            <button onClick={() => downloadQuotePDF(q._id, q.quoteNumber)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#F4F6FA', color: '#0B1C3F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>⬇ PDF</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* SHIPMENTS TAB */}
              {tab === 'shipments' && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Tracking #', 'Route', 'Service', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No shipments yet</td></tr>
                    ) : shipments.map(s => (
                      <tr key={s._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{s.trackingNumber}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{s.origin?.country} → {s.destination?.country}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280', textTransform: 'capitalize' }}>{s.serviceType}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: shipmentColors[s.status]?.bg || '#F3F4F6', color: shipmentColors[s.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{s.status?.replace(/_/g, ' ')}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {shipmentNextStatus[s.status] && (
                            <button onClick={() => updateShipmentStatus(s._id, shipmentNextStatus[s.status])} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#F0A500', color: '#0B1C3F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                              {shipmentNextLabel[s.status]}
                            </button>
                          )}
                          {s.status === 'delivered' && <span style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700 }}>✅ Delivered</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* CONTACTS TAB */}
              {tab === 'contacts' && (
                <div>
                  {selectedContact ? (
                    <div style={{ padding: '2rem' }}>
                      <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', color: '#F0A500', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.88rem' }}>← Back to contacts</button>
                      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#0B1C3F', margin: 0 }}>{selectedContact.subject}</h2>
                            <p style={{ color: '#6B7280', fontSize: '0.82rem', marginTop: 4 }}>{new Date(selectedContact.createdAt).toLocaleString()}</p>
                          </div>
                          <span style={{ background: contactColors[selectedContact.status]?.bg, color: contactColors[selectedContact.status]?.color, padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{selectedContact.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div><span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 700 }}>NAME</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F' }}>{selectedContact.name}</p></div>
                          <div><span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 700 }}>EMAIL</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F' }}>{selectedContact.email}</p></div>
                          <div><span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 700 }}>PHONE</span><p style={{ margin: '4px 0 0', color: '#6B7280' }}>{selectedContact.phone || '—'}</p></div>
                          <div><span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 700 }}>COMPANY</span><p style={{ margin: '4px 0 0', color: '#6B7280' }}>{selectedContact.company || '—'}</p></div>
                        </div>
                        <div><span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 700 }}>MESSAGE</span><p style={{ margin: '8px 0 0', color: '#374151', lineHeight: 1.7, background: 'white', padding: '1rem', borderRadius: 6, border: '1px solid #E5E7EB' }}>{selectedContact.message}</p></div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`} style={{ background: '#0B1C3F', color: 'white', padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>✉️ Reply via Email</a>
                        <button onClick={() => { api.patch(`/contact/${selectedContact._id}`, { status: 'replied' }); setContacts(c => c.map(x => x._id === selectedContact._id ? { ...x, status: 'replied' } : x)); setSelectedContact({ ...selectedContact, status: 'replied' }); }} style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>✅ Mark Replied</button>
                        <button onClick={() => { api.patch(`/contact/${selectedContact._id}`, { status: 'closed' }); setContacts(c => c.map(x => x._id === selectedContact._id ? { ...x, status: 'closed' } : x)); setSelectedContact({ ...selectedContact, status: 'closed' }); }} style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>🔒 Close</button>
                      </div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Name', 'Email', 'Subject', 'Type', 'Date', 'Status'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No contact messages yet</td></tr>
                        ) : contacts.map(c => (
                          <tr key={c._id} onClick={() => setSelectedContact(c)} style={{ borderTop: '1px solid #F3F4F6', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#0B1C3F' }}>{c.name}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{c.email}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#0B1C3F' }}>{c.subject}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#6B7280', textTransform: 'capitalize' }}>{c.type}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#9CA3AF' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: contactColors[c.status]?.bg || '#F3F4F6', color: contactColors[c.status]?.color || '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{c.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* USERS TAB */}
              {tab === 'users' && (
                <div>
                  {selectedUser ? (
                    <div style={{ padding: '2rem' }}>
                      <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#F0A500', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.88rem' }}>← Back to users</button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ width: 64, height: 64, background: '#0B1C3F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'white', flexShrink: 0 }}>
                          {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                        </div>
                        <div>
                          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: '#0B1C3F', margin: '0 0 4px' }}>{selectedUser.firstName} {selectedUser.lastName}</h2>
                          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0 0 6px' }}>{selectedUser.email}</p>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ background: selectedUser.role === 'admin' ? '#D1FAE5' : '#EEF2FF', color: selectedUser.role === 'admin' ? '#065F46' : '#3730A3', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{selectedUser.role}</span>
                            <span style={{ background: selectedUser.isActive ? '#D1FAE5' : '#FEE2E2', color: selectedUser.isActive ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{selectedUser.isActive ? 'Active' : 'Banned'}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                        <div><span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Joined</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F', fontSize: '0.88rem' }}>{new Date(selectedUser.createdAt).toLocaleDateString()}</p></div>
                        <div><span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Company</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F', fontSize: '0.88rem' }}>{selectedUser.company || '—'}</p></div>
                        <div><span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Phone</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F', fontSize: '0.88rem' }}>{selectedUser.phone || '—'}</p></div>
                        <div><span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Quotes</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F', fontSize: '0.88rem' }}>{quotes.filter(q => q.user?._id === selectedUser._id || q.user === selectedUser._id).length}</p></div>
                        <div><span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Shipments</span><p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0B1C3F', fontSize: '0.88rem' }}>{shipments.filter(s => s.client?._id === selectedUser._id || s.client === selectedUser._id).length}</p></div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button onClick={() => toggleUserRole(selectedUser._id, selectedUser.role)} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: selectedUser.role === 'admin' ? '#FEF3C7' : '#D1FAE5', color: selectedUser.role === 'admin' ? '#92400E' : '#065F46', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                          {selectedUser.role === 'admin' ? '👤 Demote to User' : '⭐ Promote to Admin'}
                        </button>
                        <button onClick={() => toggleUserStatus(selectedUser._id, selectedUser.isActive)} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: selectedUser.isActive ? '#FEE2E2' : '#D1FAE5', color: selectedUser.isActive ? '#991B1B' : '#065F46', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                          {selectedUser.isActive ? '🚫 Ban User' : '✅ Unban User'}
                        </button>
                        <button onClick={() => deleteUser(selectedUser._id)} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                          🗑️ Delete User
                        </button>
                      </div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 34, height: 34, background: '#0B1C3F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: '0.78rem', color: 'white', flexShrink: 0 }}>
                                  {u.firstName?.[0]}{u.lastName?.[0]}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0B1C3F' }}>{u.firstName} {u.lastName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{u.email}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: u.role === 'admin' ? '#D1FAE5' : '#EEF2FF', color: u.role === 'admin' ? '#065F46' : '#3730A3', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{u.role}</span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#9CA3AF' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ background: u.isActive ? '#D1FAE5' : '#FEE2E2', color: u.isActive ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{u.isActive ? 'Active' : 'Banned'}</span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setSelectedUser(u)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#EEF2FF', color: '#3730A3', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>👁️ View</button>
                                <button onClick={() => toggleUserRole(u._id, u.role)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: u.role === 'admin' ? '#FEF3C7' : '#D1FAE5', color: u.role === 'admin' ? '#92400E' : '#065F46', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                  {u.role === 'admin' ? 'Demote' : 'Promote'}
                                </button>
                                <button onClick={() => toggleUserStatus(u._id, u.isActive)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: u.isActive ? '#FEE2E2' : '#D1FAE5', color: u.isActive ? '#991B1B' : '#065F46', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                  {u.isActive ? 'Ban' : 'Unban'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* LIVE CHAT TAB */}
              {tab === 'chat' && (
                <div style={{ display: 'flex', height: 520 }}>
                  {/* Sidebar - chat list */}
                  <div style={{ width: 260, borderRight: '1px solid #F3F4F6', overflowY: 'auto', flexShrink: 0 }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
                      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F', margin: 0 }}>💬 Active Conversations</h3>
                    </div>
                    {chatUserIds.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.82rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💤</div>
                        No active chats yet
                      </div>
                    ) : chatUserIds.map(uid => {
                      const msgs = chatSessions[uid] || [];
                      const last = msgs[msgs.length - 1];
                      const uData = users.find(u => u._id === uid);
                      const hasUnread = last && !last.isAdmin;
                      return (
                        <div key={uid} onClick={() => setActiveChat(uid)}
                          style={{ padding: '0.875rem 1.25rem', cursor: 'pointer', background: activeChat === uid ? '#EEF2FF' : 'white', borderBottom: '1px solid #F9FAFB', borderLeft: activeChat === uid ? '3px solid #0B1C3F' : '3px solid transparent' }}
                          onMouseEnter={e => { if (activeChat !== uid) e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={e => { if (activeChat !== uid) e.currentTarget.style.background = 'white'; }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0B1C3F' }}>{uData ? `${uData.firstName} ${uData.lastName}` : 'User'}</span>
                            {hasUnread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {last ? (last.isAdmin ? `You: ${last.message}` : last.message) : 'No messages'}
                          </p>
                          <p style={{ fontSize: '0.68rem', color: '#D1D5DB', margin: '3px 0 0' }}>
                            {last ? new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!activeChat ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                        <p style={{ fontWeight: 600 }}>Select a conversation to reply</p>
                      </div>
                    ) : (
                      <>
                        {/* Chat header */}
                        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 36, height: 36, background: '#0B1C3F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.78rem' }}>
                            {(() => { const u = users.find(x => x._id === activeChat); return u ? `${u.firstName[0]}${u.lastName[0]}` : '?'; })()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F', margin: 0 }}>
                              {(() => { const u = users.find(x => x._id === activeChat); return u ? `${u.firstName} ${u.lastName}` : 'User'; })()}
                            </p>
                            <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: 0 }}>
                              {(() => { const u = users.find(x => x._id === activeChat); return u?.email || ''; })()}
                            </p>
                          </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#F9FAFB' }}>
                          {(chatSessions[activeChat] || []).map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.isAdmin ? 'flex-end' : 'flex-start' }}>
                              <div style={{ maxWidth: '75%' }}>
                                {!msg.isAdmin && <p style={{ fontSize: '0.68rem', color: '#9CA3AF', margin: '0 0 3px', fontWeight: 600 }}>{msg.userName}</p>}
                                <div style={{ background: msg.isAdmin ? '#0B1C3F' : 'white', color: msg.isAdmin ? 'white' : '#0B1C3F', padding: '10px 14px', borderRadius: msg.isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px', fontSize: '0.85rem', lineHeight: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                  {msg.message}
                                </div>
                                <p style={{ fontSize: '0.65rem', color: '#9CA3AF', margin: '3px 0 0', textAlign: msg.isAdmin ? 'right' : 'left' }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', background: 'white', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <textarea
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminMessage(); } }}
                            placeholder="Type a reply..."
                            rows={1}
                            style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                          />
                          <button onClick={sendAdminMessage} disabled={!chatInput.trim()} style={{ width: 38, height: 38, background: chatInput.trim() ? '#F0A500' : '#E5E7EB', border: 'none', borderRadius: 8, cursor: chatInput.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            ➤
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

      {/* Pricing Modal */}
      {pricingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: '#0B1C3F', margin: '0 0 4px' }}>💰 Add Pricing</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.82rem', margin: '0 0 1.5rem' }}>{pricingModal.quoteNumber} · {pricingModal.origin?.country} → {pricingModal.destination?.country}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Price *</label>
                <input type="number" placeholder="e.g. 2500" value={priceForm.quotedPrice} onChange={e => setPriceForm(f => ({ ...f, quotedPrice: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.95rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Currency</label>
                <select value={priceForm.currency} onChange={e => setPriceForm(f => ({ ...f, currency: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}>
                  {['USD', 'EUR', 'GBP', 'KES', 'UGX', 'RWF', 'TZS'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Valid Until</label>
              <input type="date" value={priceForm.validUntil} onChange={e => setPriceForm(f => ({ ...f, validUntil: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Notes to Client</label>
              <textarea rows={3} placeholder="e.g. Price includes customs clearance..." value={priceForm.agentNotes} onChange={e => setPriceForm(f => ({ ...f, agentNotes: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={submitPricing} disabled={!priceForm.quotedPrice} style={{ flex: 1, padding: '12px', background: priceForm.quotedPrice ? '#F0A500' : '#E5E7EB', color: priceForm.quotedPrice ? '#0B1C3F' : '#9CA3AF', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: '0.9rem', cursor: priceForm.quotedPrice ? 'pointer' : 'not-allowed' }}>
                Send Quote to Client
              </button>
              <button onClick={() => setPricingModal(null)} style={{ padding: '12px 20px', background: '#F4F6FA', color: '#6B7280', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}