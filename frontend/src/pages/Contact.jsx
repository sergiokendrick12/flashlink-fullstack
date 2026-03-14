import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', subject: '', message: '', type: 'general' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans' };
  const lbl = { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#0B1C3F', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70 }}>
      <div style={{ background: '#0B1C3F', padding: '4rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 8 }}>Get in Touch</span>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white' }}>Contact Us</h1>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 5%', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
        {/* Info */}
        <div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Get in touch</h2>
          {[
            { icon: <Mail size={20} />, title: 'Email', val: 'info@flashlink.com' },
            { icon: <Phone size={20} />, title: 'Phone', val: '+250 788 000 000' },
            { icon: <MapPin size={20} />, title: 'Headquarters', val: 'Kigali Innovation City\nKigali, Rwanda' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, background: '#FDF3DC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0A500', flexShrink: 0 }}>{item.icon}</div>
              <div><p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F', marginBottom: 3 }}>{item.title}</p><p style={{ fontSize: '0.84rem', color: '#6B7280', whiteSpace: 'pre-line' }}>{item.val}</p></div>
            </div>
          ))}
        </div>

        {/* Form */}
        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'white', borderRadius: 12, padding: '4rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <CheckCircle size={60} color="#10B981" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#0B1C3F', marginBottom: 8 }}>Message Sent!</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Thank you for reaching out. We'll get back to you within 1-2 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 12, padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={lbl}>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" style={inp} /></div>
              <div><label style={lbl}>Email *</label><input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" style={inp} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={lbl}>Phone</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="+250..." style={inp} /></div>
              <div><label style={lbl}>Company</label><input name="company" value={form.company} onChange={handleChange} placeholder="Your company" style={inp} /></div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={lbl}>Type</label>
              <select name="type" value={form.type} onChange={handleChange} style={{ ...inp, background: 'white' }}>
                {[['general','General Inquiry'],['support','Support'],['partnership','Partnership'],['media','Media']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}><label style={lbl}>Subject *</label><input name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?" style={inp} /></div>
            <div style={{ marginBottom: '1.5rem' }}><label style={lbl}>Message *</label><textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us more..." style={{ ...inp, resize: 'vertical' }} /></div>
            <button type="submit" disabled={loading} style={{ background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '13px 28px', borderRadius: 4, fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {loading ? 'Sending...' : <><span>Send Message</span><ArrowRight size={15} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}