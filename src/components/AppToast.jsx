import { useEffect } from 'react'

function AppToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(timeout)
  }, [toast, onClose])

  if (!toast) return null

  const success = toast.type === 'success'

  return (
    <div className="toast-container position-fixed top-0 end-0 p-4 z-3">
      <div className={`toast show border-0 text-white ${success ? 'bg-success' : 'bg-danger'}`} role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex align-items-center">
          <div className="toast-body d-flex align-items-center gap-2 fw-semibold flex-grow-1">
            <i className={`bi ${success ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} />
            <span>{toast.message}</span>
          </div>
          <button className="btn-close btn-close-white me-3" type="button" onClick={onClose} aria-label="Close notification" />
        </div>
      </div>
    </div>
  )
}

export default AppToast
