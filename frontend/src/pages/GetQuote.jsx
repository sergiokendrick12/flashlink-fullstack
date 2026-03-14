import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Service', 'Route', 'Cargo', 'Contact', 'Review'];

export default function GetQuote() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteNum, setQuoteNum] = useState('');
  const [form, setForm] = useState({
    serviceType: '', origin: { country: '', city: '', port: '' }, destination: { country: '', city: '', port: '' },
    cargo: { type: 'general', description: '', weight: '', weightUnit: 'tons', volume: '', containers: '', containerType: '20ft' },
    timeline: 'standard', additionalServices: [], specialRequirements: '',
    guestName: user?.firstName + ' ' + user?.lastName || '', guestEmail: user?.email || '', guestPhone: user?.phone || '', guestCompany: user?.company || '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNested = (parent, key, val) => setForm(f => ({ ...f, [parent]: { ...f[parent], [key]: val } }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/quotes', form);
      setQuoteNum(data.data.quoteNumber);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quote');
    } finally { setLoading(false); }
  };

  const inp = { padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 6, fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#0B1C3F', marginBottom: 5 };

  if (submitted) return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#F4F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '4rem', textAlign: 'center', maxWidth: 480, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CheckCircle size={60} color="#10B981" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: '#0B1C3F', marginBottom: 8 }}>Quote Request Submitted!</h2>
        <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Your quote number is:</p>
        <div style={{ background: '#F0A500', color: '#0B1C3F', padding: '10px 20px', borderRadius: 8, fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', display: 'inline-block', margin: '0.5rem 0 1.5rem' }}>{quoteNum}</div>
        <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '2rem' }}>Our team will review your request and respond within 24-48 hours. Check your email for confirmation.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ background: '#0B1C3F', color: 'white', padding: '11px 22px', borderRadius: 4, fontWeight: 700, fontSize: '0.9rem' }}>Go to Dashboard</Link>
          <button onClick={() => { setSubmitted(false); setStep(0); }} style={{ background: 'white', color: '#0B1C3F', padding: '11px 22px', borderRadius: 4, fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid #E5E7EB', cursor: 'pointer' }}>New Quote</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#F4F6FA' }}>
      <div style={{ background: '#0B1C3F', padding: '2.5rem 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem' }}>Request a Quote</h1>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= step ? '#F0A500' : 'rgba(255,255,255,0.15)', color: i <= step ? '#0B1C3F' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.3s' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: i <= step ? '#F0A500' : 'rgba(255,255,255,0.4)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#F0A500' : 'rgba(255,255,255,0.15)', margin: '0 0.5rem', marginBottom: 20, transition: 'background 0.3s' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 5%' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          {/* STEP 0 - SERVICE */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Select Service Type</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[['freight','🚢','Freight'], ['port','⚓','Port'], ['rail','🚂','Rail'], ['road','🚛','Road'], ['customs','📋','Customs'], ['warehousing','🏭','Warehousing'], ['express','⚡','Express'], ].map(([val, icon, label]) => (
                  <button key={val} onClick={() => set('serviceType', val)} style={{ padding: '1.5rem 1rem', border: form.serviceType === val ? '2px solid #F0A500' : '1.5px solid #E5E7EB', borderRadius: 8, background: form.serviceType === val ? '#FDF3DC' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: '#0B1C3F' }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 - ROUTE */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Origin & Destination</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Syne', color: '#0B1C3F', marginBottom: '1rem', fontSize: '0.95rem' }}>📍 Origin</h3>
                  <div style={{ marginBottom: '1rem' }}><label style={lbl}>Country *</label><input value={form.origin.country} onChange={e => setNested('origin','country',e.target.value)} placeholder="e.g. Rwanda" style={inp} /></div>
                  <div style={{ marginBottom: '1rem' }}><label style={lbl}>City</label><input value={form.origin.city} onChange={e => setNested('origin','city',e.target.value)} placeholder="e.g. Kigali" style={inp} /></div>
                  <div><label style={lbl}>Port/Terminal</label><input value={form.origin.port} onChange={e => setNested('origin','port',e.target.value)} placeholder="e.g. Port of Mombasa" style={inp} /></div>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne', color: '#0B1C3F', marginBottom: '1rem', fontSize: '0.95rem' }}>🏁 Destination</h3>
                  <div style={{ marginBottom: '1rem' }}><label style={lbl}>Country *</label><input value={form.destination.country} onChange={e => setNested('destination','country',e.target.value)} placeholder="e.g. Nigeria" style={inp} /></div>
                  <div style={{ marginBottom: '1rem' }}><label style={lbl}>City</label><input value={form.destination.city} onChange={e => setNested('destination','city',e.target.value)} placeholder="e.g. Lagos" style={inp} /></div>
                  <div><label style={lbl}>Port/Terminal</label><input value={form.destination.port} onChange={e => setNested('destination','port',e.target.value)} placeholder="e.g. Apapa Port" style={inp} /></div>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={lbl}>Timeline Preference</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[['standard','Standard (7-14 days)'], ['express','Express (3-5 days)'], ['flexible','Flexible']].map(([val, label]) => (
                    <button key={val} onClick={() => set('timeline', val)} style={{ flex: 1, padding: '10px', border: form.timeline === val ? '2px solid #F0A500' : '1.5px solid #E5E7EB', borderRadius: 6, background: form.timeline === val ? '#FDF3DC' : 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#0B1C3F' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 - CARGO */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Cargo Details</h2>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Cargo Type</label>
                <select value={form.cargo.type} onChange={e => setNested('cargo','type',e.target.value)} style={{ ...inp, background: 'white' }}>
                  {[['general','General Cargo'],['bulk','Bulk'],['container','Container'],['liquid','Liquid/Tanker'],['perishable','Perishable'],['hazardous','Hazardous'],['oversized','Oversized']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={lbl}>Description</label><textarea value={form.cargo.description} onChange={e => setNested('cargo','description',e.target.value)} rows={3} placeholder="Describe your cargo..." style={{ ...inp, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div><label style={lbl}>Weight</label><input type="number" value={form.cargo.weight} onChange={e => setNested('cargo','weight',e.target.value)} placeholder="0" style={inp} /></div>
                <div><label style={lbl}>Unit</label><select value={form.cargo.weightUnit} onChange={e => setNested('cargo','weightUnit',e.target.value)} style={{ ...inp, background: 'white' }}><option value="tons">Tons</option><option value="kg">KG</option></select></div>
                <div><label style={lbl}>Volume (CBM)</label><input type="number" value={form.cargo.volume} onChange={e => setNested('cargo','volume',e.target.value)} placeholder="0" style={inp} /></div>
              </div>
              <div style={{ marginBottom: '1rem' }}><label style={lbl}>Special Requirements</label><textarea value={form.specialRequirements} onChange={e => set('specialRequirements',e.target.value)} rows={2} placeholder="Temperature control, fragile, etc." style={{ ...inp, resize: 'vertical' }} /></div>
            </div>
          )}

          {/* STEP 3 - CONTACT */}
          {step === 3 && !user && (
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0B1C3F', marginBottom: '0.5rem' }}>Your Contact Details</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Or <Link to="/login" style={{ color: '#F0A500', fontWeight: 700 }}>log in</Link> to auto-fill your details.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div><label style={lbl}>Full Name *</label><input value={form.guestName} onChange={e => set('guestName',e.target.value)} placeholder="John Doe" style={inp} /></div>
                <div><label style={lbl}>Email *</label><input type="email" value={form.guestEmail} onChange={e => set('guestEmail',e.target.value)} placeholder="you@company.com" style={inp} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={lbl}>Phone</label><input value={form.guestPhone} onChange={e => set('guestPhone',e.target.value)} placeholder="+250..." style={inp} /></div>
                <div><label style={lbl}>Company</label><input value={form.guestCompany} onChange={e => set('guestCompany',e.target.value)} placeholder="Your company" style={inp} /></div>
              </div>
            </div>
          )}
          {step === 3 && user && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0B1C3F', marginBottom: 8 }}>Logged in as {user.firstName}</h2>
              <p style={{ color: '#6B7280', fontSize: '0.88rem' }}>We'll use your account details for this quote request.</p>
            </div>
          )}

          {/* STEP 4 - REVIEW */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0B1C3F', marginBottom: '1.5rem' }}>Review Your Request</h2>
              <div style={{ background: '#F4F6FA', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[['Service', form.serviceType], ['Origin', `${form.origin.city || ''} ${form.origin.country}`], ['Destination', `${form.destination.city || ''} ${form.destination.country}`], ['Cargo Type', form.cargo.type], ['Weight', `${form.cargo.weight} ${form.cargo.weightUnit}`], ['Timeline', form.timeline]].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9CA3AF', marginBottom: 3 }}>{k}</div>
                      <div style={{ fontWeight: 600, color: '#0B1C3F', fontSize: '0.9rem' }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.6 }}>By submitting this request, you agree to our <Link to="/terms" style={{ color: '#F0A500' }}>Terms & Conditions</Link>. Our team will contact you within 24-48 hours with a detailed quote.</p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '11px 24px', borderRadius: 4, border: '1.5px solid #E5E7EB', background: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: step === 0 ? 'not-allowed' : 'pointer', color: step === 0 ? '#9CA3AF' : '#0B1C3F' }}>
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.serviceType} style={{ padding: '11px 28px', borderRadius: 4, border: 'none', background: '#F0A500', color: '#0B1C3F', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Next Step <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ padding: '11px 28px', borderRadius: 4, border: 'none', background: '#F0A500', color: '#0B1C3F', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading ? 'Submitting...' : <><span>Submit Quote Request</span><ArrowRight size={15} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}