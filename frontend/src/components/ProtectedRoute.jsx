import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function ProtectedRoute({ children, adminOnly = false, customerOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (customerOnly && isAdmin) {
    return <Navigate to="/admin/reservations" replace />
  }

  return children
}
