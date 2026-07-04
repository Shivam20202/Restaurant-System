import { Link, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'


export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  useEffect(() => {
  function handleClickOutside(event) {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-primary-700">Shivam</span>
            {isAdmin && (
              <span className="badge bg-primary-100 text-primary-800  hidden sm:inline-flex">Admin</span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              {!isAdmin && (
                <>
                  <Link to="/reserve" className="btn-ghost hidden sm:inline-flex">Reserve</Link>
                  <Link to="/my-reservations" className="btn-ghost hidden sm:inline-flex">My Reservations</Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/reservations" className="btn-ghost hidden sm:inline-flex text-primary-700">Reservations</Link>
                  <Link to="/admin/tables" className="btn-ghost hidden sm:inline-flex text-primary-700">Tables</Link>
                </>
              )}

              <div ref={menuRef} className="relative ml-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 cursor-pointer rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700">{user.name}</span>
                </button>

                {menuOpen && (
                  <>
                  
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20 animate-scale-in">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        <span className={`badge mt-1 ${isAdmin ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100 text-neutral-600'}`}>
                          {isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                      {!isAdmin && (
                        <>
                          <Link to="/reserve" onClick={() => setMenuOpen(false)} className="sm:hidden block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Reserve</Link>
                          <Link to="/my-reservations" onClick={() => setMenuOpen(false)} className="sm:hidden block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Reservations</Link>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <Link to="/admin/reservations" onClick={() => setMenuOpen(false)} className="sm:hidden block px-4 py-2 text-sm text-primary-700 hover:bg-neutral-50">All Reservations</Link>
                          <Link to="/admin/tables" onClick={() => setMenuOpen(false)} className="sm:hidden block px-4 py-2 text-sm text-primary-700 hover:bg-neutral-50">Manage Tables</Link>
                        </>
                      )}
                      <button onClick={() => { setMenuOpen(false); handleLogout() }} className="w-full text-left px-4 py-2 cursor-pointer text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary">Sign In</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
