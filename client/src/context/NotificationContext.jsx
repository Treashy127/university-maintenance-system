import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const showToast = useCallback((message, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl)
  }, [])

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve })
    })
  }, [])

  const handleConfirm = (result) => {
    if (confirmState && typeof confirmState.resolve === 'function') {
      confirmState.resolve(result)
    }
    setConfirmState(null)
  }

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast container */}
      <div className="fixed right-4 bottom-4 flex flex-col gap-3 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full px-4 py-2 rounded-lg shadow-lg text-white flex items-center justify-between gap-3 ${
              t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-sky-500'
            }`}
          >
            <div className="text-sm font-medium">{t.message}</div>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold text-slate-900">Confirm action</h3>
            <p className="mt-3 text-slate-700">{confirmState.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => handleConfirm(false)} className="px-4 py-2 rounded-md bg-slate-200">Cancel</button>
              <button onClick={() => handleConfirm(true)} className="px-4 py-2 rounded-md bg-red-600 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)

export default NotificationContext
