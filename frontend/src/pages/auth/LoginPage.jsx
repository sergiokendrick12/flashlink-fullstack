// LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email, password }) => {
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-navy to-[#071528] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 pattern-bg" />
        <div className="relative z-10 text-center">
          <Link to="/" className="flex items-center gap-2.5 justify-center mb-12">
            <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center font-display font-black text-navy text-lg">FL</div>
            <span className="font-display font-extrabold text-3xl text-white">Flash<span className="text-gold">Link</span></span>
          </Link>
          <div className="text-8xl mb-6">🚢</div>
          <h2 className="font-display font-extrabold text-white text-3xl mb-3">Africa's Logistics<br />Platform</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">Track shipments, request quotes, and manage your logistics operations — all from one place.</p>
          <div className="flex justify-center gap-8 mt-10">
            {[['40+', 'Countries'], ['12K+', 'Specialists'], ['18', 'Ports']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-display font-extrabold text-gold text-xl">{n}</div>
                <div className="text-white/40 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center font-display font-black text-navy">FL</div>
              <span className="font-display font-extrabold text-2xl text-navy">Flash<span className="text-gold">Link</span></span>
            </Link>
          </div>

          <h1 className="font-display font-extrabold text-navy text-3xl mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your FlashLink account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
              <input type="email" className="input-field"
                placeholder="you@company.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-gold hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
              {isSubmitting ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold font-semibold hover:underline">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
