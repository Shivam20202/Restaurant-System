import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import Popup from '../components/Popup'

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-neutral-100 text-neutral-600',
  no_show: 'bg-amber-100 text-amber-700',
}

export default function MyReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [popup, setPopup] = useState({ type: '', message: '' })

  const load = useCallback(async () => {
    if (!user) return
    try {
      const data = await api.getReservations()
      setReservations(data)
    } catch {
      setReservations([])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  async function handleCancel(id) {
    setCancellingId(id)
    try {
      await api.updateReservation(id, { status: 'cancelled' })
      setPopup({ type: 'success', message: 'Reservation cancelled successfully.' })
      load()
    } catch (err) {
      setPopup({ type: 'error', message: err.message })
    }
    setCancellingId(null)
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-neutral-400 animate-pulse">Loading…</div>
  }

  const now = new Date()
  const upcoming = reservations.filter((r) => r.status === 'confirmed' && new Date(`${r.date}T${r.time}`) >= now)
  const past = reservations.filter((r) => !(r.status === 'confirmed' && new Date(`${r.date}T${r.time}`) >= now))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ type: '', message: '' })} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">My Reservations</h1>
          <p className="text-neutral-500 mt-1">{reservations.length} total</p>
        </div>
        <Link to="/reserve" className="btn-primary">New Reservation</Link>
      </div>

      {reservations.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-neutral-500 mb-4">You haven't made any reservations yet, {user?.name}.</p>
          <Link to="/reserve" className="btn-primary">Book a Table</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-neutral-700 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((r) => (
                  <ReservationCard key={r._id} r={r} onCancel={handleCancel} cancelling={cancellingId === r._id} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-neutral-700 mb-3">History</h2>
              <div className="space-y-3">
                {past.map((r) => (
                  <ReservationCard key={r._id} r={r} onCancel={handleCancel} cancelling={cancellingId === r._id} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function ReservationCard({ r, onCancel, cancelling }) {
  const dateObj = new Date(`${r.date}T${r.time}`)
  const canCancel = r.status === 'confirmed' && dateObj >= new Date()

  return (
    <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary-50 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-primary-600 uppercase">{dateObj.toLocaleDateString('en', { month: 'short' })}</span>
          <span className="text-xl font-bold text-primary-700">{dateObj.getDate()}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-neutral-900">{r.tableName || 'Table'}</h3>
            <span className={`badge ${STATUS_STYLES[r.status]}`}>{r.status.replace('_', ' ')}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            {dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} at {r.time}
          </p>
          <p className="text-sm text-neutral-500">
            {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'} · {r.tableLocation}
          </p>
          {r.specialRequest && <p className="text-sm text-neutral-400 mt-1 italic">"{r.specialRequest}"</p>}
        </div>
      </div>
      {canCancel && (
        <button onClick={() => onCancel(r._id)} disabled={cancelling} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
          {cancelling ? 'Cancelling…' : 'Cancel'}
        </button>
      )}
    </div>
  )
}
