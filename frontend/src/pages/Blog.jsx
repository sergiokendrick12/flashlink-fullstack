import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User, Tag, Search, ChevronRight } from 'lucide-react';

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

const anim = (inView, delay = 0) => ({
  opacity: inView ? 1 : 0,
  transform: inView ? 'none' : 'translateY(30px)',
  transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
});

const POSTS = [
  {
    id: 1,
    slug: 'tech-startups-africa-logistics',
    category: 'Technology',
    tag: 'Innovation',
    title: 'How Tech Startups Are Transforming African Logistics',
    excerpt: 'A new wave of African tech startups is disrupting traditional freight and supply chain models, bringing real-time visibility and AI-powered optimization to the continent.',
    author: 'Emmanuel Ndayisaba',
    authorInitials: 'EN',
    date: 'March 1, 2026',
    readTime: '5 min read',
    featured: true,
    color: '#0B1C3F',
    emoji: '📡',
  },
  {
    id: 2,
    slug: 'intra-african-trade-afcfta',
    category: 'Trade',
    tag: 'Policy',
    title: 'AfCFTA: What the African Free Trade Agreement Means for Logistics',
    excerpt: 'The African Continental Free Trade Area is reshaping cross-border commerce. Here\'s how FlashLink is helping businesses take advantage of new trade corridors.',
    author: 'Fatima Al-Hassan',
    authorInitials: 'FA',
    date: 'February 18, 2026',
    readTime: '7 min read',
    featured: false,
    color: '#162d5a',
    emoji: '🤝',
  },
  {
    id: 3,
    slug: 'cold-chain-africa-agribusiness',
    category: 'Agribusiness',
    tag: 'Cold Chain',
    title: 'Cold Chain Logistics: The Key to Unlocking Africa\'s Agribusiness Potential',
    excerpt: 'Post-harvest losses cost African farmers billions annually. Cold chain logistics infrastructure is finally catching up — and the results are transformative.',
    author: 'Amina Diallo',
    authorInitials: 'AD',
    date: 'February 5, 2026',
    readTime: '6 min read',
    featured: false,
    color: '#1e3a6e',
    emoji: '🌱',
  },
  {
    id: 4,
    slug: 'port-congestion-solutions',
    category: 'Port Operations',
    tag: 'Infrastructure',
    title: 'Solving Port Congestion: Africa\'s Biggest Logistics Bottleneck',
    excerpt: 'Port congestion costs African economies an estimated $5 billion annually. We explore the innovations and investments reducing delays at key African terminals.',
    author: 'Kwame Asante',
    authorInitials: 'KA',
    date: 'January 22, 2026',
    readTime: '8 min read',
    featured: false,
    color: '#0d2244',
    emoji: '⚓',
  },
  {
    id: 5,
    slug: 'last-mile-delivery-africa',
    category: 'Last Mile',
    tag: 'Innovation',
    title: 'Last-Mile Delivery in Africa: Motorcycles, Drones and Digital Maps',
    excerpt: 'Delivering to informal settlements and rural areas requires creative thinking. How African logistics companies are solving the last-mile challenge with local innovation.',
    author: 'James Kariuki',
    authorInitials: 'JK',
    date: 'January 10, 2026',
    readTime: '5 min read',
    featured: false,
    color: '#132340',
    emoji: '🏍️',
  },
  {
    id: 6,
    slug: 'rail-freight-east-africa',
    category: 'Rail',
    tag: 'Infrastructure',
    title: 'East Africa\'s Rail Renaissance: SGR and the Future of Freight',
    excerpt: 'The Standard Gauge Railway is changing how goods move across East Africa. We look at the impact on logistics costs, transit times and trade volumes.',
    author: 'Emmanuel Ndayisaba',
    authorInitials: 'EN',
    date: 'December 28, 2025',
    readTime: '6 min read',
    featured: false,
    color: '#0a192e',
    emoji: '🚂',
  },
  {
    id: 7,
    slug: 'customs-clearance-tips',
    category: 'Customs',
    tag: 'Guide',
    title: '10 Tips to Speed Up Customs Clearance in Africa',
    excerpt: 'Customs delays are among the biggest pain points for African importers and exporters. Our experts share the most effective strategies to minimize clearance time.',
    author: 'Sophie Müller',
    authorInitials: 'SM',
    date: 'December 15, 2025',
    readTime: '4 min read',
    featured: false,
    color: '#162d5a',
    emoji: '📋',
  },
  {
    id: 8,
    slug: 'green-logistics-africa',
    category: 'Sustainability',
    tag: 'Green',
    title: 'Green Logistics: How African Shippers Are Reducing Their Carbon Footprint',
    excerpt: 'Sustainability is no longer optional. African logistics companies are investing in electric vehicles, solar warehouses and carbon offset programs.',
    author: 'Amina Diallo',
    authorInitials: 'AD',
    date: 'December 1, 2025',
    readTime: '5 min read',
    featured: false,
    color: '#0B1C3F',
    emoji: '♻️',
  },
];

