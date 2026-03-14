import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Ship, Train, Truck, Globe, ChevronRight, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target);
    const duration = 1800, steps = 60;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { num: '40', suffix: '+', label: 'Countries', desc: 'Pan-African logistics coverage' },
  { num: '12000', suffix: '+', label: 'Specialists', desc: 'Dedicated logistics professionals' },
  { num: '18', suffix: '', label: 'Port Terminals', desc: 'Managed port concessions' },
  { num: '3', suffix: '', label: 'Rail Corridors', desc: 'Integrated freight rail routes' },
];

const services = [
  { icon: <Ship size={36} />, title: 'Port & Maritime', desc: "Terminal management, stevedoring and maritime services across Africa's busiest ports.", href: '/expertise/port', color: '#0d2244' },
  { icon: <Package size={36} />, title: 'Freight & Customs', desc: 'Air, sea and road freight forwarding with seamless customs clearance.', href: '/expertise/freight', color: '#162d5a' },
  { icon: <Train size={36} />, title: 'Rail Logistics', desc: 'Integrated passenger and freight rail along 3 major African corridors.', href: '/expertise/rail', color: '#1e3a6e' },
  { icon: <Truck size={36} />, title: 'Road Transport', desc: 'Pan-African road transport with last-mile precision delivery.', href: '/expertise/road', color: '#0b1c3f' },
  { icon: <Globe size={36} />, title: 'Warehousing', desc: 'Strategic warehousing and distribution centers across key African trade hubs.', href: '/expertise/warehousing', color: '#132340' },
  { icon: <Package size={36} />, title: 'Customs Brokerage', desc: 'Expert customs clearance and trade compliance across all African borders.', href: '/expertise/customs', color: '#0a192e' },
];

const industries = [
  { emoji: '🌱', title: 'Agribusiness', desc: 'Connecting African producers to local and global markets with cold-chain precision.', href: '/industries/agribusiness' },
  { emoji: '🏥', title: 'Humanitarian Aid', desc: 'Urgent, sensitive, regulated — relief logistics coordinated with precision.', href: '/industries/humanitarian' },
  { emoji: '⚡', title: 'Energy', desc: "Supporting Africa's solar, wind, gas and oil boom with infrastructure logistics.", href: '/industries/energy' },
  { emoji: '🛒', title: 'FMCG', desc: 'Fast-moving consumer goods supply chains kept ahead of demand.', href: '/industries/fmcg' },
];

