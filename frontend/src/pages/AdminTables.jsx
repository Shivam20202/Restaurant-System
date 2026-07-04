import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import Popup from '../components/Popup'

const LOCATIONS = ['Main Hall', 'Window', 'Patio', 'Bar', 'Private']

export default function AdminTables() {
  const { user } = useAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [popup, setPopup] = useState({ type: '', message: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [name, setName] = useState('')
  const [seats, setSeats] = useState(4)
  const [location, setLocation] = useState('Main Hall')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const data = await api.getTables()
      setTables(data)
    } catch {
      setTables([])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  function resetForm() {
    setName(''); setSeats(4); setLocation('Main Hall'); setIsActive(true); setEditing(null); setError('')
  }

  function startEdit(t) {
    setEditing(t); setName(t.name); setSeats(t.seats); setLocation(t.location); setIsActive(t.isActive); setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editing) {
        await api.updateTable(editing._id, { name, seats: Number(seats), location, isActive })
        setPopup({ type: 'success', message: 'Table updated successfully.' })
      } else {
        await api.createTable({ name, seats: Number(seats), location, isActive })
        setPopup({ type: 'success', message: 'Table created successfully.' })
      }
      resetForm(); setShowForm(false); load()
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
  }

  async function handleToggleActive(t) {
    try {
      await api.updateTable(t._id, { isActive: !t.isActive })
      setPopup({ type: 'success', message: `Table "${t.name}" ${t.isActive ? 'deactivated' : 'activated'}.` })
      load()
    } catch (err) {
      setPopup({ type: 'error', message: err.message })
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTable(id)
      setPopup({ type: 'success', message: 'Table deleted successfully.' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      setPopup({ type: 'error', message: err.message })
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-neutral-400 animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ type: '', message: '' })} />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Table?</h3>
            <p className="text-sm text-neutral-500 mb-6">Existing reservations will keep their reference but the table will no longer be available for booking.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteTarget)} className="btn-danger flex-1 cursor-pointer">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-2">
        <span className="badge bg-primary-100 text-primary-800 mb-2">Admin Dashboard</span>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-neutral-900">Manage Tables</h1>
            <p className="text-neutral-500 mt-1">{tables.length} tables configured</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary cursor-pointer">Add Table</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Table' : 'Add New Table'}</h2>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="name">Table Name</label>
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Table 9" />
              </div>
              <div>
                <label className="label" htmlFor="seats">Seats</label>
                <input id="seats" type="number" min={1} max={20} required value={seats} onChange={(e) => setSeats(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="location">Location</label>
                <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="input cursor-pointer">
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-neutral-700">Active (available for booking)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 cursor-pointer">{submitting ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn-secondary cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {tables.map((t) => (
          <div key={t._id} className={`card p-5 ${!t.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-neutral-900">{t.name}</h3>
                <p className="text-sm text-neutral-500">{t.location}</p>
              </div>
              <span className={`badge ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {t.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span className="text-sm text-neutral-700">{t.seats} seats</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(t)} className="btn-secondary flex-1 text-sm cursor-pointer">Edit</button>
              <button onClick={() => handleToggleActive(t)} className="btn-ghost text-sm cursor-pointer">{t.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => setDeleteTarget(t._id)} className="btn-ghost text-sm text-red-600 cursor-pointer">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
