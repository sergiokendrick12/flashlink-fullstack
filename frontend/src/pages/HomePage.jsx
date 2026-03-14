import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Ship, Train, Truck, Warehouse, Globe, ChevronRight } from 'lucide-react'
import { shipmentsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const stats = [
  { num: '40+',  label: 'Countries',          desc: 'Logistics coverage across Africa' },
  { num: '12K+', label: 'Specialists',         desc: 'Dedicated professionals' },
  { num: '18',   label: 'Port Terminals',      desc: 'Port concessions managed' },
  { num: '3',    label: 'Rail Corridors',       desc: 'Passenger & freight rail' },
]

const services = [
  { icon: Ship,      title: 'Port & Maritime',    desc: 'Terminal management, stevedoring and maritime services across Africa\'s busiest ports.', color: 'bg-navy' },
  { icon: Train,     title: 'Rail Solutions',      desc: 'Integrated freight and passenger rail with full infrastructure maintenance.', color: 'bg-[#1a3668]' },
  { icon: Truck,     title: 'Road Freight',        desc: 'Pan-African road transport and last-mile delivery across 40+ countries.', color: 'bg-[#0d2244]' },
  { icon: Warehouse, title: 'Warehousing',         desc: 'Temperature-controlled storage and distribution facilities near major ports.', color: 'bg-navy' },
  { icon: Globe,     title: 'Customs Clearance',   desc: 'Expert customs brokerage and trade compliance across all African borders.', color: 'bg-[#1a3668]' },
  { icon: Globe,     title: 'Multimodal',          desc: 'Seamlessly combine sea, road, and rail for optimal cost and speed.', color: 'bg-[#0d2244]' },
]

const industries = [
  { emoji: '🌱', title: 'Agribusiness',     color: 'from-green-800 to-green-600' },
  { emoji: '🏥', title: 'Humanitarian Aid', color: 'from-blue-900 to-blue-700' },
  { emoji: '⚡', title: 'Energy',           color: 'from-orange-900 to-orange-700' },
  { emoji: '🛒', title: 'FMCG',            color: 'from-teal-900 to-teal-700' },
  { emoji: '⛏️', title: 'Mining',          color: 'from-gray-800 to-gray-600' },
  { emoji: '🏗️', title: 'Construction',    color: 'from-yellow-900 to-yellow-700' },
]

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export default function HomePage() {
  const [trackRef, setTrackRef] = useState('')
  const navigate = useNavigate()

  const handleTrack = (e) => {
    e.preventDefault()
    if (!trackRef.trim()) return toast.error('Enter a tracking number')
    navigate(`/track?ref=${trackRef.trim()}`)
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-64px)] bg-navy flex items-center overflow-hidden">
        <div className="absolute inset-0 pattern-bg" />
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10"
          style={{ background: 'radial-gradient(circle at 80% 50%, #F0A500, transparent 60%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0 }}
              className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              ⚡ Africa's Fastest Growing Logistics Network
            </motion.div>
            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)' }}>
              At the Speed of<br /><span className="text-gold">Africa's</span><br />Ambition
            </motion.h1>
            <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}
              className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg font-light">
              FlashLink connects Africa through world-class port, maritime, rail, and freight solutions — built for the continent, built for speed.
            </motion.p>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10">
              <Link to="/quote" className="btn-primary">Get a Quote <ArrowRight size={16} /></Link>
              <Link to="/about" className="btn-outline-white">Discover FlashLink</Link>
            </motion.div>

            {/* Quick track */}
            <motion.form initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.4 }}
              onSubmit={handleTrack} className="flex gap-0 max-w-md">
              <input value={trackRef} onChange={(e) => setTrackRef(e.target.value)}
                placeholder="Enter tracking number (e.g. FLABC123)"
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 py-3 text-sm rounded-l-xl focus:outline-none focus:border-gold" />
              <button type="submit" className="bg-gold text-navy font-bold px-5 rounded-r-xl hover:bg-gold-light transition-colors flex items-center gap-2 text-sm">
                <Search size={15} /> Track
              </button>
            </motion.form>
          </div>

          {/* Hero visual */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden h-[480px] bg-gradient-to-br from-[#162d5a] to-[#050e1f] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-9xl mb-4">🚢</div>
                  <p className="text-white/40 text-sm">Port · Maritime · Rail · Road</p>
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-5 -left-5 bg-gold rounded-xl p-4 shadow-2xl">
                <div className="font-display font-extrabold text-3xl text-navy">40+</div>
                <div className="text-navy/70 text-xs font-semibold">Countries Served</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="font-display font-extrabold text-2xl text-navy">12K+</div>
                <div className="text-gray-500 text-xs font-semibold">Specialists</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#071528] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ num, label, desc }, i) => (
              <motion.div key={label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}
                className="text-center py-4">
                <div className="font-display font-extrabold text-white mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{num}</div>
                <div className="gold-line-center" />
                <div className="text-white font-bold text-xs uppercase tracking-widest mt-1">{label}</div>
                <div className="text-white/40 text-xs mt-1">{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT STRIP ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="section-tag">Who We Are</span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl mb-4">FlashLink: A Force<br />Connecting Africa</h2>
              <div className="gold-line" />
              <p className="text-gray-500 mt-4 mb-4 leading-relaxed">
                <strong className="text-navy">FlashLink</strong> is Africa's trusted logistics operator, offering freight, port, maritime, and rail solutions built for the continent's unique geography and ambitions.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                With over 12,000 specialists in 40+ countries, we draw on decades of expertise to deliver tailored services to African and international clients. Our ambition: accelerate Africa's transformation — one shipment at a time.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🚢', title: 'Port Operations', desc: '18 concessions managed' },
                  { icon: '🚂', title: 'Rail Logistics', desc: '3 major corridors' },
                  { icon: '🛣️', title: 'Road Freight', desc: 'Pan-African coverage' },
                  { icon: '📊', title: 'Digital Platform', desc: 'Real-time tracking' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <div className="font-bold text-navy text-sm">{title}</div>
                      <div className="text-gray-400 text-xs">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative">
              <div className="rounded-2xl overflow-hidden h-[420px] bg-gradient-to-br from-navy to-[#0d2244] flex items-center justify-center">
                <div className="text-8xl">🌍</div>
              </div>
              <div className="absolute bottom-6 right-6 bg-gold rounded-xl px-5 py-3 shadow-xl">
                <div className="font-display font-extrabold text-2xl text-navy">15+</div>
                <div className="text-navy/70 text-xs font-semibold">Years in Africa</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <span className="section-tag">What We Do</span>
            <h2 className="section-title text-3xl md:text-4xl">Our Expertise</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }}
                className="card overflow-hidden group cursor-pointer">
                <div className={`${color} h-44 flex items-center justify-center`}>
                  <Icon size={52} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-navy mb-2 uppercase tracking-wide text-sm">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                  <Link to="/services" className="text-navy font-bold text-sm border-b-2 border-gold pb-0.5 hover:text-gold transition-colors inline-flex items-center gap-1">
                    Read more <ChevronRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
            <span className="section-tag">Sectors We Serve</span>
            <h2 className="section-title text-3xl md:text-4xl">Industries</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map(({ emoji, title, color }, i) => (
              <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.06 }}
                className="group cursor-pointer">
                <div className={`h-40 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300`}>
                  {emoji}
                </div>
                <div className="mt-3">
                  <h3 className="font-display font-bold text-navy text-sm uppercase tracking-wide">{title}</h3>
                  <Link to="/industries" className="text-xs text-gray-400 hover:text-gold transition-colors inline-flex items-center gap-1 mt-1">
                    Read more →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="section-tag text-gold">Start Today</span>
            <h2 className="font-display font-extrabold text-white text-4xl md:text-5xl mb-4">Ready to ship across Africa?</h2>
            <p className="text-white/50 mb-8 text-lg">Request a free quote in minutes. Our team responds within 24 hours.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/quote" className="btn-primary">Request a Quote <ArrowRight size={16} /></Link>
              <Link to="/contact" className="btn-outline-white">Talk to an Expert</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
