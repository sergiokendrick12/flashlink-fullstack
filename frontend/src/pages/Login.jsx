import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1C3F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', paddingTop: '90px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.03) 0px, rgba(240,165,0,0.03) 1px, transparent 1px, transparent 60px)' }} />
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', width: '100%', maxWidth: 440, position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: '#F0A500', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#0B1C3F' }}>FL</div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.35rem', color: '#0B1C3F' }}>Flash<span style={{ color: '#F0A500' }}>Link</span></span>
          </Link>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: '#0B1C3F', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: '#6B7280', fontSize: '0.88rem' }}>Sign in to your FlashLink account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#0B1C3F', marginBottom: 6 }}>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F0A500'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#0B1C3F', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="••••••••"
                style={{ width: '100%', padding: '12px 42px 12px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#F0A500'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '13px', borderRadius: 6, fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#6B7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#F0A500', fontWeight: 700 }}>Create one</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.88rem' }}>
          <Link to="/forgot-password" style={{ color: '#6B7280' }}>Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
}