// src/components/SuccessModal.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SuccessModal({ show, name, jobTitle, onClose, trackingToken }) {
  if (!show) return null

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content text-center p-5" style={{ borderRadius: 'var(--radius)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
              style={{ width: 80, height: 80, background: '#dcfce7', fontSize: 40 }}>
              ✅
            </div>
          </motion.div>
          <h4 className="fw-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Application Submitted!</h4>
          <p className="text-muted mb-3">
            Thank you, <strong>{name}</strong>! Your application for <strong>{jobTitle}</strong> has been received.
            We'll be in touch within 5–10 business days.
          </p>
          {trackingToken && (
            <div className="alert alert-info mb-4 text-start" style={{ fontSize: '0.9rem', borderRadius: 'var(--radius)' }}>
              <strong>🔍 Track your application</strong><br />
              <Link to={`/track/${trackingToken}`} className="text-primary fw-semibold" onClick={onClose}>
                View your application status →
              </Link>
            </div>
          )}
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/" className="btn btn-primary" onClick={onClose}>Apply for Another Position</Link>
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
