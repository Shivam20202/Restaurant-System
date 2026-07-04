import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import Popup from '../components/Popup'

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-neutral-100 text-neutral-600',
  no_show: 'bg-amber-100 text-amber-700',
}

const STATUSES = ['confirmed', 'completed', 'no_show', 'cancelled']

export default function AdminReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [popup, setPopup] = useState({ type: '', message: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const data = await api.getReservations(dateFilter || undefined)
      setReservations(data)
    } catch {
      setReservations([])
    }
    setLoading(false)
  }, [dateFilter, user])

  useEffect(() => { load() }, [load])

  async function handleStatusChange(id, status) {
    setUpdatingId(id)
    try {
      await api.updateReservation(id, { status })
      setPopup({ type: 'success', message: `Reservation status updated to "${status.replace('_', ' ')}".` })
      load()
    } catch (err) {
      setPopup({ type: 'error', message: err.message })
    }
    setUpdatingId(null)
  }

  async function handleDelete(id) {
    try {
      await api.deleteReservation(id)
      setPopup({ type: 'success', message: 'Reservation deleted successfully.' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      setPopup({ type: 'error', message: err.message })
    }
  }

  const filtered = reservations.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.guestName?.toLowerCase().includes(q) ||
        r.userName?.toLowerCase().includes(q) ||
        r.userEmail?.toLowerCase().includes(q) ||
        r.tableName?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-neutral-400 animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ type: '', message: '' })} />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Reservation?</h3>
            <p className="text-sm text-neutral-500 mb-6">This action cannot be undone. The reservation will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteTarget)} className="btn-danger flex-1 cursor-pointer">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-2">
        <span className="badge bg-primary-100 text-primary-800 mb-2">Admin Dashboard</span>
        <h1 className="font-display text-3xl font-bold text-neutral-900">All Reservations</h1>
        <p className="text-neutral-500 mt-1">Manage and track all restaurant bookings</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        <StatCard label="Total" value={stats.total} color="neutral" />
        <StatCard label="Confirmed" value={stats.confirmed} color="green" />
        <StatCard label="Completed" value={stats.completed} color="blue" />
        <StatCard label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="Search by guest, email, or table…" value={search} onChange={(e) => setSearch(e.target.value)} className="input flex-1" />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input sm:w-44 cursor-pointer" />
        {dateFilter && <button onClick={() => setDateFilter('')} className="btn-secondary cursor-pointer">Clear date</button>}
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input sm:w-48 cursor-pointer">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-neutral-500">No reservations found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Table</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Party</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{r.guestName || r.userName || '—'}</p>
                      <p className="text-xs text-neutral-500">{r.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-900">{r.tableName}</p>
                      <p className="text-xs text-neutral-500">{r.tableLocation}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-900">{new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-neutral-500">{r.time}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{r.partySize}</td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        disabled={updatingId === r._id}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${STATUS_STYLES[r.status]}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteTarget(r._id)} className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = { neutral: 'text-neutral-900', green: 'text-green-600', blue: 'text-blue-600', red: 'text-red-600' }
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}
