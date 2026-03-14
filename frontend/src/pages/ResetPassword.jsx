import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match!');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2.5rem', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: '#0B1C3F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#F0A500' }}>FL</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#0B1C3F', margin: 0 }}>Reset Password</h1>
          <p style={{ color: '#6B7280', fontSize: '0.88rem', marginTop: 8 }}>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat your password" style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '13px', borderRadius: 6, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: '1rem' }}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#6B7280', fontSize: '0.85rem' }}>← Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}