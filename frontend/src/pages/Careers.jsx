import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

const fadeUp = (delay = 0, inView) => ({
  opacity: inView ? 1 : 0,
  transform: inView ? 'translateY(0)' : 'translateY(30px)',
  transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
});

const jobs = [
  { id: 1, title: 'Senior Freight Operations Manager', location: 'Kigali, Rwanda', type: 'Full-time', dept: 'Operations', desc: 'Lead freight operations across East Africa, managing a team of 20+ logistics specialists and overseeing daily shipment workflows.', requirements: ['5+ years in freight/logistics', 'Team leadership experience', 'Knowledge of East African trade corridors', 'Fluent in English and French'] },
  { id: 2, title: 'Port Logistics Coordinator', location: 'Mombasa, Kenya', type: 'Full-time', dept: 'Port Operations', desc: 'Coordinate port operations including vessel scheduling, cargo handling, and customs clearance at Mombasa port terminal.', requirements: ['3+ years port operations experience', 'Knowledge of customs procedures', 'Strong communication skills', 'Swahili is a plus'] },
  { id: 3, title: 'Full-Stack Developer', location: 'Remote / Kigali', type: 'Full-time', dept: 'Technology', desc: 'Build and maintain FlashLink\'s logistics platform using React and Node.js, working on real-time tracking and shipment management features.', requirements: ['3+ years React & Node.js', 'MongoDB experience', 'REST API development', 'Socket.io knowledge is a plus'] },
  { id: 4, title: 'Business Development Executive', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Sales', desc: 'Drive business growth in West Africa by identifying new clients, building relationships and closing logistics contracts.', requirements: ['3+ years B2B sales', 'Logistics industry knowledge', 'Strong network in West Africa', 'Fluent in English'] },
  { id: 5, title: 'Customs Brokerage Specialist', location: 'Dar es Salaam, Tanzania', type: 'Full-time', dept: 'Customs', desc: 'Handle customs clearance documentation and compliance for international shipments entering and exiting Tanzania.', requirements: ['Customs brokerage certification', '2+ years experience', 'Knowledge of EAC trade regulations', 'Detail-oriented'] },
  { id: 6, title: 'Supply Chain Analyst', location: 'Remote', type: 'Full-time', dept: 'Analytics', desc: 'Analyze supply chain data to identify optimization opportunities, reduce costs and improve delivery times across our network.', requirements: ['Data analysis skills', 'Excel / Power BI proficiency', 'Supply chain background', 'Python or SQL is a plus'] },
];

const perks = [
  { emoji: '🌍', title: 'Pan-African Impact', desc: 'Work on projects that connect businesses across 40+ African countries.' },
  { emoji: '💰', title: 'Competitive Salary', desc: 'Market-leading compensation with performance bonuses.' },
  { emoji: '📈', title: 'Career Growth', desc: 'Fast-track career development with mentorship and training programs.' },
  { emoji: '🏥', title: 'Health Coverage', desc: 'Comprehensive medical insurance for you and your family.' },
  { emoji: '🏠', title: 'Flexible Work', desc: 'Remote and hybrid work options for most positions.' },
  { emoji: '✈️', title: 'Travel Opportunities', desc: 'Visit our operations across Africa and build your global network.' },
];

const depts = ['All', 'Operations', 'Port Operations', 'Technology', 'Sales', 'Customs', 'Analytics'];

export default function Careers() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [expandedJob, setExpandedJob] = useState(null);
  const [perksRef, perksInView] = useInView();
  const [jobsRef, jobsInView] = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const filtered = selectedDept === 'All' ? jobs : jobs.filter(j => j.dept === selectedDept);

  return (
    <div style={{ paddingTop: 70, fontFamily: 'Inter, sans-serif' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: 'clamp(4rem,8vw,7rem) 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.04) 0px, rgba(240,165,0,0.04) 1px, transparent 1px, transparent 60px)' }} />
        <div style={{ position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(240,165,0,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ ...fadeUp(0.1, heroVisible), display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)', color: '#F0A500', padding: '6px 16px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              🚀 We're Hiring
            </div>
            <h1 style={{ ...fadeUp(0.2, heroVisible), fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem,5vw,4rem)', color: 'white', lineHeight: 1.08, marginBottom: '1.5rem' }}>
              Build Africa's<br /><span style={{ color: '#F0A500' }}>Logistics</span><br />Future With Us
            </h1>
            <p style={{ ...fadeUp(0.35, heroVisible), color: 'rgba(255,255,255,0.62)', fontSize: 'clamp(0.9rem,1.5vw,1.05rem)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 500 }}>
              Join 12,000+ specialists across 40+ African countries working to transform how the continent moves goods, people and opportunities.
            </p>
            <div style={{ ...fadeUp(0.45, heroVisible), display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#open-roles" style={{ background: '#F0A500', color: '#0B1C3F', padding: '13px 28px', borderRadius: 4, fontWeight: 700, fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                View Open Roles <ArrowRight size={15} />
              </a>
              <Link to="/about" style={{ background: 'transparent', color: 'white', padding: '13px 28px', borderRadius: 4, fontWeight: 600, fontSize: '0.92rem', border: '1px solid rgba(255,255,255,0.28)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                About FlashLink
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { num: '12K+', label: 'Team Members', emoji: '👥' },
              { num: '40+', label: 'Countries', emoji: '🌍' },
              { num: '6', label: 'Open Roles', emoji: '💼' },
              { num: '15+', label: 'Years Growing', emoji: '📈' },
            ].map((s, i) => (
              <div key={i} style={{ ...fadeUp(0.3 + i * 0.1, heroVisible), background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '1.8rem' }}>{s.emoji}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: 'white', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section ref={perksRef} style={{ background: 'white', padding: 'clamp(4rem,7vw,6rem) 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...fadeUp(0, perksInView), textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>Why Join Us</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginTop: 8, marginBottom: 0 }}>Life at FlashLink</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {perks.map((p, i) => (
              <div key={i} style={{ ...fadeUp(i * 0.1, perksInView), background: '#F9FAFB', borderRadius: 12, padding: '2rem', border: '1px solid #F3F4F6', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 52, height: 52, background: '#FDF3DC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1rem' }}>{p.emoji}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#0B1C3F', marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN ROLES */}
      <section id="open-roles" ref={jobsRef} style={{ background: '#F4F6FA', padding: 'clamp(4rem,7vw,6rem) 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...fadeUp(0, jobsInView), textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>Join the Team</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginTop: 8, marginBottom: 0 }}>Open Positions</h2>
          </div>

          {/* Department filters */}
          <div style={{ ...fadeUp(0.1, jobsInView), display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            {depts.map(d => (
              <button key={d} onClick={() => setSelectedDept(d)} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: selectedDept === d ? '#0B1C3F' : 'white', color: selectedDept === d ? 'white' : '#6B7280', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                {d}
              </button>
            ))}
          </div>

          {/* Job listings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((job, i) => (
              <div key={job.id} style={{ ...fadeUp(i * 0.08, jobsInView), background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
                <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: 8 }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#0B1C3F', margin: 0 }}>{job.title}</h3>
                      <span style={{ background: '#FDF3DC', color: '#92400E', padding: '2px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>{job.dept}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#6B7280' }}><MapPin size={13} />{job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#6B7280' }}><Clock size={13} />{job.type}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#6B7280' }}><Briefcase size={13} />{job.dept}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#6B7280' }}>{expandedJob === job.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedJob === job.id && (
                  <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid #F3F4F6' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.8, margin: '1.2rem 0 1rem' }}>{job.desc}</p>
                    <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#0B1C3F', marginBottom: '0.75rem' }}>Requirements:</h4>
                    <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.2rem' }}>
                      {job.requirements.map((r, i) => (
                        <li key={i} style={{ fontSize: '0.84rem', color: '#6B7280', lineHeight: 1.8 }}>{r}</li>
                      ))}
                    </ul>
                    <a href={`mailto:careers@flashlink.com?subject=Application: ${job.title}`} style={{ background: '#F0A500', color: '#0B1C3F', padding: '11px 24px', borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                      Apply Now <ArrowRight size={14} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0B1C3F', padding: 'clamp(4rem,7vw,6rem) 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.04) 0px, rgba(240,165,0,0.04) 1px, transparent 1px, transparent 60px)' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 12 }}>Don't See Your Role?</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.15 }}>
            Send Us Your CV Anyway
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            We're always looking for talented people. Send your CV and we'll reach out when the right opportunity opens up.
          </p>
          <a href="mailto:careers@flashlink.com" style={{ background: '#F0A500', color: '#0B1C3F', padding: '14px 30px', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            Send Your CV <ArrowRight size={16} />
          </a>
        </div>
      </section>

    </div>
  );
}