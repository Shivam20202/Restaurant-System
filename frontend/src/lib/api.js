const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Tables
  getTables: () => request('/tables'),
  createTable: (body) => request('/tables', { method: 'POST', body: JSON.stringify(body) }),
  updateTable: (id, body) => request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTable: (id) => request(`/tables/${id}`, { method: 'DELETE' }),

  // Reservations
  getReservations: (date) => request(`/reservations${date ? `?date=${date}` : ''}`),
  getAvailability: (date) => request(`/reservations/availability?date=${date}`),
  createReservation: (body) => request('/reservations', { method: 'POST', body: JSON.stringify(body) }),
  updateReservation: (id, body) => request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReservation: (id) => request(`/reservations/${id}`, { method: 'DELETE' }),
}
