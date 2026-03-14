import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

let socket;

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [adminOnline, setAdminOnline] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:5000');

    socket.on('connect', () => {
      socket.emit('join', {
        userId: user._id,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      });
      setAdminOnline(true);
    });

    socket.on('chat-history', (history) => {
      setMessages(history || []);
    });

    socket.on('new-message', (msg) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
      if (msg.isAdmin && !open) {
        setUnread(u => u + 1);
      }
    });

    socket.on('disconnect', () => setAdminOnline(false));

    return () => { socket?.disconnect(); };
  }, [user]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [open, messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send-message', {
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      message: input.trim(),
      isAdmin: false,
    });
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>

      {/* Chat Window */}
      {open && !minimized && (
        <div style={{ width: 340, height: 480, background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 16, border: '1px solid #E5E7EB' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 38, height: 38, background: '#F0A500', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: '0.85rem', color: '#0B1C3F' }}>FL</div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', margin: 0, fontFamily: 'Syne' }}>FlashLink Support</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: adminOnline ? '#10B981' : '#9CA3AF' }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{adminOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setMinimized(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <Minimize2 size={14} />
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#F9FAFB' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👋</div>
                <p style={{ color: '#0B1C3F', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>Hi {user.firstName}!</p>
                <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: 0 }}>How can we help you today? Send us a message and we'll get back to you shortly.</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMine = !msg.isAdmin;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%' }}>
                    {!isMine && <p style={{ fontSize: '0.68rem', color: '#9CA3AF', margin: '0 0 3px', fontWeight: 600 }}>FlashLink Support</p>}
                    <div style={{ background: isMine ? '#0B1C3F' : 'white', color: isMine ? 'white' : '#0B1C3F', padding: '10px 14px', borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px', fontSize: '0.85rem', lineHeight: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                      {msg.message}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#9CA3AF', margin: '3px 0 0', textAlign: isMine ? 'right' : 'left' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', background: 'white', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              rows={1}
              style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }}
            />
            <button onClick={sendMessage} disabled={!input.trim()} style={{ width: 38, height: 38, background: input.trim() ? '#F0A500' : '#E5E7EB', border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Send size={16} color={input.trim() ? '#0B1C3F' : '#9CA3AF'} />
            </button>
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <div onClick={() => setMinimized(false)} style={{ background: '#0B1C3F', borderRadius: 10, padding: '10px 18px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <MessageCircle size={16} color="#F0A500" />
          <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>FlashLink Support</span>
          {unread > 0 && <span style={{ background: '#EF4444', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
        </div>
      )}

      {/* Bubble Button */}
      <button
        onClick={() => { setOpen(!open); setMinimized(false); }}
        style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(11,28,63,0.4)', position: 'relative', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
        {!open && unread > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
        )}
      </button>
    </div>
  );
}