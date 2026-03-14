// RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await authRegister(data)
      toast.success('Account created! Welcome to FlashLink 🚀')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-navy p-8 text-center">
          <Link to="/" className="flex items-center gap-2 justify-center mb-2">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-display font-black text-navy">FL</div>
            <span className="font-display font-extrabold text-2xl text-white">Flash<span className="text-gold">Link</span></span>
          </Link>
          <p className="text-white/50 text-sm mt-2">Create your account</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">First Name</label>
                <input className="input-field" placeholder="John"
                  {...register('firstName', { required: 'Required' })} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Last Name</label>
                <input className="input-field" placeholder="Doe"
                  {...register('lastName', { required: 'Required' })} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
              <input type="email" className="input-field" placeholder="you@company.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Phone</label>
                <input className="input-field" placeholder="+250 xxx xxx xxx"
                  {...register('phone')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Company</label>
                <input className="input-field" placeholder="Your company"
                  {...register('company')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Min. 8 characters"
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
              {isSubmitting ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account? <Link to="/login" className="text-gold font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
