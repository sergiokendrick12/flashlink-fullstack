// ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async ({ email }) => {
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center font-display font-black text-navy">FL</div>
          <span className="font-display font-extrabold text-xl text-navy">Flash<span className="text-gold">Link</span></span>
        </Link>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-display font-bold text-navy text-xl mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm">We sent a password reset link to your email address.</p>
            <Link to="/login" className="btn-primary mt-6 justify-center">Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display font-bold text-navy text-2xl mb-1">Forgot Password?</h1>
            <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Email Address</label>
                <input type="email" className="input-field" placeholder="you@company.com"
                  {...register('email', { required: true })} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3.5">
                {isSubmitting ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-4">
              <Link to="/login" className="text-gold hover:underline">← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
