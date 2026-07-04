import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register({ name, email, password, role })
      navigate(user.role === 'admin' ? '/admin/reservations' : '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-primary-700 mb-2">Saveur</h1>
          <p className="text-neutral-500">Create your account to start booking</p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold mb-6">Create account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={1} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Create Password" />
            </div>
            <div>
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${role === 'customer' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500' : 'border-neutral-300 bg-white hover:border-primary-400'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="font-medium text-neutral-900">Customer</span>
                  </div>
                  <p className="text-xs text-neutral-500">Book and manage your reservations</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${role === 'admin' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500' : 'border-neutral-300 bg-white hover:border-primary-400'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span className="font-medium text-neutral-900">Admin</span>
                  </div>
                  <p className="text-xs text-neutral-500">Manage all reservations and tables</p>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full cursor-pointer">
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
