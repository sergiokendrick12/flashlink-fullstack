import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Globe, Award, TrendingUp } from 'lucide-react';

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
  transform: inView ? 'translateY(0)' : 'translateY(32px)',
  transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
});

const team = [
  { name: 'Emmanuel Ndayisaba', role: 'CEO & Co-Founder', country: '🇷🇼', initials: 'EN', bio: 'Former logistics director with 20 years experience across East and Central Africa.' },
  { name: 'Fatima Al-Hassan', role: 'Chief Operations Officer', country: '🇳🇬', initials: 'FA', bio: 'Operations expert who scaled logistics networks across 15 African countries.' },
  { name: 'Kwame Asante', role: 'Chief Technology Officer', country: '🇬🇭', initials: 'KA', bio: "Tech innovator building Africa's first AI-powered freight optimization platform." },
  { name: 'Sophie Müller', role: 'Chief Financial Officer', country: '🇩🇪', initials: 'SM', bio: 'International finance expert with deep roots in African trade and investment.' },
  { name: 'Amina Diallo', role: 'VP Operations', country: '🇸🇳', initials: 'AD', bio: 'Port logistics specialist with expertise in West African maritime corridors.' },
  { name: 'James Kariuki', role: 'VP Business Development', country: '🇰🇪', initials: 'JK', bio: 'Trade corridor strategist connecting East African businesses to global markets.' },
];

const milestones = [
  { year: '2011', title: 'Founded in Kigali', desc: 'FlashLink was born with a mission to simplify African logistics.' },
  { year: '2014', title: 'East Africa Expansion', desc: 'Expanded to Kenya, Uganda, Tanzania and Burundi.' },
  { year: '2017', title: 'Port Concessions', desc: 'Secured first 3 port terminal management concessions.' },
  { year: '2019', title: 'Rail Corridors', desc: 'Launched integrated rail logistics along 3 major corridors.' },
  { year: '2022', title: '40+ Countries', desc: 'Pan-African network with 12,000+ specialists.' },
  { year: '2026', title: 'SmartRoute Launch', desc: 'AI-powered logistics optimization for African SMEs.' },
];

