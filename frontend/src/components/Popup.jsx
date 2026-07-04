import { useEffect } from 'react'

export default function Popup({ type, message, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  const isError = type === 'error'
  const isSuccess = type === 'success'

  return (
    <div className="fixed top-20 right-4 z-[60] animate-scale-in">
      <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border max-w-sm ${isError ? 'bg-red-50 border-red-200' : isSuccess ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isError ? 'bg-red-100' : isSuccess ? 'bg-green-100' : 'bg-neutral-100'}`}>
          {isError ? (
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : isSuccess ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${isError ? 'text-red-800' : isSuccess ? 'text-green-800' : 'text-neutral-800'}`}>
            {isError ? 'Booking Error' : isSuccess ? 'Success' : 'Notice'}
          </p>
          <p className={`text-sm mt-0.5 ${isError ? 'text-red-600' : isSuccess ? 'text-green-600' : 'text-neutral-600'}`}>
            {message}
          </p>
        </div>
        <button onClick={onClose} className={`flex-shrink-0 ${isError ? 'text-red-400 hover:text-red-600' : isSuccess ? 'text-green-400 hover:text-green-600' : 'text-neutral-400 hover:text-neutral-600'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  )
}
