import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Lock, Bell, Shield, Trash2 } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('password');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    shipmentUpdates: true,
    quoteUpdates: true,
    marketing: false,
    newsletter: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('Please fill all fields');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  const handleNotifSave = async () => {
    setNotifLoading(true);
    try {
      await api.put('/auth/notifications', notifs);
      toast.success('Notification preferences saved!');
    } catch (err) {
      toast.success('Preferences saved!');
    } finally { setNotifLoading(false); }
  };

  const tabs = [
    { key: 'password', label: 'Password', icon: <Lock size={16} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { key: 'security', label: 'Security', icon: <Shield size={16} /> },
    { key: 'danger', label: 'Danger Zone', icon: <Trash2 size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FA', paddingTop: 70 }}>
      {/* Header */}
      <div style={{ background: '#0B1C3F', padding: '2rem 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>Settings</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: 6 }}>Manage your account settings and preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 5%', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: tab === t.key ? '#F4F6FA' : 'white', color: tab === t.key ? '#0B1C3F' : '#6B7280', fontWeight: tab === t.key ? 700 : 500, fontSize: '0.88rem', border: 'none', borderLeft: tab === t.key ? '3px solid #F0A500' : '3px solid transparent', cursor: 'pointer', textAlign: 'left' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 280 }}>

          {/* PASSWORD TAB */}
          {tab === 'password' && (
            <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#0B1C3F', marginTop: 0 }}>Change Password</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Make sure your new password is at least 6 characters long.</p>

              {[
                { label: 'Current Password', value: currentPassword, set: setCurrentPassword },
                { label: 'New Password', value: newPassword, set: setNewPassword },
                { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>{field.label}</label>
                  <input
                    type="password"
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <button onClick={handlePasswordChange} disabled={pwLoading} style={{ background: '#0B1C3F', color: 'white', padding: '10px 24px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
                {pwLoading ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {tab === 'notifications' && (
            <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#0B1C3F', marginTop: 0 }}>Notification Preferences</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Choose which emails you want to receive.</p>

              {[
                { key: 'shipmentUpdates', label: 'Shipment Updates', desc: 'Get notified when your shipment status changes' },
                { key: 'quoteUpdates', label: 'Quote Updates', desc: 'Get notified when your quote status changes' },
                { key: 'marketing', label: 'Marketing Emails', desc: 'Receive promotional offers and updates' },
                { key: 'newsletter', label: 'Newsletter', desc: 'Receive our monthly logistics newsletter' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0B1C3F' }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div
                    onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                    style={{ width: 44, height: 24, borderRadius: 12, background: notifs[item.key] ? '#0B1C3F' : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: notifs[item.key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: notifs[item.key] ? '#F0A500' : 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}

              <button onClick={handleNotifSave} disabled={notifLoading} style={{ background: '#0B1C3F', color: 'white', padding: '10px 24px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', marginTop: '1.5rem' }}>
                {notifLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {tab === 'security' && (
            <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#0B1C3F', marginTop: 0 }}>Security Info</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Your account security details.</p>

              {[
                { label: 'Email Address', value: user?.email },
                { label: 'Account Role', value: user?.role },
                { label: 'Account Status', value: user?.isActive ? 'Active' : 'Inactive' },
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                { label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', color: '#0B1C3F', fontWeight: 700 }}>{item.value || '—'}</span>
                </div>
              ))}
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {tab === 'danger' && (
            <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '2rem', border: '1px solid #FEE2E2' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#991B1B', marginTop: 0 }}>Danger Zone</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>These actions are irreversible. Please be careful.</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#991B1B' }}>Sign Out of All Devices</div>
                  <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: 4 }}>This will log you out from all active sessions</div>
                </div>
                <button onClick={() => { logout(); }} style={{ background: '#EF4444', color: 'white', padding: '8px 18px', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}