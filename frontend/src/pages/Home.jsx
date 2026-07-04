import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Home() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?auto=compress&cs=tinysrgb&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-primary-400 font-medium mb-3 tracking-wide uppercase text-sm">Fine Dining · Reservations</p>
            <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6">
              An unforgettable experience, one table at a time.
            </h1>
            <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
              Reserve your table at Saveur in seconds. Browse available seating, pick your time, and we'll handle the rest.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                isAdmin ? (
                  <Link to="/admin/reservations" className="btn-primary text-base px-7 py-3">Go to Dashboard</Link>
                ) : (
                  <Link to="/reserve" className="btn-primary text-base px-7 py-3">Book a Table</Link>
                )
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base px-7 py-3">Get Started</Link>
                  <Link to="/login" className="btn-primary bg-white/10 text-white border border-white/20 hover:bg-white/20 text-base px-7 py-3">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-neutral-900 mb-3">Why dine with us?</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">A seamless reservation experience designed around you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" title="Real-time Availability" desc="See which tables are free the moment you pick a date and time. No double bookings, ever." />
          <Feature icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" title="Easy Management" desc="View, modify, or cancel your reservations anytime. Admins get a full dashboard to oversee everything." />
          <Feature icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" title="Premium Experience" desc="Add special requests, choose your preferred seating area, and let our team take care of the rest." />
        </div>
      </section>

      <section className="bg-primary-50 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">Ready to book your table?</h2>
          <p className="text-neutral-600 mb-8">Join Saveur and reserve in under a minute.</p>
          {user ? (
            isAdmin ? (
              <Link to="/admin/reservations" className="btn-primary text-base px-8 py-3">Go to Admin Dashboard</Link>
            ) : (
              <Link to="/reserve" className="btn-primary text-base px-8 py-3">Make a Reservation</Link>
            )
          ) : (
            <Link to="/register" className="btn-primary text-base px-8 py-3">Create Free Account</Link>
          )}
        </div>
      </section>
    </div>
  )
}

function Feature({ icon, title, desc }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-50 flex items-center justify-center">
        <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
      </div>
      <h3 className="font-semibold text-lg text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
