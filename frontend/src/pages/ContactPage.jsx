// ContactPage.jsx
import { useForm } from 'react-hook-form'
import { contactAPI } from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await contactAPI.submit(data)
      toast.success("Message sent! We'll be in touch within 24 hours.")
      reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  return (
    <div>
      <div className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="section-tag text-gold">Get In Touch</span>
          <h1 className="font-display font-extrabold text-white text-4xl md:text-5xl">Contact Us</h1>
          <p className="text-white/50 mt-3 text-lg">Our team is ready to help with your logistics needs</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-3 gap-10">
        {/* Info */}
        <div>
          <h2 className="font-display font-bold text-navy text-xl mb-6">Get in touch</h2>
          <div className="space-y-5">
            {[
              { icon: MapPin, title: 'Headquarters', text: 'Kigali Innovation City\nKG 7 Ave, Kigali, Rwanda' },
              { icon: Phone,  title: 'Phone',        text: '+250 788 000 000' },
              { icon: Mail,   title: 'Email',        text: 'info@flashlink.com' },
              { icon: Clock,  title: 'Business Hours', text: 'Mon–Fri: 8am – 6pm EAT' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="font-bold text-navy text-sm">{title}</p>
                  <p className="text-gray-400 text-sm whitespace-pre-line">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 card p-8">
          <h2 className="font-display font-bold text-navy text-xl mb-6">Send us a message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Name *</label>
                <input className="input-field" placeholder="Your name" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Email *</label>
                <input type="email" className="input-field" placeholder="you@company.com" {...register('email', { required: true })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Phone</label>
                <input className="input-field" placeholder="+250 xxx xxx" {...register('phone')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Company</label>
                <input className="input-field" placeholder="Your company" {...register('company')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Subject *</label>
              <input className="input-field" placeholder="How can we help?" {...register('subject', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Message *</label>
              <textarea rows={5} className="input-field resize-none" placeholder="Describe your logistics needs..."
                {...register('message', { required: true })} />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
              {isSubmitting ? 'Sending...' : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