const shipImages = [
  { url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80', label: 'Container Terminal' },
  { url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80', label: 'Cargo Ship' },
  { url: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80', label: 'Air Freight' },
  { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', label: 'Road Logistics' },
];

const values = [
  { emoji: '🚀', title: 'Speed', desc: 'We move at the pace Africa demands — fast, reliable, always on time.' },
  { emoji: '🤝', title: 'Partnership', desc: 'We are more than a service provider — we are a true business partner.' },
  { emoji: '🌍', title: 'Pan-African', desc: "Built for Africa, by Africans. Every solution tailored to the continent." },
  { emoji: '💡', title: 'Innovation', desc: "We leverage technology to solve Africa's unique logistics challenges." },
  { emoji: '🔒', title: 'Integrity', desc: 'Transparent pricing, honest timelines, accountable delivery.' },
  { emoji: '♻️', title: 'Sustainability', desc: 'Committed to green logistics and reducing our carbon footprint.' },
];

export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [missionRef, missionInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [valuesRef, valuesInView] = useInView();
  const [timelineRef, timelineInView] = useInView();
  const [teamRef, teamInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ paddingTop: 70, fontFamily: 'Inter, sans-serif' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0B1C3F 0%, #1a3a6b 100%)', padding: 'clamp(4rem,8vw,7rem) 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.04) 0px, rgba(240,165,0,0.04) 1px, transparent 1px, transparent 60px)' }} />
        <div style={{ position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(240,165,0,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ ...fadeUp(0.1, heroVisible), display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)', color: '#F0A500', padding: '6px 16px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              🌍 Our Story
            </div>
            <h1 style={{ ...fadeUp(0.2, heroVisible), fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: 'white', lineHeight: 1.08, marginBottom: '1.5rem' }}>
              At the Heart of<br /><span style={{ color: '#F0A500' }}>Africa's</span><br />Transformation
            </h1>
            <p style={{ ...fadeUp(0.35, heroVisible), color: 'rgba(255,255,255,0.62)', fontSize: 'clamp(0.9rem,1.5vw,1.05rem)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 520 }}>
              FlashLink is Africa's trusted logistics operator — offering freight, port, maritime and rail solutions built for the continent's unique geography and ambitions.
            </p>
            <div style={{ ...fadeUp(0.45, heroVisible), display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '13px 28px', borderRadius: 4, fontWeight: 700, fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Get a Quote <ArrowRight size={15} />
              </Link>
              <Link to="/contact" style={{ background: 'transparent', color: 'white', padding: '13px 28px', borderRadius: 4, fontWeight: 600, fontSize: '0.92rem', border: '1px solid rgba(255,255,255,0.28)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Contact Us
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: <Globe size={28} />, num: '40+', label: 'Countries' },
              { icon: <Users size={28} />, num: '12K+', label: 'Specialists' },
              { icon: <Award size={28} />, num: '18', label: 'Port Terminals' },
              { icon: <TrendingUp size={28} />, num: '15+', label: 'Years' },
            ].map((s, i) => (
              <div key={i} style={{ ...fadeUp(0.3 + i * 0.1, heroVisible), background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: '#F0A500' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: 'white', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION & STORY */}
      <section ref={missionRef} style={{ padding: 'clamp(4rem,7vw,6rem) 5%', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div style={fadeUp(0, missionInView)}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 12 }}>Built for Africa</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Our Story & Mission
            </h2>
            <p style={{ color: '#6B7280', lineHeight: 1.85, marginBottom: '1rem', fontSize: '0.95rem' }}>
              Founded in <strong style={{ color: '#0B1C3F' }}>2011 in Kigali, Rwanda</strong>, FlashLink was born from a simple observation: Africa's logistics infrastructure was not keeping pace with its economic ambitions.
            </p>
            <p style={{ color: '#6B7280', lineHeight: 1.85, marginBottom: '1rem', fontSize: '0.95rem' }}>
              We set out to change that — building a pan-African logistics network that connects ports, rail corridors, roads and air freight into a single, seamless platform for businesses of all sizes.
            </p>
            <p style={{ color: '#6B7280', lineHeight: 1.85, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Today, with over <strong style={{ color: '#0B1C3F' }}>12,000 specialists in 40+ countries</strong>, we are proud to be Africa's most trusted logistics partner.
            </p>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0B1C3F', fontWeight: 700, fontSize: '0.9rem', borderBottom: '2px solid #F0A500', paddingBottom: 2, textDecoration: 'none' }}>
              Partner with us <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { emoji: '🎯', title: 'Our Mission', desc: "To accelerate Africa's trade by providing world-class, technology-driven logistics solutions.", bg: '#0B1C3F', textColor: 'white', subColor: 'rgba(255,255,255,0.6)' },
              { emoji: '🔭', title: 'Our Vision', desc: "To be Africa's most trusted and innovative logistics partner by 2030.", bg: '#F0A500', textColor: '#0B1C3F', subColor: 'rgba(11,28,63,0.65)' },
              { emoji: '💪', title: 'Our Strength', desc: 'Deep local expertise combined with global standards and technology.', bg: '#F4F6FA', textColor: '#0B1C3F', subColor: '#6B7280' },
              { emoji: '🌱', title: 'Our Promise', desc: 'Transparent, reliable and sustainable logistics for every client.', bg: '#F4F6FA', textColor: '#0B1C3F', subColor: '#6B7280' },
            ].map((card, i) => (
              <div key={i} style={{ ...fadeUp(i * 0.1, missionInView), background: card.bg, borderRadius: 12, padding: '1.5rem', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{card.emoji}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: card.textColor, marginBottom: 6 }}>{card.title}</h3>
                <p style={{ fontSize: '0.78rem', color: card.subColor, lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHIPPING IMAGES GRID */}
      <section style={{ padding: 'clamp(4rem,7vw,6rem) 5%', background: '#F4F6FA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>Our Infrastructure</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginTop: 8, marginBottom: 0 }}>
              Built to Move the World
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
            {shipImages.map((img, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 220, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <img src={img.url} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,28,63,0.75) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
                  <span style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>{img.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Wide feature image */}
          <div style={{ marginTop: '1.2rem', borderRadius: 12, overflow: 'hidden', position: 'relative', height: 320, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <img src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80" alt="Port Operations" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,28,63,0.82) 0%, rgba(11,28,63,0.3) 100%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)' }}>
              <p style={{ color: '#F0A500', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Port Operations</p>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2.2rem)', color: 'white', lineHeight: 1.2, maxWidth: 420, marginBottom: 16 }}>
                18 Port Terminals<br />Across Africa
              </h3>
              <a href="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '11px 24px', borderRadius: 4, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-block' }}>
                Get a Quote →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section ref={statsRef} style={{ background: '#0d2244', padding: '3.5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
          {[
            { num: '40+', label: 'Countries Served', icon: '🌍' },
            { num: '12K+', label: 'Specialists', icon: '👥' },
            { num: '18', label: 'Port Terminals', icon: '⚓' },
            { num: '3', label: 'Rail Corridors', icon: '🚂' },
            { num: '15+', label: 'Years Experience', icon: '📅' },
            { num: '48hr', label: 'Avg. Delivery', icon: '⚡' },
          ].map((s, i) => (
            <div key={i} style={{ ...fadeUp(i * 0.08, statsInView), textAlign: 'center', padding: '1rem 0.5rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: 'white', lineHeight: 1 }}>{s.num}</div>
              <div style={{ width: 28, height: 3, background: '#F0A500', margin: '8px auto' }} />
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section ref={valuesRef} style={{ background: '#F4F6FA', padding: 'clamp(4rem,7vw,6rem) 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...fadeUp(0, valuesInView), textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>What We Stand For</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginTop: 8, marginBottom: 0 }}>Our Core Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {values.map((v, i) => (
              <div key={i} style={{ ...fadeUp(i * 0.1, valuesInView), background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}>
                <div style={{ width: 52, height: 52, background: '#FDF3DC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1rem' }}>{v.emoji}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#0B1C3F', marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section ref={timelineRef} style={{ background: 'white', padding: 'clamp(4rem,7vw,6rem) 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ ...fadeUp(0, timelineInView), textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>Our Journey</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginTop: 8, marginBottom: 0 }}>15 Years of Growth</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: '#E5E7EB', transform: 'translateX(-50%)' }} />
            {milestones.map((m, i) => (
              <div key={i} style={{ ...fadeUp(i * 0.1, timelineInView), display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', marginBottom: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: '1.4rem', transform: 'translate(-50%, -50%)', width: 14, height: 14, background: '#F0A500', borderRadius: '50%', border: '3px solid white', boxShadow: '0 0 0 3px rgba(240,165,0,0.35)', zIndex: 2 }} />
                <div style={{ width: '44%', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 12, padding: '1.4rem 1.6rem', marginLeft: i % 2 === 0 ? '6%' : 0, marginRight: i % 2 === 0 ? 0 : '6%' }}>
                  <span style={{ background: '#F0A500', color: '#0B1C3F', display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800, marginBottom: 8 }}>{m.year}</span>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', marginBottom: 5 }}>{m.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section ref={teamRef} style={{ background: '#F4F6FA', padding: 'clamp(4rem,7vw,6rem) 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...fadeUp(0, teamInView), textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>The People Behind FlashLink</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0B1C3F', marginTop: 8, marginBottom: 0 }}>Leadership Team</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {team.map((member, i) => (
              <div key={i} style={{ ...fadeUp(i * 0.08, teamInView), background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'transform 0.3s, box-shadow 0.3s', textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}>
                <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #0B1C3F, #1e3a6e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>
                  {member.initials}
                </div>
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{member.country}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', marginBottom: 4 }}>{member.name}</h3>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F0A500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{member.role}</div>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} style={{ background: '#0B1C3F', padding: 'clamp(4rem,7vw,6rem) 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(240,165,0,0.04) 0px, rgba(240,165,0,0.04) 1px, transparent 1px, transparent 60px)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(240,165,0,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={fadeUp(0, ctaInView)}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 12 }}>Ready to Ship?</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.15 }}>
              Let's Move Africa Together
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              Join thousands of businesses across Africa that trust FlashLink to deliver their cargo — on time, every time.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/get-quote" style={{ background: '#F0A500', color: '#0B1C3F', padding: '14px 30px', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Get a Free Quote <ArrowRight size={16} />
              </Link>
              <Link to="/contact" style={{ background: 'transparent', color: 'white', padding: '14px 30px', borderRadius: 4, fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.28)', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}