import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', company: '', phone: '', country: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#0B1C3F', marginBottom: 5 };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1C3F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '90px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.03) 0px, rgba(240,165,0,0.03) 1px, transparent 1px, transparent 60px)' }} />
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', width: '100%', maxWidth: 520, position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1.2rem' }}>
            <div style={{ width: 38, height: 38, background: '#F0A500', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: '#0B1C3F' }}>FL</div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.25rem', color: '#0B1C3F' }}>Flash<span style={{ color: '#F0A500' }}>Link</span></span>
          </Link>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#0B1C3F', marginBottom: 5 }}>Create your account</h1>
          <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Join Africa's leading logistics platform</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div><label style={labelStyle}>First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" style={inputStyle} /></div>
            <div><label style={labelStyle}>Last Name *</label><input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Email Address *</label><input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@company.com" style={inputStyle} /></div>
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <label style={labelStyle}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="Min. 6 characters" style={{ ...inputStyle, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div><label style={labelStyle}>Company</label><input name="company" value={form.company} onChange={handleChange} placeholder="Your company" style={inputStyle} /></div>
            <div><label style={labelStyle}>Phone</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="+250 ..." style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}><label style={labelStyle}>Country</label><input name="country" value={form.country} onChange={handleChange} placeholder="Rwanda" style={inputStyle} /></div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '13px', borderRadius: 6, fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#6B7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#F0A500', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}