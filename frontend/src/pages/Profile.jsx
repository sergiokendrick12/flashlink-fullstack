import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building, Save, Lock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePassChange = e => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', form);
      if (setUser) setUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match!');
    if (passwords.newPass.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.9rem', fontFamily: 'DM Sans', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>
      {/* Header */}
      <div style={{ background: '#0B1C3F', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 64, height: 64, background: '#F0A500', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#0B1C3F' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{user?.firstName} {user?.lastName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: '4px 0 0' }}>{user?.email} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 5%' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: tab === t ? '#F0A500' : 'white', color: tab === t ? '#0B1C3F' : '#6B7280', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textTransform: 'capitalize' }}>
              {t === 'profile' ? '👤 Profile Info' : '🔒 Change Password'}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '2rem' }}>
          {tab === 'profile' && (
            <>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input name="email" value={form.email} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 890" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Company</label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="Your company name" style={inputStyle} />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} style={{ marginTop: '1.5rem', background: '#F0A500', color: '#0B1C3F', border: 'none', padding: '12px 28px', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}

          {tab === 'password' && (
            <>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Change Password</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: 400 }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input name="current" type="password" value={passwords.current} onChange={handlePassChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input name="newPass" type="password" value={passwords.newPass} onChange={handlePassChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input name="confirm" type="password" value={passwords.confirm} onChange={handlePassChange} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={saving} style={{ marginTop: '1.5rem', background: '#0B1C3F', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 6, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} /> {saving ? 'Saving...' : 'Change Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}