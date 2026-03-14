// QuotePage.jsx — Multi-step quote wizard
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { quotesAPI } from '../services/api'
import toast from 'react-hot-toast'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const services = ['sea_freight','air_freight','road_freight','rail_freight','port_handling','customs_clearance','warehousing','multimodal']
const serviceLabels = { sea_freight:'Sea Freight',air_freight:'Air Freight',road_freight:'Road Freight',rail_freight:'Rail Freight',port_handling:'Port Handling',customs_clearance:'Customs Clearance',warehousing:'Warehousing',multimodal:'Multimodal' }

const steps = ['Service', 'Route', 'Cargo', 'Contact']

export default function QuotePage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [quoteRef, setQuoteRef] = useState('')
  const { user } = useAuth()
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm()
  const selectedService = watch('serviceType')

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const onSubmit = async (data) => {
    try {
      const { data: res } = await quotesAPI.create(data)
      setQuoteRef(res.data.reference)
      setSubmitted(true)
      toast.success('Quote request submitted!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="font-display font-bold text-navy text-2xl mb-2">Quote Request Submitted!</h2>
        <p className="text-gray-400 text-sm mb-3">Your reference number:</p>
        <div className="font-mono font-bold text-gold text-xl bg-gold/10 rounded-lg px-5 py-3 mb-5">{quoteRef}</div>
        <p className="text-gray-400 text-sm mb-6">Our team will review your request and respond within 24 hours.</p>
        <div className="flex gap-3 justify-center">
          <a href="/" className="btn-outline">Back to Home</a>
          <a href="/dashboard/quotes" className="btn-primary">View Quotes →</a>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="bg-navy py-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <span className="section-tag text-gold">Free Quote</span>
          <h1 className="font-display font-extrabold text-white text-4xl">Request a Quote</h1>
          <p className="text-white/50 mt-2">Get a tailored logistics quote within 24 hours</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-gold text-navy' : 'bg-gray-200 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${i === step ? 'font-bold text-navy' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} style={{minWidth:'2rem'}} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-6 min-h-[320px]">
            {/* Step 0: Service */}
            {step === 0 && (
              <div>
                <h2 className="font-display font-bold text-navy text-xl mb-4">Select Service Type</h2>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(s => (
                    <label key={s} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedService === s ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" value={s} {...register('serviceType', { required: true })} className="hidden" />
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedService === s ? 'border-gold bg-gold' : 'border-gray-300'}`} />
                      <span className="text-sm font-medium text-navy">{serviceLabels[s]}</span>
                    </label>
                  ))}
                </div>
                {errors.serviceType && <p className="text-red-500 text-xs mt-2">Please select a service</p>}
              </div>
            )}

            {/* Step 1: Route */}
            {step === 1 && (
              <div>
                <h2 className="font-display font-bold text-navy text-xl mb-4">Origin & Destination</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Origin City *</label>
                    <input className="input-field" placeholder="e.g. Nairobi" {...register('origin.city', { required: true })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Origin Country *</label>
                    <input className="input-field" placeholder="e.g. Kenya" {...register('origin.country', { required: true })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Destination City *</label>
                    <input className="input-field" placeholder="e.g. Lagos" {...register('destination.city', { required: true })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Destination Country *</label>
                    <input className="input-field" placeholder="e.g. Nigeria" {...register('destination.country', { required: true })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-navy mb-1.5">Preferred Date</label>
                    <input type="date" className="input-field" {...register('preferredDate')} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Cargo */}
            {step === 2 && (
              <div>
                <h2 className="font-display font-bold text-navy text-xl mb-4">Cargo Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Cargo Description *</label>
                    <textarea rows={2} className="input-field resize-none" placeholder="Describe your goods..."
                      {...register('cargo.description', { required: true })} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Weight (kg)</label>
                      <input type="number" className="input-field" placeholder="0" {...register('cargo.weight')} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Volume (m³)</label>
                      <input type="number" className="input-field" placeholder="0" {...register('cargo.volume')} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Quantity</label>
                      <input type="number" className="input-field" placeholder="0" {...register('cargo.quantity')} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1.5">Additional Notes</label>
                    <textarea rows={2} className="input-field resize-none" placeholder="Any special requirements?"
                      {...register('additionalNotes')} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact (for guests only) */}
            {step === 3 && (
              <div>
                <h2 className="font-display font-bold text-navy text-xl mb-4">Your Contact Details</h2>
                {user ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-navy">Logged in as {user.firstName} {user.lastName}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1.5">Name *</label>
                        <input className="input-field" {...register('guestInfo.name', { required: !user })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1.5">Email *</label>
                        <input type="email" className="input-field" {...register('guestInfo.email', { required: !user })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1.5">Phone</label>
                        <input className="input-field" {...register('guestInfo.phone')} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1.5">Company</label>
                        <input className="input-field" {...register('guestInfo.company')} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-5">
            <button type="button" onClick={prevStep} disabled={step === 0}
              className="btn-outline disabled:opacity-30">
              <ArrowLeft size={16} /> Back
            </button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : <>Submit Quote <ArrowRight size={16} /></>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