export default function Home() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [trackNum, setTrackNum] = useState('');

  const [aboutRef, aboutInView] = useInView();
  const [servicesRef, servicesInView] = useInView();
  const [industriesRef, industriesInView] = useInView();
  const [blogRef, blogInView] = useInView();
  const [testimonialsRef, testimonialsInView] = useInView();
  const [ctaRef, ctaInView] = useInView();
  const [careerRef, careerInView] = useInView();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNlLoading(true);
    try {
      const { data } = await api.post('/newsletter/subscribe', { email: newsletterEmail });
      toast.success(data.message);
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally { setNlLoading(false); }
  };

  const fadeUp = (inView, delay = 0) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(40px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  const fadeIn = (inView, delay = 0) => ({
    opacity: inView ? 1 : 0,
    transition: `opacity 0.7s ease ${delay}s`,
  });

  return (
    <div style={{ paddingTop: 70 }}>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        .hero-text-1 { animation: slide-in-left 0.9s ease 0.1s both; }
        .hero-text-2 { animation: fade-up 0.9s ease 0.35s both; }
        .hero-text-3 { animation: fade-up 0.9s ease 0.55s both; }
        .hero-btns  { animation: fade-up 0.9s ease 0.75s both; }
        .hero-track { animation: fade-up 0.9s ease 0.9s both; }
        .hero-cards { animation: slide-in-right 0.9s ease 0.3s both; }

        .hero-card  { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hero-card:hover { transform: translateX(-6px) !important; box-shadow: -8px 8px 30px rgba(0,0,0,0.3) !important; }

        .service-card { transition: transform 0.35s ease, box-shadow 0.35s ease !important; }
        .service-card:hover { transform: translateY(-10px) !important; box-shadow: 0 24px 50px rgba(0,0,0,0.14) !important; }

        .industry-img { transition: transform 0.3s ease !important; }
        .industry-img:hover { transform: scale(1.05) translateY(-4px) !important; }

        .testimonial-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .testimonial-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }

        .cta-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }

        .floating { animation: float 4s ease-in-out infinite; }
        .floating-slow { animation: float 6s ease-in-out infinite; }

        /* ── RESPONSIVE ── */

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .industries-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          background: white;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .blog-grid:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .cta-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .career-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .newsletter-flex {
          display: flex;
          gap: 0.5rem;
          max-width: 460px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .hero-cards { animation: fade-up 0.9s ease 0.3s both; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .industries-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .career-grid { grid-template-columns: 1fr; gap: 2rem; }
          .blog-grid { grid-template-columns: 1fr; }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .hero-grid { gap: 2rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .services-grid { grid-template-columns: 1fr; }
          .industries-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: 1fr; }
          .cta-flex { flex-direction: column; align-items: flex-start; }
          .newsletter-flex { flex-direction: column; }
          .newsletter-flex input,
          .newsletter-flex button { width: 100%; box-sizing: border-box; }
          .hero-btns { flex-wrap: wrap; }
          .hero-btns a { width: 100%; justify-content: center; }
          .about-globe { display: none; }
        }

        @media (max-width: 400px) {
          .industries-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Banner */}
      {bannerVisible && (
        <div style={{ background: '#FDF3DC', borderLeft: '4px solid #F0A500', padding: '1rem 5%', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', animation: 'fade-up 0.5s ease both' }}>
          <div style={{ width: 48, height: 48, background: '#F0A500', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <strong style={{ color: '#0B1C3F', fontSize: '0.9rem' }}>FlashLink launches SmartRoute — AI-powered logistics optimization for African SMEs</strong>
            <p style={{ color: '#6B7280', fontSize: '0.82rem', marginTop: 3 }}>Simplifying market access, reducing logistics costs, and supporting local businesses across intra-African trade corridors.</p>
          </div>
          <Link to="/news/smartroute" className="cta-btn" style={{ background: '#F0A500', color: '#0B1C3F', padding: '9px 18px', borderRadius: 4, fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>Learn more <ArrowRight size={13} /></Link>
          <button onClick={() => setBannerVisible(false)} style={{ background: 'none', border: 'none', color: '#6B7280', flexShrink: 0, cursor: 'pointer' }}><X size={18} /></button>
        </div>
      )}

      {/* HERO */}
      <section style={{ background: '#0B1C3F', minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, zIndex: 0 }}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(11,28,63,0.92) 0%,rgba(11,28,63,0.70) 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(240,165,0,0.04) 0px,rgba(240,165,0,0.04) 1px,transparent 1px,transparent 60px)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,165,0,0.06) 0%,transparent 70%)', animation: 'float 8s ease-in-out infinite', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,165,0,0.08) 0%,transparent 70%)', animation: 'float 6s ease-in-out infinite 2s', zIndex: 1 }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 5%', width: '100%', position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div>
              <div className="hero-text-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.25)', color: '#F0A500', padding: '6px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                ⚡ Africa's Fastest Growing Logistics Network
              </div>
              <h1 className="hero-text-2" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', color: 'white', lineHeight: 1.05, marginBottom: '1.5rem' }}>
                At the Speed<br />of{' '}
                <span style={{ color: '#F0A500', backgroundImage: 'linear-gradient(90deg,#F0A500,#FFD166,#F0A500)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>Africa's</span>
                <br />Ambition
              </h1>
              <p className="hero-text-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 480 }}>
                FlashLink is Africa's trusted logistics connector — delivering port, freight, rail and last-mile solutions at the pace your business demands.
              </p>
              <div className="hero-btns" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link to="/get-quote" className="cta-btn" style={{ background: '#F0A500', color: '#0B1C3F', padding: '14px 30px', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Get a Quote <ArrowRight size={16} />
                </Link>
                <Link to="/track" className="cta-btn" style={{ background: 'transparent', color: 'white', padding: '14px 30px', borderRadius: 4, fontWeight: 500, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Track Shipment
                </Link>
              </div>
              <div className="hero-track" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '1rem 1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', maxWidth: 440 }}>
                <input value={trackNum} onChange={e => setTrackNum(e.target.value)} placeholder="Enter tracking number (e.g. FL-TRK-...)" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.85rem', minWidth: 0 }} />
                <Link to={`/track/${trackNum}`} className="cta-btn" style={{ background: '#F0A500', color: '#0B1C3F', padding: '8px 14px', borderRadius: 4, fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Track →</Link>
              </div>
            </div>

            <div className="hero-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { emoji: '🚢', num: '18+', label: 'Port Terminals Managed' },
                { emoji: '✈️', num: '120+', label: 'Daily Shipments Handled' },
                { emoji: '🌍', num: '40+', label: 'African Countries Covered' },
              ].map((card, i) => (
                <div key={i} className="hero-card" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div style={{ fontSize: '2.2rem' }}>{card.emoji}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'white', lineHeight: 1 }}>{card.num}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{card.label}</div>
                  </div>
                </div>
              ))}
              <div className="hero-card" style={{ background: '#F0A500', borderRadius: 12, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ fontSize: '2.2rem' }}>⚡</div>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#0B1C3F', lineHeight: 1 }}>48hr</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(11,28,63,0.7)', marginTop: 4 }}>Average Delivery Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#0d2244', padding: '3.5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'white', lineHeight: 1 }}>
                  <AnimatedCounter target={s.num} suffix={s.suffix} />
                </div>
                <div style={{ width: 36, height: 3, background: '#F0A500', margin: '8px auto' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section ref={aboutRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 5%' }}>
        <div className="about-grid">
          <div style={{ ...fadeUp(aboutInView, 0) }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: '0.8rem' }}>Who We Are</span>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0B1C3F', marginBottom: '1.5rem', lineHeight: 1.2 }}>FlashLink: A Force<br />Connecting Africa</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, marginBottom: '1rem' }}>
              <strong style={{ color: '#0B1C3F' }}>FlashLink</strong> is Africa's trusted logistics operator, offering freight, port, maritime, and rail solutions built for the continent's unique geography and ambitions.
            </p>
            <p style={{ color: '#6B7280', lineHeight: 1.8, marginBottom: '2rem' }}>
              With over 12,000 specialists operating in 40+ countries, FlashLink draws on deep expertise to deliver tailored, innovative services to African and international clients.
            </p>
            <Link to="/about" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0B1C3F', fontWeight: 700, fontSize: '0.9rem', borderBottom: '2px solid #F0A500', paddingBottom: 2 }}>
              Learn more about FlashLink <ArrowRight size={15} />
            </Link>
          </div>
          <div className="about-globe" style={{ ...fadeUp(aboutInView, 0.2) }}>
            <div className="floating" style={{ background: 'linear-gradient(135deg, #162d5a 0%, #0b1c3f 100%)', borderRadius: 12, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', position: 'relative' }}>
              🌍
              <div style={{ position: 'absolute', bottom: -12, right: -12, background: '#F0A500', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: '#0B1C3F', lineHeight: 1 }}>15+</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(11,28,63,0.7)', fontWeight: 600 }}>Years in Africa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section ref={servicesRef} style={{ background: '#F4F6FA', padding: '5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem', ...fadeUp(servicesInView) }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>What We Do</span>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0B1C3F', marginTop: 8 }}>Our Expertise</h2>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className="service-card" style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer', ...fadeUp(servicesInView, i * 0.08) }}>
                <div style={{ height: 160, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F0A500' }}>{s.icon}</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0B1C3F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.84rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '1rem' }}>{s.desc}</p>
                  <Link to={s.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0B1C3F', fontWeight: 700, fontSize: '0.82rem', borderBottom: '2px solid #F0A500', paddingBottom: 1 }}>
                    Read more <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section ref={industriesRef} style={{ padding: '5rem 5%', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...fadeUp(industriesInView) }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 8 }}>Sectors We Serve</span>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0B1C3F', marginBottom: '3rem' }}>Industries</h2>
          </div>
          <div className="industries-grid">
            {industries.map((ind, i) => (
              <div key={i} style={{ cursor: 'pointer', ...fadeUp(industriesInView, i * 0.1) }}>
                <div className="industry-img" style={{ height: 200, borderRadius: 10, background: `hsl(${210 + i * 20}, 60%, ${15 + i * 4}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', marginBottom: '1rem' }}>
                  {ind.emoji}
                </div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0B1C3F', marginBottom: '0.5rem' }}>{ind.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '0.8rem' }}>{ind.desc}</p>
                <Link to={ind.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0B1C3F', fontWeight: 700, fontSize: '0.8rem' }}>
                  Read more <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section ref={blogRef} style={{ background: '#FDF8EF', padding: '5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...fadeUp(blogInView) }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 8 }}>Latest Insights</span>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0B1C3F', marginBottom: '2.5rem' }}>Blog</h2>
          </div>
          <div className="blog-grid" style={{ ...fadeUp(blogInView, 0.2) }}>
            <div className="floating-slow" style={{ background: 'linear-gradient(135deg, #0b1c3f, #1e3a6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', minHeight: 260 }}>📡</div>
            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#F0A500', marginBottom: '0.8rem' }}>Blog · Logistics</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.4rem', color: '#0B1C3F', marginBottom: '0.7rem', lineHeight: 1.3 }}>How tech startups are transforming African logistics</h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '1.5rem' }}>March 1, 2026</p>
              <Link to="/blog/tech-startups-africa-logistics" className="cta-btn" style={{ background: '#0B1C3F', color: 'white', padding: '11px 22px', borderRadius: 4, fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section ref={testimonialsRef} style={{ background: 'white', padding: '5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem', ...fadeUp(testimonialsInView) }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500' }}>What Clients Say</span>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0B1C3F', marginTop: 8 }}>Trusted by Businesses Across Africa</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { name: 'Amara Diallo', role: 'CEO, Dakar Fresh Foods', country: '🇸🇳', text: 'FlashLink transformed our cold-chain logistics. Our perishables now reach Abidjan in 48 hours — consistently. Game changer for our business.' },
              { name: 'James Okonkwo', role: 'Supply Chain Director, Lagos Manufacturing', country: '🇳🇬', text: 'The customs clearance team is exceptional. What used to take 2 weeks now takes 3 days. Our entire supply chain is faster.' },
              { name: 'Sarah Mwangi', role: 'Founder, Nairobi Tech Imports', country: '🇰🇪', text: 'Real-time tracking and a dedicated account manager. I always know where my shipment is. FlashLink feels like a true partner.' },
            ].map((t, i) => (
              <div key={i} className="testimonial-card" style={{ background: '#F9FAFB', borderRadius: 12, padding: '2rem', border: '1px solid #F3F4F6', ...fadeUp(testimonialsInView, i * 0.15) }}>
                <div style={{ fontSize: '2.5rem', color: '#F0A500', fontFamily: 'Georgia', lineHeight: 1, marginBottom: '1rem' }}>"</div>
                <p style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '1.5rem', fontStyle: 'italic' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 42, height: 42, background: '#0B1C3F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B1C3F' }}>{t.country} {t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: '#0B1C3F', padding: '4rem 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,165,0,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 8 }}>Stay Updated</span>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white', marginBottom: '0.75rem' }}>Get Logistics Insights Delivered</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', marginBottom: '2rem' }}>Join 5,000+ logistics professionals receiving our weekly African trade updates.</p>
          <div className="newsletter-flex">
            <input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} placeholder="Enter your email address"
              style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.88rem', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#F0A500'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
            <button onClick={handleNewsletterSubmit} disabled={nlLoading} className="cta-btn" style={{ background: '#F0A500', color: '#0B1C3F', padding: '12px 24px', borderRadius: 4, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {nlLoading ? 'Subscribing...' : 'Subscribe →'}
            </button>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section ref={ctaRef} style={{ background: '#F0A500', padding: '3.5rem 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'rgba(11,28,63,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1, ...fadeUp(ctaInView) }}>
          <div className="cta-flex">
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#0B1C3F', margin: 0 }}>Ready to ship across Africa?</h2>
              <p style={{ color: 'rgba(11,28,63,0.65)', fontSize: '0.9rem', marginTop: 6 }}>Get a free quote in minutes. No commitment required.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/get-quote" className="cta-btn" style={{ background: '#0B1C3F', color: 'white', padding: '13px 28px', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Get a Free Quote <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="cta-btn" style={{ background: 'transparent', color: '#0B1C3F', padding: '13px 28px', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', border: '2px solid #0B1C3F', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER */}
      <section ref={careerRef} style={{ background: '#FDF3DC', padding: '5rem 5%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg,rgba(240,165,0,0.07) 0px,rgba(240,165,0,0.07) 1px,transparent 1px,transparent 40px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="career-grid">
            <div style={{ ...fadeUp(careerInView) }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', display: 'block', marginBottom: 8 }}>Join the Team</span>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0B1C3F', marginBottom: '0.5rem' }}>Career</h2>
              <div style={{ width: 40, height: 3, background: '#F0A500', margin: '12px 0 1.5rem' }} />
              <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem' }}>
                Do you want to have a rewarding experience in an international environment and make an impact in a company that puts Africa at the heart of its project?
              </p>
              <Link to="/careers" className="cta-btn" style={{ background: '#F0A500', color: '#0B1C3F', padding: '13px 28px', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Join us <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '8rem', ...fadeIn(careerInView, 0.3) }}>
              <span className="floating">🌍</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}