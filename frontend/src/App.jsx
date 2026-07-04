import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Reserve from './pages/Reserve'
import MyReservations from './pages/MyReservations'
import AdminReservations from './pages/AdminReservations'
import AdminTables from './pages/AdminTables'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reserve" element={<ProtectedRoute customerOnly><Reserve /></ProtectedRoute>} />
            <Route path="/my-reservations" element={<ProtectedRoute customerOnly><MyReservations /></ProtectedRoute>} />
            <Route path="/admin/reservations" element={<ProtectedRoute adminOnly><AdminReservations /></ProtectedRoute>} />
            <Route path="/admin/tables" element={<ProtectedRoute adminOnly><AdminTables /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-neutral-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-neutral-400">
            Shivam Resaturant · Restaurant Reservation System
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
