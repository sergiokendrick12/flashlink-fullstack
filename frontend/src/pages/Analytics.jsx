import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Package, FileText, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#0B1C3F', '#F0A500', '#10B981', '#EF4444', '#6366F1', '#F59E0B', '#3B82F6', '#EC4899'];

const statusLabels = {
  booked: 'Booked', picked_up: 'Picked Up', in_transit: 'In Transit',
  at_port: 'At Port', customs: 'Customs', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', exception: 'Exception',
};

export default function Analytics() {
  const [shipments, setShipments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/shipments/my').catch(() => ({ data: { data: [] } })),
      api.get('/quotes/my').catch(() => ({ data: { data: [] } })),
    ]).then(([sRes, qRes]) => {
      setShipments(sRes.data.data || []);
      setQuotes(qRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Shipments by status (pie)
  const statusData = Object.entries(
    shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: statusLabels[name] || name, value }));

  // Quotes by status (bar)
  const quoteStatusData = Object.entries(
    quotes.reduce((acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Service type breakdown (bar)
  const serviceData = Object.entries(
    [...shipments, ...quotes].reduce((acc, item) => {
      const s = item.serviceType || 'Unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Shipments over time (line) — group by month
  const monthlyData = (() => {
    const map = {};
    [...shipments].forEach(s => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { key, label, shipments: 0, quotes: 0 };
      map[key].shipments++;
    });
    quotes.forEach(q => {
      const d = new Date(q.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!map[key]) map[key] = { key, label, shipments: 0, quotes: 0 };
      map[key].quotes++;
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  })();

  // Top routes
  const routeMap = {};
  shipments.forEach(s => {
    const route = `${s.origin?.country || '?'} → ${s.destination?.country || '?'}`;
    routeMap[route] = (routeMap[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Quote conversion
  const accepted = quotes.filter(q => q.status === 'accepted').length;
  const rejected = quotes.filter(q => q.status === 'rejected').length;
  const conversionRate = quotes.length > 0 ? Math.round((accepted / quotes.length) * 100) : 0;

  const statCards = [
    { icon: <Package size={20} />, label: 'Total Shipments', value: shipments.length, color: '#0B1C3F', bg: '#EEF2FF' },
    { icon: <FileText size={20} />, label: 'Total Quotes', value: quotes.length, color: '#92400E', bg: '#FEF3C7' },
    { icon: <CheckCircle size={20} />, label: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, color: '#065F46', bg: '#D1FAE5' },
    { icon: <TrendingUp size={20} />, label: 'Quote Conversion', value: `${conversionRate}%`, color: '#1E40AF', bg: '#DBEAFE' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6FA', paddingTop: 70 }}>
      <p style={{ color: '#9CA3AF' }}>Loading analytics...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: '2.5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'white', margin: '0 0 6px' }}>📊 Analytics</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', margin: 0 }}>
            Insights across your shipments and quotes
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 5%' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 46, height: 46, background: c.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#0B1C3F', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '0.76rem', color: '#9CA3AF', marginTop: 3, fontWeight: 600 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Line Chart — Activity Over Time */}
        <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>📈 Activity Over Time</h2>
          {monthlyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '0.82rem' }} />
                <Legend wrapperStyle={{ fontSize: '0.82rem' }} />
                <Line type="monotone" dataKey="shipments" stroke="#0B1C3F" strokeWidth={2.5} dot={{ r: 4 }} name="Shipments" />
                <Line type="monotone" dataKey="quotes" stroke="#F0A500" strokeWidth={2.5} dot={{ r: 4 }} name="Quotes" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Pie Chart — Shipment Status */}
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>🥧 Shipment Status Breakdown</h2>
            {statusData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No shipments yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '0.82rem' }} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart — Quote Status */}
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>📋 Quote Status Breakdown</h2>
            {quoteStatusData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No quotes yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quoteStatusData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '0.82rem' }} />
                  <Bar dataKey="value" name="Quotes" radius={[4, 4, 0, 0]}>
                    {quoteStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart — Service Types */}
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>🚢 Service Type Distribution</h2>
            {serviceData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={serviceData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: '0.82rem' }} />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Routes */}
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', margin: '0 0 1.25rem' }}>🌍 Top Shipment Routes</h2>
            {topRoutes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No routes yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topRoutes.map(([route, count], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 24, height: 24, background: '#F4F6FA', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#0B1C3F', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0B1C3F' }}>{route}</div>
                      <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, marginTop: 4 }}>
                        <div style={{ height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, width: `${(count / topRoutes[0][1]) * 100}%`, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9CA3AF', flexShrink: 0 }}>{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quote Conversion Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', borderRadius: 10, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'white', margin: '0 0 4px' }}>Quote Conversion Rate</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', margin: 0 }}>{accepted} accepted · {rejected} rejected · {quotes.length - accepted - rejected} pending/reviewing</p>
          </div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: '#F0A500' }}>{conversionRate}%</div>
        </div>

      </div>
    </div>
  );
}