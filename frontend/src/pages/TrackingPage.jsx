// TrackingPage.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { shipmentsAPI } from '../services/api'
import { Search, Package, MapPin, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const statusSteps = ['pending','confirmed','in_transit','at_port','customs_clearance','out_for_delivery','delivered']
const statusLabels = { pending:'Pending',confirmed:'Confirmed',in_transit:'In Transit',at_port:'At Port',customs_clearance:'Customs',out_for_delivery:'Out for Delivery',delivered:'Delivered' }

export default function TrackingPage() {
  const [searchParams] = useSearchParams()
  const [ref, setRef] = useState(searchParams.get('ref') || '')
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (searchParams.get('ref')) handleTrack(null, searchParams.get('ref'))
  }, [])

  const handleTrack = async (e, r) => {
    if (e) e.preventDefault()
    const trackRef = r || ref
    if (!trackRef.trim()) return toast.error('Enter a tracking number')
    setLoading(true); setSearched(true)
    try {
      const { data } = await shipmentsAPI.track(trackRef.trim())
      setShipment(data.data)
    } catch {
      setShipment(null)
      toast.error('Shipment not found')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = shipment ? statusSteps.indexOf(shipment.status) : -1

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <span className="section-tag text-gold">Shipment Tracking</span>
          <h1 className="font-display font-extrabold text-white text-4xl mb-3">Track Your Shipment</h1>
          <p className="text-white/50 mb-8">Enter your FlashLink tracking number to see real-time updates</p>
          <form onSubmit={handleTrack} className="flex gap-0">
            <input value={ref} onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. FLABC123XYZ"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-5 py-4 text-sm rounded-l-xl focus:outline-none focus:border-gold" />
            <button type="submit" disabled={loading}
              className="bg-gold text-navy font-bold px-6 rounded-r-xl hover:bg-gold-light transition-colors flex items-center gap-2">
              <Search size={18} /> {loading ? '...' : 'Track'}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {searched && !loading && !shipment && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-display font-bold text-navy text-xl mb-2">Shipment Not Found</h3>
            <p className="text-gray-400 text-sm">Check your tracking number and try again.</p>
          </div>
        )}

        {shipment && (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="card p-6">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Tracking Number</p>
                  <h2 className="font-mono font-extrabold text-navy text-2xl">{shipment.trackingNumber}</h2>
                  <p className="text-gray-500 text-sm mt-1">{shipment.cargo?.description}</p>
                </div>
                <span className={`status-badge text-sm px-4 py-2 ${shipment.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {statusLabels[shipment.status] || shipment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
                    <MapPin size={12} /> Origin
                  </div>
                  <div className="font-bold text-navy">{shipment.origin?.city}</div>
                  <div className="text-gray-400 text-xs">{shipment.origin?.country}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
                    <MapPin size={12} /> Destination
                  </div>
                  <div className="font-bold text-navy">{shipment.destination?.city}</div>
                  <div className="text-gray-400 text-xs">{shipment.destination?.country}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {statusSteps.map((s, i) => (
                    <div key={s} className={`flex flex-col items-center ${i <= currentStep ? 'text-navy' : 'text-gray-300'}`} style={{ width: `${100/statusSteps.length}%` }}>
                      <div className={`w-4 h-4 rounded-full z-10 relative ${i < currentStep ? 'bg-green-500' : i === currentStep ? 'bg-gold' : 'bg-gray-200'}`} />
                      <span className="text-xs mt-1 text-center hidden md:block" style={{ fontSize: '9px' }}>{statusLabels[s]}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" style={{ zIndex: 0 }}>
                  <div className="h-full bg-gold transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-navy mb-4">Tracking History</h3>
              <div className="space-y-4">
                {[...(shipment.trackingHistory || [])].reverse().map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-gold' : 'bg-gray-100'}`}>
                        {i === 0 ? <CheckCircle size={16} className="text-navy" /> : <Clock size={14} className="text-gray-400" />}
                      </div>
                      {i < (shipment.trackingHistory.length - 1) && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-navy text-sm">{statusLabels[event.status] || event.status}</p>
                      <p className="text-gray-400 text-xs">{event.location} · {event.description}</p>
                      <p className="text-gray-300 text-xs mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
