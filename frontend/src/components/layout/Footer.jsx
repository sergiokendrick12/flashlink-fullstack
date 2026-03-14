import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const footerLinks = {
  'Expertise': [['Port & Maritime', '/expertise/port'], ['Freight & Customs', '/expertise/freight'], ['Rail Solutions', '/expertise/rail'], ['Road Transport', '/expertise/road'], ['Warehousing', '/expertise/warehousing']],
  'Industries': [['Agribusiness', '/industries/agribusiness'], ['Humanitarian Aid', '/industries/humanitarian'], ['Energy', '/industries/energy'], ['FMCG', '/industries/fmcg'], ['Mining', '/industries/mining']],
  'Company': [['About FlashLink', '/about'], ['Our Network', '/network'], ['Careers', '/careers'], ['News & Blog', '/blog'], ['Contact Us', '/contact']],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally { setLoading(false); }
  };

  return (
    <footer style={{ background: '#0B1C3F', color: 'rgba(255,255,255,0.7)' }}>
      {/* Newsletter Strip */}
      <div style={{ background: '#0d2244', padding: '2.5rem 5%', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: 'Syne', color: 'white', fontSize: '1.4rem', marginBottom: 6 }}>Subscribe to our newsletter</h3>
            <div style={{ width: 40, height: 3, background: '#F0A500', marginBottom: 8 }} />
            <p style={{ fontSize: '0.88rem' }}>Stay updated with logistics news and FlashLink updates across Africa.</p>
          </div>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" required
              style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', borderRadius: '4px 0 0 4px', color: 'white', fontSize: '0.9rem', minWidth: 240, outline: 'none' }} />
            <button type="submit" disabled={loading}
              style={{ background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '12px 22px', borderRadius: '0 4px 4px 0', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {loading ? '...' : 'Subscribe →'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 5% 2rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem' }}>
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1.2rem' }}>
            <div style={{ width: 38, height: 38, background: '#F0A500', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#0B1C3F' }}>FL</div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.35rem', color: 'white' }}>Flash<span style={{ color: '#F0A500' }}>Link</span></span>
          </Link>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
            FlashLink is Africa's trusted logistics operator — connecting ports, railways, and roads to move essential goods across the continent with speed and precision.
          </p>
          <address style={{ fontStyle: 'normal', fontSize: '0.82rem', lineHeight: 2, color: 'rgba(255,255,255,0.45)' }}>
            <strong style={{ color: 'white' }}>FlashLink Headquarters</strong><br />
            Kigali Innovation City, KG 7 Ave<br />
            Kigali, Rwanda
          </address>
          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.5rem' }}>
            {['𝕏', 'in', '▶', 'f', '📷'].map((icon, i) => (
              <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>{icon}</a>
            ))}
          </div>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'white', marginBottom: '1.2rem' }}>{title}</h4>
            {links.map(([label, href]) => (
              <Link key={label} to={href} style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.6rem', transition: 'color 0.2s' }}>{label}</Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>© 2026 FlashLink. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms'], ['Sponsorship', '/sponsorship']].map(([label, href]) => (
              <Link key={label} to={href} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}