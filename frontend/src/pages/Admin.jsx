import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { io } from 'socket.io-client';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [creating, setCreating] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard');
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get('/quotes?t=' + Date.now()),
      api.get('/admin/users?t=' + Date.now()),
      api.get('/shipments?t=' + Date.now()),
      api.get('/contact?t=' + Date.now()),
      api.get('/newsletter?t=' + Date.now()),
    ]).then(([qRes, uRes, sRes, cRes, nRes]) => {
      setQuotes(qRes.data.data || []);
      setUsers(uRes.data.data?.users || []);
      setShipments(sRes.data.data || []);
      setContacts(cRes.data.data || []);
      setSubscribers(nRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Socket.io for admin chat
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    s.emit('admin-join');
    s.on('all-chats', (allChats) => {
      setChats(allChats);
      const unread = allChats.filter(c => c.messages?.some(m => m.sender !== 'admin' && !m.read)).length;
      setUnreadChats(unread);
    });
    s.on('new-message', (msg) => {
      setChats(prev => {
        const existing = prev.find(c => c.userId === msg.userId);
        if (existing) {
          return prev.map(c => c.userId === msg.userId
            ? { ...c, messages: [...(c.messages || []), msg] }
            : c
          );
        }
        return [...prev, { userId: msg.userId, userName: msg.userName, messages: [msg] }];
      });
      if (msg.sender !== 'admin') setUnreadChats(u => u + 1);
    });
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat]);

  const sendAdminMessage = () => {
    if (!chatMessage.trim() || !selectedChat || !socket) return;
    socket.emit('admin-message', {
      userId: selectedChat.userId,
      message: chatMessage.trim(),
      sender: 'admin',
      senderName: 'FlashLink Support',
    });
    setChats(prev => prev.map(c => c.userId === selectedChat.userId
      ? { ...c, messages: [...(c.messages || []), { sender: 'admin', message: chatMessage.trim(), timestamp: new Date() }] }
      : c
    ));
    setSelectedChat(prev => ({ ...prev, messages: [...(prev.messages || []), { sender: 'admin', message: chatMessage.trim(), timestamp: new Date() }] }));
    setChatMessage('');
  };

  const updateQuote = async (id, status) => {
    await api.put('/quotes/' + id, { status });
    setQuotes(q => q.map(x => x._id === id ? { ...x, status } : x));
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

  const downloadInvoice = async (shipmentId, trackingNumber) => {
    const token = localStorage.getItem('fl_token');
    const res = await fetch(`http://localhost:5000/api/shipments/${shipmentId}/invoice`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${trackingNumber}.pdf`;
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

  const stats = [
    { label: 'Total Shipments', value: shipments.length, icon: '🚢', color: '#DBEAFE' },
    { label: 'In Transit', value: shipments.filter(s => ['in_transit','at_port','customs','out_for_delivery'].includes(s.status)).length, icon: '✈️', color: '#FEF3C7' },
    { label: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, icon: '✅', color: '#D1FAE5' },
    { label: 'Total Quotes', value: quotes.length, icon: '📋', color: '#EDE9FE' },
    { label: 'Pending Quotes', value: quotes.filter(q => q.status === 'pending').length, icon: '⏳', color: '#FEF3C7' },
    { label: 'Total Users', value: users.length, icon: '👥', color: '#F3F4F6' },
    { label: 'New Messages', value: contacts.filter(c => c.status === 'new').length, icon: '✉️', color: '#FEE2E2' },
    { label: 'Subscribers', value: subscribers.filter(s => s.isActive).length, icon: '📧', color: '#D1FAE5' },
  ];

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'quotes', label: `Quotes (${quotes.length})` },
    { key: 'shipments', label: `Shipments (${shipments.length})` },
    { key: 'contacts', label: `Contacts (${contacts.filter(c => c.status === 'new').length} new)` },
    { key: 'newsletter', label: `Newsletter (${subscribers.filter(s => s.isActive).length})` },
    { key: 'users', label: `Users (${users.length})` },
    { key: 'chat', label: `💬 Live Chat${unreadChats > 0 ? ` (${unreadChats})` : ''}` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>
      <div style={{ background: '#0B1C3F', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>Admin Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 6 }}>Manage quotes, shipments, contacts, newsletter and users</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 5%' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: tab === t.key ? '#F0A500' : 'white', color: tab === t.key ? '#0B1C3F' : '#6B7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Loading...</div> : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {stats.map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 10, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 40, height: 40, background: s.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Syne', color: '#0B1C3F' }}>{s.value}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1rem' }}>Recent Quotes</h3>
                    {quotes.slice(0, 5).map(q => (
                      <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0B1C3F' }}>{q.quoteNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{q.origin?.country} → {q.destination?.country}</div>
                        </div>
                        <span style={{ background: statusColors[q.status]?.bg, color: statusColors[q.status]?.color, padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>{q.status}</span>
                      </div>
                    ))}
                    <button onClick={() => setTab('quotes')} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#F0A500', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}>View all →</button>
                  </div>
                  <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1rem' }}>Recent Shipments</h3>
                    {shipments.slice(0, 5).map(s => (
                      <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0B1C3F' }}>{s.trackingNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{s.origin?.country} → {s.destination?.country}</div>
                        </div>
                        <span style={{ background: shipmentColors[s.status]?.bg, color: shipmentColors[s.status]?.color, padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>{s.status?.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    <button onClick={() => setTab('shipments')} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#F0A500', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}>View all →</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

              {/* QUOTES TAB */}
              {tab === 'quotes' && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#F9FAFB' }}>
                    {['Quote #', 'Service', 'Route', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {quotes.map(q => (
                      <tr key={q._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F' }}>{q.quoteNumber}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280', textTransform: 'capitalize' }}>{q.serviceType}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{q.origin?.country} → {q.destination?.country}</td>
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
                              <button onClick={() => updateQuote(q._id, 'quoted')} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#D1FAE5', color: '#065F46', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Mark Quoted</button>
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
                  <thead><tr style={{ background: '#F9FAFB' }}>
                    {['Tracking #', 'Route', 'Service', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr></thead>
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
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {shipmentNextStatus[s.status] && (
                              <button onClick={() => updateShipmentStatus(s._id, shipmentNextStatus[s.status])} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#F0A500', color: '#0B1C3F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                {shipmentNextLabel[s.status]}
                              </button>
                            )}
                            {s.status === 'delivered' && (<>
                              <span style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 700 }}>✅ Delivered</span>
                              <button onClick={() => downloadInvoice(s._id, s.trackingNumber)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: '#F4F6FA', color: '#0B1C3F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>⬇ Invoice</button>
                            </>)}
                          </div>
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
                      <thead><tr style={{ background: '#F9FAFB' }}>
                        {['Name', 'Email', 'Subject', 'Type', 'Date', 'Status'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                        ))}
                      </tr></thead>
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

              {/* NEWSLETTER TAB */}
              {tab === 'newsletter' && (
                <div>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F' }}>Newsletter Subscribers</span>
                      <span style={{ marginLeft: 12, background: '#D1FAE5', color: '#065F46', padding: '2px 10px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>{subscribers.filter(s => s.isActive).length} active</span>
                      <span style={{ marginLeft: 8, background: '#FEE2E2', color: '#991B1B', padding: '2px 10px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>{subscribers.filter(s => !s.isActive).length} unsubscribed</span>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#F9FAFB' }}>
                      {['Email', 'Name', 'Status', 'Subscribed On'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {subscribers.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No subscribers yet</td></tr>
                      ) : subscribers.map(s => (
                        <tr key={s._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#0B1C3F' }}>{s.email}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{s.firstName || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: s.isActive ? '#D1FAE5' : '#FEE2E2', color: s.isActive ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                              {s.isActive ? 'Active' : 'Unsubscribed'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#9CA3AF' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* USERS TAB */}
              {tab === 'users' && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#F9FAFB' }}>
                    {['Name', 'Email', 'Role', 'Joined', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#0B1C3F' }}>{u.firstName} {u.lastName}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6B7280' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: u.role === 'admin' ? '#D1FAE5' : '#F3F4F6', color: u.role === 'admin' ? '#065F46' : '#6B7280', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#9CA3AF' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: u.isActive ? '#D1FAE5' : '#FEE2E2', color: u.isActive ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* LIVE CHAT TAB */}
              {tab === 'chat' && (
                <div style={{ display: 'flex', height: 600 }}>
                  {/* Left: conversation list */}
                  <div style={{ width: 280, borderRight: '1px solid #F3F4F6', overflowY: 'auto', flexShrink: 0 }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B1C3F' }}>Conversations</span>
                      <span style={{ marginLeft: 8, background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>{chats.length}</span>
                    </div>
                    {chats.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>No chats yet</div>
                    ) : chats.map((c, i) => (
                      <div key={i} onClick={() => { setSelectedChat(c); setUnreadChats(0); }}
                        style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', background: selectedChat?.userId === c.userId ? '#FEF3C7' : 'white' }}
                        onMouseEnter={e => { if (selectedChat?.userId !== c.userId) e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseLeave={e => { if (selectedChat?.userId !== c.userId) e.currentTarget.style.background = 'white'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0B1C3F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            {(c.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B1C3F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.userName || 'User'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.messages?.slice(-1)[0]?.message || 'No messages'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: chat window */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!selectedChat ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: '2rem' }}>💬</span>
                        <span style={{ fontSize: '0.88rem' }}>Select a conversation to reply</span>
                      </div>
                    ) : (
                      <>
                        {/* Chat header */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0B1C3F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                            {(selectedChat.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B1C3F' }}>{selectedChat.userName || 'User'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#10B981' }}>● Online</div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(selectedChat.messages || []).map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                              <div style={{
                                maxWidth: '70%', padding: '10px 14px', borderRadius: m.sender === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: m.sender === 'admin' ? '#0B1C3F' : '#F3F4F6',
                                color: m.sender === 'admin' ? 'white' : '#374151',
                                fontSize: '0.85rem', lineHeight: 1.5
                              }}>
                                {m.message}
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Reply box */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10 }}>
                          <input
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendAdminMessage()}
                            placeholder="Type a reply..."
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none' }}
                          />
                          <button onClick={sendAdminMessage} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#F0A500', color: '#0B1C3F', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                            Send ➤
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
    </div>
  );
}