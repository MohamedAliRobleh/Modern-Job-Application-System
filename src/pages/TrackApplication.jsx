import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StatusBadge from '../components/StatusBadge'
import { getApplicationStatus } from '../lib/api'

const STATUS_STEPS = ['New', 'Reviewing', 'Interview', 'Offer']

export default function TrackApplication() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getApplicationStatus(token)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: 640 }}>
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-5">
            <div style={{ fontSize: 48 }}>🔍</div>
            <h4 className="fw-bold mt-3">Application Not Found</h4>
            <p className="text-muted">This tracking link may be invalid or expired.</p>
            <Link to="/" className="btn btn-primary mt-2">View Open Positions</Link>
          </div>
        )}

        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-5">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 72, height: 72, background: 'var(--primary-light)', fontSize: 36 }}>
                📋
              </div>
              <h2 className="fw-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Application Status
              </h2>
              <p className="text-muted">
                {data.full_name} · <strong>{data.job_title}</strong>
              </p>
              <p className="text-muted small">
                Submitted {new Date(data.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="card p-4 mb-4 text-center">
              <div className="text-muted small mb-2">Current Status</div>
              <StatusBadge status={data.status} />
            </div>

            {data.status !== 'Rejected' && (
              <div className="card p-4">
                <div className="d-flex align-items-center justify-content-between position-relative">
                  <div style={{ position: 'absolute', top: 18, left: '12.5%', right: '12.5%', height: 2, background: 'var(--border)', zIndex: 0 }} />
                  {STATUS_STEPS.map((step, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(data.status)
                    const done = i <= currentIdx
                    return (
                      <div key={step} className="d-flex flex-column align-items-center" style={{ zIndex: 1, flex: 1 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: done ? 'var(--primary)' : 'white',
                          border: `2px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: done ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: '0.7rem', marginTop: 6, color: done ? 'var(--primary)' : 'var(--text-muted)', fontWeight: done ? 600 : 400, textAlign: 'center' }}>
                          {step}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="text-center mt-4">
              <Link to="/" className="btn btn-outline-primary btn-sm">View Other Positions</Link>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  )
}
