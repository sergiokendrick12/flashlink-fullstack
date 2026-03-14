import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: '#0B1C3F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#F0A500' }}>FL</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#0B1C3F', margin: 0 }}>Forgot Password?</h1>
          <p style={{ color: '#6B7280', fontSize: '0.88rem', marginTop: 8 }}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: '#D1FAE5', borderRadius: 8 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
            <h3 style={{ color: '#065F46', fontFamily: 'Syne', fontWeight: 700, margin: '0 0 8px' }}>Email Sent!</h3>
            <p style={{ color: '#065F46', fontSize: '0.88rem', margin: 0 }}>Check your inbox for the password reset link. It expires in 30 minutes.</p>
            <Link to="/login" style={{ display: 'inline-block', marginTop: '1rem', color: '#0B1C3F', fontWeight: 700, fontSize: '0.88rem' }}>← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sergesndinda@gmail.com" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '13px', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: '1rem' }}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#6B7280', fontSize: '0.85rem' }}>← Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}