const CATEGORIES = ['All', 'Technology', 'Trade', 'Agribusiness', 'Port Operations', 'Last Mile', 'Rail', 'Customs', 'Sustainability'];

const categoryColors = {
  Technology: { bg: '#EEF2FF', color: '#3730A3' },
  Trade: { bg: '#D1FAE5', color: '#065F46' },
  Agribusiness: { bg: '#FEF3C7', color: '#92400E' },
  'Port Operations': { bg: '#DBEAFE', color: '#1E40AF' },
  'Last Mile': { bg: '#FEE2E2', color: '#991B1B' },
  Rail: { bg: '#F3F4F6', color: '#374151' },
  Customs: { bg: '#FDF3DC', color: '#92400E' },
  Sustainability: { bg: '#D1FAE5', color: '#065F46' },
};

export default function Blog() {
  const [vis, setVis] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [postsRef, postsInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  const featured = POSTS.find(p => p.featured);
  const filtered = POSTS.filter(p => !p.featured).filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        .blog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .blog-cats { display:flex; gap:.5rem; flex-wrap:wrap; justify-content:center; }
        @media(max-width:960px){ .blog-grid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:600px){ .blog-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{ paddingTop: 70, fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

        {/* ══ HERO ══ */}
        <section style={{ background: 'linear-gradient(150deg,#050e1d 0%,#0B1C3F 55%,#0f2a55 100%)', padding: 'clamp(3.5rem,8vw,6rem) 5%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'64px 64px', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', right:'-5%', top:'50%', transform:'translateY(-50%)', width:'45vw', height:'45vw', background:'radial-gradient(circle,rgba(240,165,0,0.09) 0%,transparent 65%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2, textAlign:'center' }}>
            <div style={anim(vis, 0.05)}>
              <span style={{ fontSize:'0.68rem', fontWeight:800, letterSpacing:'2.5px', textTransform:'uppercase', color:'#F0A500', display:'block', marginBottom:12 }}>Insights & Stories</span>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(2.4rem,5vw,4rem)', color:'white', lineHeight:1.05, margin:'0 0 1.2rem' }}>
                The FlashLink <span style={{ color:'#F0A500' }}>Blog</span>
              </h1>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'1.05rem', lineHeight:1.85, maxWidth:560, margin:'0 auto 2.5rem' }}>
                Logistics insights, trade intelligence and innovation stories from across Africa's fastest-growing logistics network.
              </p>
              {/* Search bar */}
              <div style={{ maxWidth:480, margin:'0 auto', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, backdropFilter:'blur(12px)' }}>
                <Search size={18} color="rgba(255,255,255,0.45)" style={{ flexShrink:0 }}/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  style={{ flex:1, background:'none', border:'none', outline:'none', color:'white', fontSize:'0.92rem' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══ FEATURED POST ══ */}
        {featured && (
          <section style={{ background:'white', padding:'clamp(3rem,6vw,5rem) 5%' }}>
            <div style={{ maxWidth:1200, margin:'0 auto' }}>
              <div style={{ ...anim(vis, 0.2), display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'center', background:'#F4F6FA', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
                {/* image side */}
                <div style={{ background:`linear-gradient(135deg,${featured.color} 0%,#1e3a6e 100%)`, minHeight:360, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'7rem', position:'relative', overflow:'hidden' }}>
                  {featured.emoji}
                  <div style={{ position:'absolute', width:260, height:260, border:'1px solid rgba(240,165,0,0.12)', borderRadius:'50%', top:20, right:20 }}/>
                  <div style={{ position:'absolute', top:20, left:20, background:'#F0A500', color:'#0B1C3F', padding:'4px 14px', borderRadius:20, fontSize:'0.7rem', fontWeight:800, letterSpacing:1 }}>✨ FEATURED</div>
                </div>
                {/* text side */}
                <div style={{ padding:'2.5rem 2.5rem 2.5rem 0' }}>
                  <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:14 }}>
                    <span style={{ background: categoryColors[featured.category]?.bg || '#F3F4F6', color: categoryColors[featured.category]?.color || '#374151', padding:'3px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:700 }}>{featured.category}</span>
                    <span style={{ background:'#FDF3DC', color:'#92400E', padding:'3px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:700 }}>{featured.tag}</span>
                  </div>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(1.4rem,2.5vw,1.9rem)', color:'#0B1C3F', lineHeight:1.2, marginBottom:'1rem' }}>{featured.title}</h2>
                  <p style={{ color:'#6B7280', fontSize:'0.9rem', lineHeight:1.8, marginBottom:'1.5rem' }}>{featured.excerpt}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', marginBottom:'1.8rem', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:32, height:32, background:'linear-gradient(135deg,#0B1C3F,#1e3a6e)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.72rem' }}>{featured.authorInitials}</div>
                      <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>{featured.author}</span>
                    </div>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.78rem', color:'#9CA3AF' }}><Clock size={13}/>{featured.date}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.78rem', color:'#9CA3AF' }}><Tag size={13}/>{featured.readTime}</span>
                  </div>
                  <Link to={`/blog/${featured.slug}`} style={{ background:'#0B1C3F', color:'white', padding:'12px 24px', borderRadius:8, fontWeight:700, fontSize:'0.88rem', display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none' }}>
                    Read Article <ArrowRight size={15}/>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ ALL POSTS ══ */}
        <section ref={postsRef} style={{ background:'#F4F6FA', padding:'clamp(3rem,6vw,5rem) 5%' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ ...anim(postsInView, 0), textAlign:'center', marginBottom:'2.5rem' }}>
              <span style={{ fontSize:'0.68rem', fontWeight:800, letterSpacing:'2.5px', textTransform:'uppercase', color:'#F0A500', display:'block', marginBottom:10 }}>All Articles</span>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,3vw,2.4rem)', color:'#0B1C3F', margin:0 }}>Latest Insights</h2>
            </div>

            {/* Category filters */}
            <div className="blog-cats" style={{ marginBottom:'2.5rem' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  padding:'8px 18px', borderRadius:20, border:'none',
                  background: category === c ? '#0B1C3F' : 'white',
                  color: category === c ? 'white' : '#6B7280',
                  fontWeight:600, fontSize:'0.82rem', cursor:'pointer',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                  transition:'all .2s',
                }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Posts grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'4rem', color:'#9CA3AF' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔍</div>
                <p style={{ fontSize:'1rem' }}>No articles found. Try a different search or category.</p>
              </div>
            ) : (
              <div className="blog-grid">
                {filtered.map((post, i) => (
                  <div key={post.id} style={{
                    ...anim(postsInView, i * 0.08),
                    background:'white', borderRadius:16, overflow:'hidden',
                    boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                    transition:'transform .3s, box-shadow .3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 50px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'; }}
                  >
                    {/* card image */}
                    <div style={{ background:`linear-gradient(135deg,${post.color} 0%,#1e3a6e 100%)`, height:160, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem', position:'relative' }}>
                      {post.emoji}
                      <div style={{ position:'absolute', top:12, left:12 }}>
                        <span style={{ background: categoryColors[post.category]?.bg || '#F3F4F6', color: categoryColors[post.category]?.color || '#374151', padding:'3px 10px', borderRadius:20, fontSize:'0.68rem', fontWeight:700 }}>{post.category}</span>
                      </div>
                    </div>
                    {/* card body */}
                    <div style={{ padding:'1.5rem' }}>
                      <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#0B1C3F', lineHeight:1.35, marginBottom:'0.75rem' }}>{post.title}</h3>
                      <p style={{ fontSize:'0.82rem', color:'#6B7280', lineHeight:1.7, marginBottom:'1.2rem' }}>{post.excerpt}</p>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, background:'linear-gradient(135deg,#0B1C3F,#1e3a6e)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.65rem', flexShrink:0 }}>{post.authorInitials}</div>
                          <div>
                            <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#374151' }}>{post.author}</div>
                            <div style={{ fontSize:'0.7rem', color:'#9CA3AF' }}>{post.date} · {post.readTime}</div>
                          </div>
                        </div>
                        <Link to={`/blog/${post.slug}`} style={{ display:'flex', alignItems:'center', gap:4, color:'#F0A500', fontWeight:700, fontSize:'0.78rem', textDecoration:'none' }}>
                          Read <ChevronRight size={14}/>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══ NEWSLETTER CTA ══ */}
        <section ref={ctaRef} style={{ background:'linear-gradient(150deg,#050e1d 0%,#0B1C3F 100%)', padding:'clamp(3.5rem,7vw,6rem) 5%', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,rgba(240,165,0,0.03) 0px,rgba(240,165,0,0.03) 1px,transparent 1px,transparent 60px)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'70vw', height:'70vw', maxWidth:700, background:'radial-gradient(circle,rgba(240,165,0,0.07) 0%,transparent 60%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:560, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>
            <div style={anim(ctaInView, 0)}>
              <span style={{ fontSize:'0.68rem', fontWeight:800, letterSpacing:'2.5px', textTransform:'uppercase', color:'#F0A500', display:'block', marginBottom:12 }}>Stay Informed</span>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'white', lineHeight:1.1, marginBottom:'1rem' }}>
                Get Logistics Insights<br />Delivered Weekly
              </h2>
              <p style={{ color:'rgba(255,255,255,0.48)', fontSize:'1rem', lineHeight:1.85, marginBottom:'2rem' }}>
                Join 5,000+ logistics professionals receiving our weekly African trade updates and industry insights.
              </p>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', justifyContent:'center' }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  style={{ flex:1, minWidth:220, padding:'13px 18px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'0.9rem', outline:'none' }}
                />
                <button style={{ background:'#F0A500', color:'#0B1C3F', padding:'13px 24px', borderRadius:8, fontWeight:800, fontSize:'0.9rem', border:'none', cursor:'pointer', whiteSpace:'nowrap', boxShadow:'0 6px 20px rgba(240,165,0,0.3)' }}>
                  Subscribe →
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}