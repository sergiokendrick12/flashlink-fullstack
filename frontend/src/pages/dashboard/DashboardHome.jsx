// DashboardHome.jsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { shipmentsAPI, quotesAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Package, FileText, Clock, CheckCircle } from 'lucide-react'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  confirmed: 'bg-purple-100 text-purple-700',
  at_port: 'bg-orange-100 text-orange-700',
  customs_clearance: 'bg-indigo-100 text-indigo-700',
}

export default function DashboardHome() {
  const { user } = useAuth()
  const { data: shipmentsData } = useQuery({ queryKey: ['shipments', { limit: 5 }], queryFn: () => shipmentsAPI.getAll({ limit: 5 }) })
  const { data: quotesData }    = useQuery({ queryKey: ['quotes',    { limit: 5 }], queryFn: () => quotesAPI.getAll({ limit: 5 }) })

  const shipments = shipmentsData?.data?.data?.shipments || []
  const quotes    = quotesData?.data?.data?.quotes || []

  const statCards = [
    { icon: Package,     label: 'Total Shipments', value: shipmentsData?.data?.data?.total ?? 0, color: 'bg-blue-50 text-blue-600' },
    { icon: FileText,    label: 'Quote Requests',   value: quotesData?.data?.data?.total ?? 0,    color: 'bg-purple-50 text-purple-600' },
    { icon: Clock,       label: 'In Transit',        value: shipments.filter(s => s.status === 'in_transit').length, color: 'bg-orange-50 text-orange-600' },
    { icon: CheckCircle, label: 'Delivered',         value: shipments.filter(s => s.status === 'delivered').length,  color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-navy text-2xl">Good day, {user?.firstName} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Here's an overview of your logistics activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <div className="font-display font-extrabold text-navy text-2xl">{value}</div>
            <div className="text-gray-400 text-xs mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-navy">Recent Shipments</h2>
            <Link to="/dashboard/shipments" className="text-xs text-gold hover:underline font-semibold">View all →</Link>
          </div>
          {shipments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No shipments yet</p>
              <Link to="/quote" className="text-gold text-xs font-semibold hover:underline mt-2 inline-block">Request a quote →</Link>
            </div>
          ) : shipments.map((s) => (
            <Link key={s._id} to={`/dashboard/shipments/${s._id}`}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-5 px-5 transition-colors">
              <div>
                <div className="font-mono text-navy font-semibold text-sm">{s.trackingNumber}</div>
                <div className="text-gray-400 text-xs">{s.origin?.city} → {s.destination?.city}</div>
              </div>
              <span className={`status-badge ${statusColors[s.status] || 'bg-gray-100 text-gray-600'}`}>
                {s.status?.replace(/_/g,' ')}
              </span>
            </Link>
          ))}
        </div>

        {/* Recent Quotes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-navy">Quote Requests</h2>
            <Link to="/dashboard/quotes" className="text-xs text-gold hover:underline font-semibold">View all →</Link>
          </div>
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No quotes yet</p>
              <Link to="/quote" className="text-gold text-xs font-semibold hover:underline mt-2 inline-block">Get a quote →</Link>
            </div>
          ) : quotes.map((q) => (
            <div key={q._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-mono text-navy font-semibold text-sm">{q.reference || q.quoteNumber}</div>
                <div className="text-gray-400 text-xs">{q.serviceType?.replace(/_/g,' ')} · {q.origin?.country} → {q.destination?.country}</div>
              </div>
              <a href={`http://localhost:5000/api/quotes/${q._id}/pdf`} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#F0A500', fontWeight: 700, textDecoration: 'none', marginRight: 8 }}>⬇ PDF</a>
<span className={`status-badge ${q.status === 'quoted' ? 'bg-green-100 text-green-700' : q.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                {q.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 p-5 card bg-gradient-to-r from-navy to-[#1a3668]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-display font-bold text-white">Need to ship something?</h3>
            <p className="text-white/50 text-sm">Get a free quote in minutes.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/track" className="btn-outline-white text-sm py-2">Track Shipment</Link>
            <Link to="/quote" className="btn-primary text-sm py-2">Get Quote →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
