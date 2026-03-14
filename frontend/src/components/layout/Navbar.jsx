import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Settings as SettingsIcon, Bell, Package, FileText, Search, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const navItems = [
  { label: 'Expertise', href: '/expertise' },
  { label: 'Industries', href: '/industries' },
  { label: 'Network', href: '/network' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const readIds = JSON.parse(localStorage.getItem('fl_read_notifs') || '[]');
    Promise.all([
      api.get('/shipments/my').catch(() => ({ data: { data: [] } })),
      api.get('/quotes/my').catch(() => ({ data: { data: [] } })),
    ]).then(([sRes, qRes]) => {
      const shipments = sRes.data.data || [];
      const quotes = qRes.data.data || [];
      const notifs = [];
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const shipmentIcons = {
        booked: '📦', picked_up: '🚚', in_transit: '✈️',
        at_port: '⚓', customs: '📋', out_for_delivery: '🛵',
        delivered: '✅', exception: '⚠️',
      };

      const quoteIcons = {
        pending: '⏳', reviewing: '🔍', quoted: '💰',
        accepted: '✅', rejected: '❌',
      };

      shipments.forEach(s => {
        if (new Date(s.updatedAt).getTime() < sevenDaysAgo) return;
        notifs.push({
          id: 'ship_' + s._id,
          icon: shipmentIcons[s.status] || '📦',
          text: `Shipment ${s.trackingNumber} is ${s.status?.replace(/_/g, ' ')}`,
          time: new Date(s.updatedAt).toLocaleDateString(),
          link: `/track/${s.trackingNumber}`,
          read: readIds.includes('ship_' + s._id),
        });
      });

      quotes.forEach(q => {
        if (new Date(q.updatedAt).getTime() < sevenDaysAgo) return;
        notifs.push({
          id: 'quote_' + q._id,
          icon: quoteIcons[q.status] || '📋',
          text: `Quote ${q.quoteNumber} is ${q.status}`,
          time: new Date(q.updatedAt).toLocaleDateString(),
          link: '/quotes',
          read: readIds.includes('quote_' + q._id),
        });
      });

      notifs.sort((a, b) => (a.read ? 1 : -1));
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
  }, [user]);

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('fl_read_notifs', JSON.stringify(allIds));
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = () => { logout(); navigate('/'); setUserMenuOpen(false); };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(26,58,107,0.97)' : '#1A3A6B',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      padding: '0 5%', height: '70px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
    }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
        <div style={{ width:38, height:38, background:'#F47B20', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:800, fontSize:16, color:'#1A3A6B' }}>FL</div>
        <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.35rem', color:'white' }}>Flash<span style={{ color:'#F47B20' }}>Link</span></span>
      </Link>

      {/* Desktop Nav */}
      <div style={{ display:'flex', alignItems:'center', gap:'1.8rem' }} className="desktop-nav">
        {navItems.map(item => (
          <NavLink key={item.label} to={item.href} style={({ isActive }) => ({
            color: isActive ? '#F47B20' : 'rgba(255,255,255,0.8)',
            fontSize:'0.82rem', fontWeight:500, letterSpacing:'0.5px', textTransform:'uppercase',
            transition:'color 0.2s', textDecoration:'none',
          })}>
            {item.label}
          </NavLink>
        ))}
        <Link to="/track" style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.82rem', fontWeight:500, letterSpacing:'0.5px', textTransform:'uppercase', textDecoration:'none' }}>Track</Link>
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }} className="desktop-nav">
        {user ? (
          <>
            {/* Search Button */}
            <Link to="/search" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 10px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', textDecoration:'none' }}>
              <Search size={18} />
            </Link>

            {/* Notifications Bell */}
            <div style={{ position:'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 10px', color:'white', cursor:'pointer', position:'relative', display:'flex', alignItems:'center' }}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{ position:'absolute', top:-4, right:-4, background:'#EF4444', color:'white', borderRadius:'50%', width:18, height:18, fontSize:'0.65rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'white', borderRadius:8, boxShadow:'0 10px 40px rgba(0,0,0,0.15)', width:320, zIndex:1001, overflow:'hidden' }}>
                  <div style={{ padding:'12px 16px', borderBottom:'1px solid #F3F4F6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:'0.9rem', color:'#0B1C3F' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize:'0.72rem', color:'#F0A500', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight:340, overflowY:'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding:'2rem', textAlign:'center', color:'#9CA3AF', fontSize:'0.85rem' }}>No notifications this week</div>
                    ) : notifications.map((n, i) => (
                      <Link key={i} to={n.link} onClick={() => setNotifOpen(false)} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px 16px', borderBottom:'1px solid #F9FAFB', textDecoration:'none', background: n.read ? 'white' : '#FFFBEB' }}>
                        <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{n.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'0.82rem', color:'#0B1C3F', fontWeight: n.read ? 400 : 700, lineHeight:1.4 }}>{n.text}</div>
                          <div style={{ fontSize:'0.72rem', color:'#9CA3AF', marginTop:2 }}>{n.time}</div>
                        </div>
                        {!n.read && <div style={{ width:7, height:7, borderRadius:'50%', background:'#F0A500', flexShrink:0, marginTop:4 }} />}
                      </Link>
                    ))}
                  </div>
                  <div style={{ padding:'10px 16px', borderTop:'1px solid #F3F4F6', textAlign:'center' }}>
                    <Link to="/shipments" onClick={() => setNotifOpen(false)} style={{ fontSize:'0.8rem', color:'#F0A500', fontWeight:700, textDecoration:'none' }}>View all shipments →</Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div style={{ position:'relative' }}>
              <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }} style={{
                display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 14px',
                color:'white', fontSize:'0.85rem', fontWeight:500, cursor:'pointer',
              }}>
                <div style={{ width:28, height:28, background:'#F47B20', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:800, fontSize:11, color:'#1A3A6B' }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                {user.firstName}
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'white', borderRadius:8, boxShadow:'0 10px 40px rgba(0,0,0,0.15)', minWidth:180, overflow:'hidden', zIndex:1001 }}>
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#1A3A6B', fontSize:'0.88rem', fontWeight:500, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/shipments" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#1A3A6B', fontSize:'0.88rem', fontWeight:500, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                    <Package size={16} /> My Shipments
                  </Link>
                  <Link to="/quotes" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#1A3A6B', fontSize:'0.88rem', fontWeight:500, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                    <FileText size={16} /> My Quotes
                  </Link>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#1A3A6B', fontSize:'0.88rem', fontWeight:500, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/analytics" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#1A3A6B', fontSize:'0.88rem', fontWeight:500, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                    <BarChart2 size={16} /> Analytics
                  </Link>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#1A3A6B', fontSize:'0.88rem', fontWeight:500, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                    <SettingsIcon size={16} /> Settings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#F47B20', fontSize:'0.88rem', fontWeight:700, borderBottom:'1px solid #f0f0f0', textDecoration:'none' }}>
                      <SettingsIcon size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', color:'#EF4444', fontSize:'0.88rem', fontWeight:500, background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.85rem', fontWeight:500, textDecoration:'none' }}>Login</Link>
            <Link to="/get-quote" style={{ background:'#F47B20', color:'#1A3A6B', padding:'9px 20px', borderRadius:4, fontSize:'0.85rem', fontWeight:700, textDecoration:'none' }}>Get a Quote →</Link>
          </>
        )}
      </div>

      {/* Hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="hamburger-btn" style={{ display:'none', background:'none', border:'none', color:'white', padding:4 }}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ position:'fixed', top:70, left:0, right:0, background:'#1A3A6B', padding:'1.5rem 5%', borderTop:'1px solid rgba(255,255,255,0.1)', zIndex:999 }}>
          {navItems.map(item => (
            <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} style={{ display:'block', color:'rgba(255,255,255,0.85)', padding:'10px 0', fontSize:'0.9rem', fontWeight:500, borderBottom:'1px solid rgba(255,255,255,0.07)', textTransform:'uppercase', letterSpacing:'0.5px', textDecoration:'none' }}>
              {item.label}
            </Link>
          ))}
          <Link to="/track" onClick={() => setMobileOpen(false)} style={{ display:'block', color:'rgba(255,255,255,0.85)', padding:'10px 0', fontSize:'0.9rem', fontWeight:500, borderBottom:'1px solid rgba(255,255,255,0.07)', textTransform:'uppercase', letterSpacing:'0.5px', textDecoration:'none' }}>Track Shipment</Link>
          <div style={{ marginTop:'1rem', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', background:'rgba(255,255,255,0.1)', color:'white', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:600, textDecoration:'none' }}>Dashboard</Link>
                <Link to="/shipments" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', background:'rgba(255,255,255,0.1)', color:'white', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:600, textDecoration:'none' }}>Shipments</Link>
                <Link to="/quotes" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', background:'rgba(255,255,255,0.1)', color:'white', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:600, textDecoration:'none' }}>Quotes</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', background:'#F47B20', color:'#1A3A6B', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:700, textDecoration:'none' }}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} style={{ flex:1, background:'#EF4444', color:'white', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:600, border:'none', cursor:'pointer' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', background:'rgba(255,255,255,0.1)', color:'white', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:600, textDecoration:'none' }}>Login</Link>
                <Link to="/get-quote" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', background:'#F47B20', color:'#1A3A6B', padding:'10px', borderRadius:4, fontSize:'0.85rem', fontWeight:700, textDecoration:'none' }}>Get a Quote</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}